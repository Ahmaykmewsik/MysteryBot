const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'profilestatus',
	description: 'Lists whether or not all players have a profile.',
    format: "!profilestatus",
    gmonly: true,
	execute(client, message, args) {

        const players = client.getPlayers.all(message.guild.id);
        if (players.length == 0) {
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        }

        let outputMessage = "__**PROFILES**__\n";
        let profiles = client.getProfiles.all(message.guild.id);

        players.forEach(player => {
            let profile = profiles.find(prof => prof.username == player.username);
            let profileStatus = (profile) ? "Has Profile" : ":triangular_flag_on_post:**NO PROFILE**:triangular_flag_on_post:";
            outputMessage += `${player.username}: ${profileStatus}\n`;
        })
        
        message.channel.send(outputMessage, {split: true});
    }
};