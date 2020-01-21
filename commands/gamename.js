module.exports = {
	name: 'gamename',
	description: 'The name of the game/category. This will be the title of the category.',
    format: "!gamename <name>",
    gmonly: true,
	execute(client, message, args) {
                
        const gameName = args.join(" ");

        client.data.set("CATEGORY_NAME", gameName);
        message.channel.send("Game name set to: " + gameName);


    }
};