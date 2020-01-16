const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'players',
	description: 'Lists all participating players.',
    format: "!players",
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        if (players == undefined || players.length === 0) {
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        }
        
        players.forEach(player => message.channel.send(formatPlayer(player)));
    }
};