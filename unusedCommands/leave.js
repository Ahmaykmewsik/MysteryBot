module.exports = {
	name: 'leave',
	description: 'leave',
	format: "!leave",
	guildonly: true,
	gmonly: true,
	execute(client, message, args) {
        message.channel.lockPermissions();
	}
};