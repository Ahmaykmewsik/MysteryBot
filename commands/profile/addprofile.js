const UtilityFunctions = require('../../utilities/UtilityFunctions');
module.exports = {
	name: 'addprofile',
	description: 'Adds a profile for a player. This will be viewable by players with the `!me` command during the game. You can also have the bot send these out to players with `!sendprofiles`',
    format: "!addprofile <username> <profileText>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        const profileText = args.join(" ");

        if (profileText.length == 0) {
            return message.channel.send("You need to enter the profile text.");
        }
        
        const newProfile = {
            guild_username: `${message.guild.id}_${player.username}`,
            username: player.username,
            guild: message.guild.id,
            profileText: profileText
        };

        client.setProfile.run(newProfile);

        let outputMessage = `Profile for ${player.username} added! View this profile with the \`!profile\` command.`;
        
        message.channel.send(outputMessage);
	}
};