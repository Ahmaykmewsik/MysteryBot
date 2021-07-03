const UtilityFunctions = require('../../utilities/UtilityFunctions');

const createChannels = require('../../utilities/createChannels.js').createChannels;
const sendPassMessages = require('../../utilities/sendPassMessages.js').sendPassMessages;

module.exports = {
    name: 'nextphase',
    description: 'Progresses the phase. Moves all players based on their movement actions and creates new gameplay channels. If you\'re in a hurry, use `!nextphase y` to bypass the prompt (not recommended).',
    format: "!moveplayers",
    gmonly: true,
    execute(client, message, args) {

        let settings = UtilityFunctions.GetSettings(client, message.guild.id);
        if (!settings.phase)
            return message.channel.send("You need to start the game first with !gamestart. (Aborting)");

        let areas = client.getAreas.all(message.guild.id);
        if (areas == undefined || areas.length === 0)
            return message.channel.send("Where the hell are your areas? (Aborting)");

        let locations = client.getLocations.all(message.guild.id);
        let gameplayChannels = client.getGameplayChannels.all(message.guild.id);
        let connections = client.getAllConnections.all(message.guild.id);

        const lonelyPlayers = client.getPlayersWithoutLocation.all(message.guild.id);
        if (lonelyPlayers.length > 0)
            return message.channel.send("The following players do not have an area set:\n"
                + "`" + lonelyPlayers.map(p => p.username).join('\n') + "`"
                + "\nAborting game start.");

        let players = client.getPlayers.all(message.guild.id);
        if (players == undefined || players.length === 0)
            return message.channel.send("Umm....not sure how to say this...but your game doesn't have any players? How the hell did you mess up this bad????? (Aborting).");

        let warningMessage = "";
        var nonDoers = players.filter(p => !p.action && p.alive);
        if (nonDoers.length > 0) {
            warningMessage += "The following players have not sent their main **action**:\n"
                + "`" + nonDoers.map(p => p.username).join('\n') + "`"
                + "\n";
        } else {
            warningMessage += "All players have sent in their main **actions**.\n";
        }

        var nonMovers = players.filter(p => !p.move && p.alive);
        if (nonMovers.length > 0) {
            warningMessage += "The following players have not sent their **movement** action:\n"
                + "`" + nonMovers.map(p => p.username).join('\n') + "`"
                + "\n";
        } else {
            warningMessage += "All players have sent in their **movement**.\n";
        }

        //Check that we aren't going to overflow the category
        //If it will, create new category
        // var channelTotal = 0;
        // var newAreas = 0;
        // const categoryObject = message.guild.channels.find(c => c.name == settings.categoryName);

        // categoryObject.children.forEach(c => {
        //     channelTotal++;
        // });
        // areas.forEach(area => {
        //     //This is an overestimate since it also includes areas with
        //     //dead players that are not created
        //     if (area.playersPresent.length > 0) {
        //         newAreas++;
        //     }
        // });
        // if (channelTotal + newAreas > 50) {
        //     console.log("Hammer time.");
        //     //clone category and set as new active category
        //     newName = category.name;
        //     category.num++;
        //     if (category.num == 1) {
        //         categoryObject.name += " (1)";
        //         newName += " (2)";
        //     } else {
        //         newName = newName.split(" (" + (category.num - 1) + ")")[0] + " (" + category.num + ")";
        //     }
        //     categoryObject.clone({ name: newName })
        //         .then((categoryObjectNew) => {
        //             category = {
        //                 id: categoryObjectNew.id,
        //                 name: newName,
        //                 num: category.num
        //             };

        //             client.data.set("CATEGORY_DATA", category);
        //         })
        //         .catch(console.error);;
        // }

        //Do it immediatley if they put a y
        if (args.includes("y")) return NextPhase();

        warningMessage += "Are you sure you would like to proceed with the phase rollover? (y/n)";
        return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, NextPhase);

        async function NextPhase() {
            message.channel.send("Beginning Phase " + (settings.phase + 1) + "...");

            let returnMessage = "";

            //Deactivate all spy Actions during rollover
            await client.deactivateAllSpyActions.run();

            //Send DMs to players that pass each other on the map
            returnMessage += sendPassMessages(message.guild.members.cache, players, locations, message.channel) + `\n`;

            //Give movement actions to players who didn't send in movement
            players.forEach(player => {

                player.forceMoved = 0;

                let playerLocation = locations.find(l => l.username == player.username);

                if (!playerLocation) return;

                //if player didnt' submit movement:
                if (player.move) return;

                //check if they can stay still
                const canStayStill = connections.find(c => c.area1 == playerLocation.areaID && c.area2 == playerLocation.areaID);
                if (!canStayStill) {
                    // if the player can't stay still, they move at random
                    const reachable = client.getConnections(playerLocation.areaID, message.guild.id);
                    var randomIndex = Math.floor(Math.random() * reachable.length);
                    player.move = reachable[randomIndex];
                } else {
                    player.move = playerLocation.areaID;
                }
            });

            //Post messages on where people are going
            //If players can go here normally, post where they went
            //If a player goes somewhere sneaky sneaky, don't tell nuthin
            areas.forEach(area => {

                const locationsHere = locations.filter(l => l.areaID == area.id);
                if (locationsHere.length == 0) return;
                let movementMessage = "";
                for (location of locationsHere) {
                    //find player (will need adjustment if multi-area mode is implemented)
                    let player = players.find(p => p.username == location.username);
                    const connectionExists = connections.find(c => c.area1 == location.areaID && c.area2 == player.move);
                    movementMessage += (connectionExists) ?
                        `${player.character} moved to ${location.areaID}\n` :
                        `${player.character} moved to ???\n`;
                }

                //get current channel 
                //If can't find the channel, tell the GM (it might not exist or something else went wrong)
                const gameplayChannelData = gameplayChannels.find(c => c.channelName == "p" + settings.phase + "-" + area.id);
                const gameplayChannel = client.channels.cache.get(gameplayChannelData.channelID);

                try {
                    gameplayChannel.send(movementMessage);
                } catch (error) {
                    console.error(error);
                    returnMessage += `:warning: Could not post movement messeges in \`${area.id}\`\n`;
                }

            })

            //Move the player
            players.forEach(player => {

                let playerLocation = locations.find(l => l.username == player.username);
                playerLocation.areaID = player.move; //moves the player

                //reset movement and actions
                player.move = undefined;
                player.moveSpecial = undefined;
                player.action = undefined;
                player.roll = undefined;
                player.forceMoved = 0;
            });

            //Iterate Phase
            settings.phase += 1;

            client.channels.cache.get(settings.actionLogID).send(`--------------------------------------------------------\n---------------------**PHASE ${settings.phase}**------------------------\n--------------------------------------------------------`);

            //CreateChannels
            try {
                await createChannels(client, message, areas, players, locations, settings);

                //Update Database
                client.setSettings.run(settings);
                players.forEach(p => {client.setPlayer.run(p)});
                locations.forEach(l => {client.setLocation.run(l)});
                gameplayChannels.forEach(g => {
                    g.active = 0;
                    client.setGameplayChannel.run(g);
                })

                returnMessage += "Phase processed successfully. Phase " + settings.phase + " has begun!";

            } catch (error) {
                console.error(error);
                message.channel.send(`WARNING: Something went wrong in the bot during the phase update. You may need to try again. Give this info to Ahmayk: \`\`\`error\`\`\``, { split: true });
            }

            message.channel.send(returnMessage, {split: true});

        }
    }
}
