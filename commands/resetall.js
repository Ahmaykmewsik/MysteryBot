
const Enmap = require("enmap");

module.exports = {
	name: 'resetall',
	description: 'Resets all data',
	format: "!resetall",
	guildonly: true,
	execute(client, message, args) {

		//Check that the GM is giving command.
		

		///*

		if (!message.member.hasPermission('ADMINISTRATOR')) {
			message.channel.send("Don't you dare.");
			return;
		}

		//*/

		message.channel.send('Delete all data? (y or n).').then(() => {
			const filter = m => message.author.id === m.author.id;
		
			message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
				.then(messages => {
					if (messages.first().content == "y") {

						//CLEAR IT
						client.data.fetchEverything();
						const keys = client.data.indexes;
						for (i in keys) {
							client.data.set(keys[i], undefined);
						}
						message.channel.send("All data has been cleared.");
					} else if (messages.first().content == "n") {
						message.channel.send("Well fuck you then.");
					} else {
						message.channel.send("...uh, okay.");
					}
				})
				.catch(() => {
					message.channel.send("Something went wrong with that.");
				});
		});
	}
};