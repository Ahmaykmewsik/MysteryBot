
const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const d20roll = require('../../utilities/d20roll').d20roll;

module.exports = {
    name: 'me',
    description: 'Lists a player\'s own info. DM only. Cannot be used while a player\'s channel is locked or if the GM has processed their movement manually (to hide spoilers!).',
    format: "!me",
    aliases: ["i"],
    dmonly: true,
    execute(client, message, args) {

        let player = UtilityFunctions.GetPlayerFromDM(client, message);
        if (!player.username)
            return message.channel.send("You're not in any games right now. If that's a mistake, contact your GM.");

        const settings = UtilityFunctions.GetSettings(client, player.guild);
        if (!settings.phase)
            return message.channel.send("You can't run this command until a game has started!");

        //Block the command if their channel is locked.
        let location = client.getLocationOfPlayer.get(`${player.guild}_${player.username}`);
        let gameplayChannels = client.getGameplayChannels.all(player.guild);
        let playerChannel = gameplayChannels.find(c => (c.areaID == location.areaID) && c.active);
        if (playerChannel == undefined)
            return message.channel.send("Sorry can't do that cheif. I couldn't find where you are? (Might want to ask your GM about that)");

        if (playerChannel.locked)
            return message.channel.send("Sorry can't do that cheif. You can't look at your player info while your channel is locked. It might have spoilers!");

        if (player.forceMoved)
            return message.channel.send("Sorry can't do that cheif. Your info has spoilers! (If you think this shouldn't have happened ask your GM)");

        let profileOutput;
        let profiles = client.getProfiles.all(player.guild);
        let profile = profiles.find(prof => prof.username == player.username);
        
        if (profile)
            profileOutput = `\n\n------PROFILE------\n\n${profile.profileText}`;
        else 
            profileOutput = `\n\n*No profile*`

        message.reply(formatPlayer(client, player) + profileOutput, { split: true });
    }
};