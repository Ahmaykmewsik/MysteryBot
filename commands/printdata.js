module.exports = {
	name: 'printdata',
	description: 'Shows internal data',
	format: "!printdata",
	guildonly: true,
	gmonly: true,
	execute(client, message, args) {
		
		keyArray = client.data.indexes;
        const dataMap = client.data.fetch(keyArray);
		var printString = "-----ALL DATA-----\n" + dataMap.map((v, k) => ("**" + k + "** => " + v)).join("\n");
		message.channel.send(printString);

	}
};