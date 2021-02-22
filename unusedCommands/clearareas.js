module.exports = {
	name: 'clearareas',
    category:  `area`,
	description: 'Removes all areas.',
    format: "!clearareas",
    gmonly: true,
	execute(client, message, args) {

        message.channel.send("Are you sure you want to delete all areas? (y or n)").then(() => {
            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {
                        client.data.set("AREA_DATA", []);
                        message.channel.send("Areas deleted.");
                    } else if (messages.first().content == 'n') {
                        message.channel.send("Okay, never mind then :)");
                    } else {
                        message.channel.send("...uh, okay.");
                    }         
                })
                .catch(() => {
                    message.channel.send("Something went wrong with that.");
                })
        });
    }
};