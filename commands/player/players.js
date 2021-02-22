const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'players',
	description: 'Lists all participating players.',
    format: "!players",
    gmonly: true,
	execute(client, message, args) {

        var table = client.countPlayers.get(message.guild.id);
        if (table['count(*)'] == 0) {
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        }
        
        message.channel.send("UNIMPLEMENTED");
    }
};