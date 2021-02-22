const UtilityFunctions = require("../../utilities/UtilityFunctions");

module.exports = {
    name: 'gamename',
    description: 'The name of the game/category. This will be the title of the category.',
    format: "!gamename <name>",
    gmonly: true,
    execute(client, message, args) {

        const gameName = args.join(" ");
        let settings = UtilityFunctions.GetSettings(client, message.guild.id);

        if (!message.guild.channels.has("name", gameName)) {
            message.guild.createChannel(gameName, {
                type: 'category'
            })
                .then((categoryObject) => {

                    settings.categoryName = gameName;
                    settings.categoryID = categoryObject.id;
                    if (typeof settings.categoryNum == "number") {
                        settings.categoryNum += 1;
                    } else {
                        settings.categoryNum = 1;
                    }
                    
                    client.setSettings.run(settings);
                })
                .catch(console.error);
        }

        message.channel.send(`New category \`${gameName}\`created.`);
    }
};