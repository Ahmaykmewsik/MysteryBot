module.exports = {
	name: 'resetgame',
	description: 'Clears all game data, keeps player and area setup data.',
    format: "!resetgame",
    guildonly: true,
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
            message.channel.send("The game has not started yet FYI.");
        }

        message.channel.send("Are you sure you want to reset the game? All player and area data will be kept.").then(() => {
            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {

                       players.forEach(player => {
                           player.area = undefined;
                           player.move = undefined;
                           player.action = undefined;
                           player.items = [];
                       })

                       areas.forEach(area => {
                           area.playersPresent = [];
                           area.description = undefined;
                       })

                       phaseCount = undefined;

                       client.data.set("PLAYER_DATA", players);
                       client.data.set("AREA_DATA", areas);
                       client.data.set("PHASE_COUNT", phaseCount);
                       client.data.set("EARLOG_DATA", undefined);

                       message.channel.send("The game has been reset.");

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

    