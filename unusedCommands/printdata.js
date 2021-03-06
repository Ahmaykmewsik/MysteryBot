module.exports = {
	name: 'printdata',
	description: 'Shows internal data',
	format: "!printdata",
	guildonly: true,
	gmonly: true,
	execute(client, message, args) {
		
		return message.channel.send("DEPRICATED. I might make this work later if I feel like it - Ahmayk");

		keyArray = client.data.indexes;
        const dataMap = client.data.fetch(keyArray);
		var printString = "-----ALL DATA-----\n" + dataMap.map((v, k) => ("**" + k + "** => " + v)).join("\n");
		message.channel.send(printString);

	}
};