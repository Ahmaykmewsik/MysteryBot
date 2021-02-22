const updateAvatarsUtil = require('../../utilities/updateAvatarsUtil.js');

const createChannels = require('../../utilities/createChannels.js').createChannels;
const sendPassMessages = require('../../utilities/sendPassMessages.js').sendPassMessages;
const { updateAvatars } = require('../../utilities/updateAvatarsUtil');

module.exports = {
    name: 'nextphase',
    description: 'Progresses the phase. Moves all players based on their movement actions. Any player without a submitted action either stays still if possible, or moves randomly.',
    format: "!moveplayers",
    gmonly: true,
    execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        if (players == undefined) {
            return message.channel.send("No players found. Please set the game up first.");
        }
        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            return message.channel.send("No areas found. Please set the game up first.");
        }
        var phaseCount = client.data.get("PHASE_COUNT");
        if (phaseCount == undefined) {
            return message.channel.send("You need to start the game first with !gamestart.");
        }
        var category = client.data.get("CATEGORY_DATA");
        if (category == undefined) {
            return message.channel.send("You need to name the game! Use !gamename to name the game. (This will set the category name)");
        }
        const actionLogChannelID = client.data.get("ACTION_LOG");
        if (actionLogChannelID == undefined) {
            return message.channel.send("The GM needs to set the action log!");
        }

        const channeldata = client.data.get("CHANNEL_DATA");

        var nonDoers = players.filter(p => (p.action == undefined) && (p.area != undefined));
        if (nonDoers.length > 0) {
            message.channel.send("The following players have not sent their main **action**:\n"
                + "`" + nonDoers.map(p => p.name).join('\n') + "`"
                + "\nIf you proceed, they will do nothing.");
        }

        var nonMovers = players.filter(p => (p.move == undefined) && (p.area != undefined));
        if (nonMovers.length > 0) {
            message.channel.send("The following players have not sent their **movement** action:\n"
                + "`" + nonMovers.map(p => p.name).join('\n') + "`"
                + "\nIf you proceed, they will stay still if possible. Otherwise, they will move at random.");
        }

        //Check that we aren't going to overflow the category
        //If it will, create new category
        var channelTotal = 0;
        var newAreas = 0;
        const categoryObject = message.guild.channels.find(c => c.name == category.name);

        categoryObject.children.forEach(c => {
            channelTotal++;
        });
        areas.forEach(area => {
            //This is an overestimate since it also includes areas with
            //dead players that are not created
            if (area.playersPresent.length > 0) {
                newAreas++;
            }
        });
        if (channelTotal + newAreas > 50) {
            console.log("Hammer time.");
            //clone category and set as new active category
            newName = category.name;
            category.num++;
            if (category.num == 1) {
                categoryObject.name += " (1)";
                newName += " (2)";
            } else {
                newName = newName.split(" (" + (category.num - 1) + ")")[0] + " (" + category.num + ")";
            }
            categoryObject.clone({ name: newName })
                .then((categoryObjectNew) => {
                    category = {
                        id: categoryObjectNew.id,
                        name: newName,
                        num: category.num
                    };

                    client.data.set("CATEGORY_DATA", category);
                })
                .catch(console.error);;
        }

        message.channel.send("Are you sure you would like to proceed with the movement phase?").then(() => {
            updateAvatars(client);

            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {

                        message.channel.send("Beginning Phase " + (phaseCount + 1) + "...");

                        //Send DMs to players that pass each other on the map
                        sendPassMessages(message.guild.members, players, message.channel);

                        //Clear playersPresent data
                        areas.forEach(area => {
                            area.playersPresent = [];
                        });

                        //Move players
                        players.forEach(player => {
                            //Check that the player isn't dead
                            if (player.area != undefined) {

                                if (player.move != undefined) {
                                    // move the player normally
                                    var moved = true;
                                    if (player.area == player.move) {
                                        moved = false;
                                    }

                                    var areaOld;
                                    if (!Array.isArray(player.area)) {
                                        areaOld = [player.area];
                                    } else {
                                        areaOld = player.area;
                                    }

                                    player.area = player.move; //moves the player
                                    //Post about it
                                    areaOld.forEach(area => {
                                        //get current channel
                                        let oldArea = areas.find(a => a.id == area);
                                        const channelID = channeldata["p" + phaseCount + "-" + area];
                                        const playerChannel = message.guild.channels.find(c => c.id == channelID);
                                        if (playerChannel != undefined) {
                                            if (moved) { 
                                                if (oldArea.reachable.find(c=> c==player.area)) {
                                                    //If players can go here normally, post where they went
                                                    playerChannel.send(player.character + " moved to: " + player.area).catch(console.log());
                                                } else {
                                                    //If a player goes somewhere sneaky sneaky, don't tell nuthin
                                                    playerChannel.send(player.character + " moved to: ???").catch(console.log());
                                                }

                                            } else {
                                                playerChannel.send(player.character + " stayed here.").catch(console.log);
                                            }
                                        } else {
                                            //If can't find the channel, tell the GM (it might not exist or something else went wrong)
                                            message.channel.send("Did not post movement message for: " + player.name + " to " + area);
                                        }
                                    });

                                    //if player didnt' submit movement:
                                } else {

                                    let currentArea = areas.find(a => a.id == player.area);
                                    //check that we're not in multi-area mode, cause it doesn't really make sense to post a stay message if we are
                                    if (currentArea != undefined) {
                                        //check if they can stay still
                                        const channelID = channeldata["p" + phaseCount + "-" + player.area];
                                        const playerChannel = message.guild.channels.find(c => c.id == channelID);
                                        if (!currentArea.reachable.includes(currentArea.id)) {
                                            // if the player can't stay still, they move at random
                                            var randomIndex = Math.floor(Math.random() * currentArea.reachable.length);
                                            player.area = currentArea.reachable[randomIndex];
                                            playerChannel.send(player.character + " couldn't decide where to go, so they went to: " + player.area);
                                        }
                                        // otherwise, the player doesn't move
                                        if (playerChannel != undefined) {
                                            playerChannel.send(player.character + " stayed here.");
                                        } else {
                                            message.channel.send("Did not post movement message for: " + player.name + " when no movement action was given");
                                        }
                                    }
                                }

                                //Update Area's "Player Present" value

                                var newarea = [];
                                newarea = areas.filter(a => player.area.includes(a.id));

                                newarea.forEach(a => {
                                    a.playersPresent.push(player.name);
                                });

                                //reset movement and actions
                                player.move = undefined;
                                player.moveSpecial = undefined;
                                player.action = undefined;
                                player.roll = undefined;
                            }
                        });

                        //Iterate Phase
                        phaseCount += 1;

                        client.channels.get(actionLogChannelID).send("--------------------------------------------------------\n-------------------------------------**PHASE " + phaseCount + "**-------------------------------------\n--------------------------------------------------------");

                        //CreateChannels

                        createChannels(client, message.guild, areas, players, category.id, phaseCount);


                        //Updtate data
                        //players are set in createChannels
                        client.data.set("PHASE_COUNT", phaseCount);
                        client.data.set("AREA_DATA", areas);
                        message.channel.send("Phase " + phaseCount + " hase begun.\n" + players.map(player => player.name + ": " + player.area).join('\n'));

                    } else if (messages.first().content == 'n') {
                        message.channel.send("Okay, never mind then :)");
                    } else {
                        message.channel.send("...uh, okay.");
                    }
                })
                .catch(console.error);
        });
    }
};