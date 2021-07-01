const UtilityFunctions = require("../../utilities/UtilityFunctions");

module.exports = {
    name: 'gamename',
    description: 'The name of the game/category. This will be the title of the category.',
    format: "!gamename <name>",
    gmonly: true,
    async execute(client, message, args) {

        const gameName = args.join(" ");
        let settings = UtilityFunctions.GetSettings(client, message.guild.id);

        let categoryObject = await message.guild.channels.create(gameName, {
            type: 'category',
            permissionOverwrites: [{
                id: message.guild.id,
                deny: [`VIEW_CHANNEL`]
            }]
        })

        settings.categoryName = gameName;
        settings.categoryID = categoryObject.id;
        if (typeof settings.categoryNum == "number") {
            settings.categoryNum += 1;
        } else {
            settings.categoryNum = 1;
        }

        client.setSettings.run(settings);

        message.channel.send(`New category \`${gameName}\`created.`);
    }
};