const formatArea = require('../../utilities/formatArea').formatArea;
const UtilityFunctions = require('../../utilities/UtilityFunctions');
const ChannelCreationFunctions = require('../../utilities/channelCreationFunctions.js');

module.exports = {
    name: 'addarea',
    description: 'Creates a new area with specified ID string. The area ID cannot contain whitespace.',
    format: "!addarea <id>",
    gmonly: true,
    execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No area ID provided. Please specify an ID string for the new area.");
        }
        if ((args.length > 1) && !args.includes(`-i`)) {
            return message.channel.send("Area ID cannot contain whitespace.");
        }
        const id = args[0];

        const doesAreaExist = client.getArea.get(`${message.guild.id}_${id}`);

        if (doesAreaExist) {
            return message.channel.send(`An area with the ID \`${id}\`already exists!`);
        }

        const newArea = {
            guild_id: `${message.guild.id}_${id}`,
            id: id,
            guild: message.guild.id,
            name: id.toUpperCase(),
            description: "Nothing is here.",
            image: undefined
        };

        client.setArea.run(newArea);
        client.setConnection.run({
            area1: id,
            area2: id,
            guild: message.guild.id
        });

        message.channel.send("Successfully created new area: `" + id +
            "`.\nUse `!areaname`, `!areadesc`, `!connect`, and `!areaimage` to edit this area's properties.\n\n" +
            formatArea(client, newArea, 1)
        );


        //Create Earlog if game has started
        ChannelCreationFunctions.CreateEarlog(client, message, newArea);
    }
};