module.exports = {
	name: 'gamestart',
	description: 'Assigns each player a random starting area',
    format: "!gamestart",
    gmonly: true,
	execute(client, message, args) {
        
        var players = client.data.get("PLAYER_DATA");
        if (players == undefined || players.length === 0) {
            return message.channel.send("No players found. Use !addplayers <role> to set up a game with players in a given role.");
        }

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined || areas.length === 0) {
            return message.channel.send("No areas found. Use !addarea to create an area.");
        }

        players.forEach(player => {
            var randomIndex = Math.floor(Math.random() * areas.length);
            player.area = areas[randomIndex].id;
        });

        client.data.set("PLAYER_DATA", players);
        message.channel.send("Let's go! All players have been assigned a random starting area:\n"
            + players.map(player => player.name + ": " + player.area).join('\n'));
    }
};