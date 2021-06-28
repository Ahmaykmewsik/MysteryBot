const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
    name: 'sendprofile',
    description: 'DMs a single player their profile.',
    format: "!sendprofile <username>",
    gmonly: true,
    execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.join(" "));
        if (player.username == undefined) return;

        let profiles = client.getProfiles.all(message.guild.id);
        let profile = profiles.find(prof => prof.username == player.username);
        if (!profile) {
            return message.channel.send(`Nah man, I'm not gonna do that. ${player.username} has no profile!`);
        }

        let warningMessage = `${profile.profileText}\n\n--------\nSend ${player.username} their profile? (y or n)`;
        return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, SendProfile);
        
        function SendProfile() {
            let status = "SENT!:white_check_mark:";
            try {
                client.users.cache.get(player.discordID).send(profile.profileText);
            } catch (error) {
                status = `:x:**FAILED TO SEND.**:x: \`${error}\``;
            }

            let statusMessage = `${player.username}: ${status}\n`;
            return message.channel.send(statusMessage, { split: true });
        }
    }
};