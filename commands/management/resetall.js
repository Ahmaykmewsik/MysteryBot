module.exports = {
	name: 'resetall',
	description: 'Resets all data',
	format: "!resetall",
	guildonly: true,
	gmonly: true,
	execute(client, message, args) {

		if (args.includes("y"))
			return ResetAll(true);

		message.channel.send('Delete all data? (y or n).').then(() => {
			const filter = m => message.author.id === m.author.id;

			message.channel.awaitMessages(filter, {
					time: 20000,
					max: 1,
					errors: ['time']
				})
				.then(messages => {
					if (messages.first().content == "y") {
						ResetAll();

					} else if (messages.first().content == "n") {
						message.channel.send("Your DATA will thank you later.");
					} else {
						message.channel.send("...damn, you just gonna scare your data like that? Shameful.");
					}
				})
				.catch(() => {
					message.channel.send("Something went wrong with that.");
				});
		});


		function ResetAll(silent = false) {
			//CLEAR IT
			client.deleteAllPlayers.run(message.guild.id);
			client.deleteAllAreas.run(message.guild.id);
			client.deleteAllConnections.run(message.guild.id);
			client.deleteAllInstantConnections.run(message.guild.id);
			client.deleteAllLocations.run(message.guild.id);
			client.deleteAllItems.run(message.guild.id);
			client.deleteAllInventories.run(message.guild.id);
			client.deleteAllSpyActions.run(message.guild.id);
			client.deleteAllSpyConnections.run(message.guild.id);
			client.deleteAllEarlogChannelData.run(message.guild.id);
			client.deleteAllSpyChannelData.run(message.guild.id);
			client.deleteAllGameplayChannelData.run(message.guild.id);
			client.deleteSettings.run(message.guild.id);
			client.deleteAllMessages.run(message.guild.id);

			if (!silent)
				message.channel.send("Goodbye DATA. https://youtu.be/6kguaGI7aZg");
		}
	}
};