const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'player',
	description: 'Lists a participating players.',
    format: "!player <username>",
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        if (players == undefined || players.length === 0) {
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        }
        
        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        //find player based on input
        const playerName = players.find(p => p.name.toLowerCase().includes(inputusername));  

        //Notify if invalid input for user
        if (playerName == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        message.channel.send(formatPlayer(playerName));
    }
};