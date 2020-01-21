const createChannel = require('../utilities/createChannel.js').createChannel;
const sendPassMessages = require('../utilities/sendPassMessages.js').sendPassMessages;

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
        if (phaseCount == undefined){
            return message.channel.send("You need to start the game first with !gamestart.");
        }
        const category = client.data.get("CATEGORY_NAME");
        if (category == undefined) {
            return message.channel.send("You need to name the game! Use !gamename to name the game. (This will set the category name)");
        }

        var nonDoers = players.filter(p => p.action == undefined);
        if (nonDoers.length > 0) {
            message.channel.send("The following players have not sent their main action:\n"
                + nonDoers.map(p => p.name).join('\n')
                + "\nIf you proceed, they will do nothing.");
        }
    
        var nonMovers = players.filter(p => p.move == undefined);
        if (nonMovers.length > 0) {
            message.channel.send("The following players have not sent their movement action:\n"
                + nonMovers.map(p => p.name).join('\n')
                + "\nIf you proceed, they will stay still if possible; otherwise they will move at random.");
        }

        message.channel.send("Are you sure you would like to proceed with the movement phase?").then(() => {
            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {

                        //LET'S DO THIS SHIT!------

                        sendPassMessages(players);

                        areas.forEach(area => {
                            area.playersPresent = [];
                        });

                        //Move players
                        players.forEach(player => {
                            if (player.move != undefined) {
                                // move the player normally
                                player.area = player.move;

                                //Update Player Present in area
                                var newarea = areas.filter(a => a.id == player.move.id);
                                console.log(newarea);
                                newarea[0].playersPresent.push(player);
                    
                            } else {
                                const currentArea = player.area;
                                if (!currentArea.reachable.includes(currentArea.id)) {
                                    // if the player can't stay still, they move at random
                                    var randomIndex = Math.floor(Math.random() * currentArea.reachable.length);
                                    player.area = currentArea.reachable[randomIndex];
                                }
                                // otherwise, the player doesn't move
                            }
                            //reset movement and actions
                            player.move = undefined;
                            player.action = undefined;
                        });

                        //Iterate Phase
                        phaseCount += 1;

                        //CreateChannels
                        areas.forEach(area => {
                            createChannel(message.guild, area.name, category, area.playersPresent, phaseCount, area.description); 
                        });

                        //Updtate data
                        client.data.set("PLAYER_DATA", players);
                        client.data.set("PHASE_COUNT", phaseCount);
                        message.channel.send("Phase " + phaseCount + " hase begun. Use !players to view current locations.");

                        ///The shit has been done------

                    } else if (messages.first().content == 'n') {
                        message.channel.send("Okay, never mind then :)");
                    } else {
                        message.channel.send("...uh, okay.");
                    }
                })
                .catch((console.error))
        });
    }
};