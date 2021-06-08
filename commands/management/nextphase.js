const UtilityFunctions = require('../../utilities/UtilityFunctions');

const createChannels = require('../../utilities/createChannels.js').createChannels;
const sendPassMessages = require('../../utilities/sendPassMessages.js').sendPassMessages;

module.exports = {
    name: 'nextphase',
    description: 'Progresses the phase. Moves all players based on their movement actions. Any player without a submitted action either stays still if possible, or moves randomly.',
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
            message.channel.send("The following players have not sent their main **action**:\n"
                + "`" + nonDoers.map(p => p.username).join('\n') + "`"
                + "\n");
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

        warningMessage += "Are you sure you would like to proceed with the movement phase? (y/n)";
        return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, NextPhase);

        function NextPhase() {
            message.channel.send("Beginning Phase " + (settings.phase + 1) + "...");

            //Send DMs to players that pass each other on the map
            const passingMessages = sendPassMessages(message.guild.members.cache, players, locations, message.channel);

            message.channel.send(passingMessages, { split: true });


            //Move players
            players.forEach(player => {

                player.forceMoved = 0;

                let playerLocation = locations.find(l => l.username == player.username);

                if (!playerLocation) return;

                //get current channel   
                const gameplayChannel = gameplayChannels.find(c => c.channelName == "p" + settings.phase + "-" + playerLocation.areaID);

                if (player.move) {
                    // If the player sent movement, then move the player normally
                    const moved = (playerLocation.areaID != player.move) ? true : false;
                    const areaOld = playerLocation.areaID;
                    playerLocation.areaID = player.move; //moves the player

                    //Post about it
                    const connectionExists = connections.find(c => c.area1 == areaOld && c.area2 == player.move);
                    try {
                        if (moved) {
                            if (connectionExists) {
                                //If players can go here normally, post where they went
                                message.guild.channels.cache.get(gameplayChannel.channelID).send(player.character + " moved to: " + player.move).catch(console.error());
                            } else {
                                //If a player goes somewhere sneaky sneaky, don't tell nuthin
                                message.guild.channels.cache.get(gameplayChannel.channelID).send(player.character + " moved to: ???").catch(console.error());
                            }

                        } else {
                            message.guild.channels.cache.get(gameplayChannel.channelID).send(player.character + " stayed here.").catch(console.error);
                        }
                    } catch (error) {
                        //If can't find the channel, tell the GM (it might not exist or something else went wrong)
                        console.error(error);
                        message.channel.send("Could not post movement message for: " + player.username + " to " + areaOld);
                    }

                } else {
                    //if player didnt' submit movement:

                    //check if they can stay still
                    const canStayStill = connections.find(c => c.area1 == playerLocation.areaID && c.area2 == playerLocation.areaID);
                    if (!canStayStill) {
                        // if the player can't stay still, they move at random
                        const reachable = client.getConnections(playerLocation.areaID, message.guild.id);
                        var randomIndex = Math.floor(Math.random() * reachable.length);
                        playerLocation.areaID = reachable[randomIndex];

                    }
                    // otherwise, the player doesn't move
                    try {
                        if (!canStayStill) {
                            message.guild.channels.cache.get(gameplayChannel.channelID).send(player.character + " couldn't decide where to go, so they went to: " + player.area);
                        } else {
                            message.guild.channels.cache.get(gameplayChannel.channelID).send(player.character + " stayed here.");
                        }
                    } catch (error) {
                        message.channel.send("Did not post movement message for: " + player.username);
                    }
                }

                //reset movement and actions
                player.move = undefined;
                player.moveSpecial = undefined;
                player.action = undefined;
                player.roll = undefined;

            });

            //Iterate Phase
            settings.phase += 1;

            client.channels.cache.get(settings.actionLogID).send(`--------------------------------------------------------\n--------------------------**PHASE ${settings.phase}**------------------------------\n--------------------------------------------------------`);

            //CreateChannels
            try {
                createChannels(client, message, areas, players, locations, settings);

                //Set all the data in place after the channels are created!
                message.channel.send("All channels created successfully!");

                client.setSettings.run(settings);

                players.forEach(p => {
                    client.setPlayer.run(p);
                });

                locations.forEach(l => {
                    client.setLocation.run(l);
                });

                gameplayChannels.forEach(g => {
                    g.active = 0;
                    client.setGameplayChannel.run(g);
                })

                message.channel.send("Phase processed successfully. Phase " + settings.phase + " has begun!");

            } catch (error) {
                console.error(error);
                message.channel.send("WARNING: Something went wrong in the bot during the phase update. You may need to try again. Give this info to Ahmayk: \n\n" + error, { split: true });
            }
        }
    }
}
