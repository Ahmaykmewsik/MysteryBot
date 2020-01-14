module.exports = {
	name: 'clone',
	description: 'clones a discord channel',
	format: "!clone",
	guildonly: true,
	gmonly: true,
	execute(client, message, args) {
        message.channel.clone();
	}
};