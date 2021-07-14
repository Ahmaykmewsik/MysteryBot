
const UtilityFunctions = require('../../utilities/UtilityFunctions');
const ChannelCreationFunctions = require('../../utilities/channelCreationFunctions.js');

module.exports = {
    name: 'addareas',
    description: 'Creates multiple areas with one command. Remember that an area-id cannot contain whitespace.',
    format: "!addareas <id> <id> <id> <id>...",
    gmonly: true,
    async execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No area ID provided. Please specify an ID string for the new area.");
        }

        oldAreas = client.getAreas.all(message.guild.id);
        newAreas = [];
        let settings = UtilityFunctions.GetSettings(client, message.guild.id);

        if (args.length > 5)
            return message.channel.send("Sorry, you can't add more than 5 areas at a time (blame the discord API)");

        await message.channel.send("Creating Earlogs...");

        //Check if earlog category exists
        settings = await ChannelCreationFunctions.CreateEarlogCategoryIfNeeded(client, message.guild, settings);

        let returnMessage = "";

        for (areaInput of args) {

            let matchedAreaOld = oldAreas.find(a => a.id == areaInput);
            let matchedAreaNew = newAreas.find(a => a.id == areaInput);

            if (matchedAreaOld) {
                returnMessage += `An area with the ID \`${matchedAreaOld.id}\`already exists!\n`;
                continue
            }
            if (matchedAreaNew) {
                returnMessage += `I'm not adding \`${matchedAreaNew.id}\` again! You can only have one pal.\n`;
                continue
            }

            const newArea = {
                guild_id: `${message.guild.id}_${areaInput}`,
                id: areaInput,
                guild: message.guild.id,
                name: areaInput.toUpperCase(),
                description: "Nothing is here.",
                image: undefined
            };

            newAreas.push(newArea);
            client.setArea.run(newArea);
            client.setConnection.run({
                area1: areaInput,
                area2: areaInput,
                guild: message.guild.id
            });

            returnMessage += `New area created: \`${newArea.id}\`\n`

            //Create Earlog
            await ChannelCreationFunctions.CreateEarlog(client, message, newArea, settings);
        }

        message.channel.send(returnMessage, {split: true});
    }
};