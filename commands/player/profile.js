const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
    name: 'profile',
    description: 'Looks up a profile of a player.',
    format: "!profile <player>",
    gmonly: true,
    execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.join(" "));
        if (player.username == undefined) return;
        let profiles = client.getProfiles.all(message.guild.id);

        let profile = profiles.find(prof => prof.username == player.username);
        if (!profile)
            return message.channel.send(`No profile has been set for ${player.username}`);

        return message.channel.send(profile.profileText, { split: true });
    }
};