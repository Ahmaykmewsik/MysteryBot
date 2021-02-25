const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
	name: 'areaimage',
    category:  `area`,
	description: 'Updates the image of a specified area.',
    format: "!areaimage <id> <imageURL>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify area ID and imageURL.");
        }
        if (args.length === 1) {
            return message.channel.send("No image URL given. Please specify the image you wish to assign this area.");
        }

        const id = args[0];
        const imageURL = args[1];

        const area = client.getArea.get(`${message.guild.id}_${id}`);
        if (!area) {
            return message.channel.send("No area exists with ID `" + id + "`. Use !areas to view all areas.");
        }

        if (!imageURL[3] == ("http")) {
            return message.channel.send("That's not an URL. Please input an image URL.");
        }

        area.image = imageURL;
        client.setArea.run(area);

        message.channel.send("Area image updated!");
        message.channel.send(formatArea(client, area));
    }
};