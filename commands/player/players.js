const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'players',
	description: 'Lists all participating players.',
    format: "!players",
    gmonly: true,
	execute(client, message, args) {

        const players = client.getPlayers.all(message.guild.id);
        if (players.length == 0) {
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        }

        let outputMessage = "__**PLAYERS**__\n\n";

        players.forEach(p => {
            outputMessage += formatPlayer(client, p, false) + "\n\n";
        })
        

        message.channel.send(outputMessage, {split: true});
    }
};