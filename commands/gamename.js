module.exports = {
	name: 'gamename',
	description: 'The name of the game/category. This will be the title of the category.',
    format: "!gamename <name>",
    gmonly: true,
	execute(client, message, args) {
                
        const gameName = args.join(" ");

        if (!message.guild.channels.has("name", gameName)) {
            message.guild.createChannel(gameName, {
                type: 'category'
              })
              .then((categoryObject) => {
                  category = {
                      id: categoryObject.id,
                      name: categoryObject.name,
                      num: 1
                  };

                  client.data.set("CATEGORY_DATA", category);
              })
              .catch(console.error);
        }

        message.channel.send("Game name set to: " + gameName);
    }
};