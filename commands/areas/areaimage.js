const formatArea = require('../../utilities/formatArea').formatArea;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'areaimage',
	description: 'Updates the image of a specified area.',
    format: "!areaimage <id> <imageURL>",
    gmonly: true,
	execute(client, message, args) {

        let area = UtilityFunctions.GetArea(client, message, args.shift());
        if (!area.guild) return;

        const imageURL = args[0];
        if (!imageURL.includes("http")) 
            return message.channel.send("That's not an URL. Please input an image URL.");
        
        area.image = imageURL;
        client.setArea.run(area);

        message.channel.send("Area image updated!");
        message.channel.send(formatArea(client, area));
    }
};