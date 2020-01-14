module.exports = {
	name: 'moveplayers',
	description: 'Moves all players based on their movement actions. Any player without a submitted action either stays still if possible, or moves randomly.',
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

        var nonMovers = players.filter(p => p.move == undefined);
        if (nonMovers.length > 0) {
            message.channel.send("The following players have not sent any movement actions:\n"
                + nonMovers.map(p => p.name).join('\n')
                + "\nIf you proceed, they will stay still if possible; otherwise they will move at random.");
        }

        message.channel.send("Are you sure you would like to proceed with the movement phase?").then(() => {
            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {

                        players.forEach(player => {
                            if (player.move != undefined) {
                                // move the player normally
                                player.area = player.move;
                        
                            } else {
                                const currentArea = areas.find(a => a.id == player.area);
                                if (!currentArea.reachable.includes(currentArea.id)) {
                                    // if the player can't stay still, they move at random
                                    var randomIndex = Math.floor(Math.random() * currentArea.reachable.length);
                                    player.area = currentArea.reachable[randomIndex];
                                }
                                // otherwise, the player doesn't move
                            }
                        
                            player.move = undefined;
                        });
                        client.data.set("PLAYER_DATA", players);
                        message.channel.send("Players moved. Use !players to view current locations.");

                    } else if (messages.first().content == 'n') {
                        message.channel.send("Okay, never mind then :)");
                    } else {
                        message.channel.send("...uh, okay.");
                    }
                })
                .catch(() => {
                    message.channel.send("Something went wrong with that.");
                })
        });
    }
};