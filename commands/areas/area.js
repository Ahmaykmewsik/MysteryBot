const formatArea = require('../../utilities/formatArea').formatArea;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
    name: 'area',
    description: 'Displays details of the area with a given ID. Include "-e" after the areaID for an embeded post (this is what a player sees).',
    format: "!area <id> [-e]",
    gmonly: true,
    execute(client, message, args) {

        let area = UtilityFunctions.GetArea(client, message, args.shift());
        if (!area.guild) return;

        if (args.includes("-e")) 
            return message.channel.send(formatArea(client, area, false));
    
        return message.channel.send(formatArea(client, area, true), {split: true});
    }
};