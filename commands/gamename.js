module.exports = {
	name: 'gamename',
	description: 'The name of the game/category. This will be the title of the category.',
    format: "!gamename <name>",
    gmonly: true,
	execute(client, message, args) {
                
        const gameName = args.join(" ");

        const phaseNumber = client.data.get("PHASE_COUNT");

        //If the game has already started
        if (phaseNumber != undefined) {
            message.channel.send("You really shouldn't be changing this while a game is in process. Proceed anyway? (y/n)").then(() => {
                const filter = m => message.author.id === m.author.id;
                message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                    .then(messages => {
                        if (messages.first().content == 'y') {
                            message.channel.send("Alright, suit yourself.");
                        } else if (messages.first().content == 'n') {
                            return message.channel.send("Okay, glad I asked.");
                        } else {
                            return message.channel.send("...uh...I'm going to assume that meant no, just to be safe.");
                        }
                    })
                    .catch(() => {
                        console.error;
                        message.channel.send("Something went wrong with that.");
                    })
            })
        }
        
        client.data.set("CATEGORY_NAME", gameName);

        message.channel.send("Game name set to: " + gameName);

    }
};