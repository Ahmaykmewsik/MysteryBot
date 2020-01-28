const formatArea = require('../utilities/formatArea').formatArea;

module.exports = {
	name: 'canspawn',
	description: 'Updates the "Can Spawn" state of an area - rather or not a player can start the game here.',
    format: "!canspawn <id> <true/false>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify area ID and desired area description.");
        }
        if (args.length === 1) {
            return message.channel.send("True or false? Gotta give one or the other.");
        }
        const id = args[0];
        const state = args[1].toLowerCase();

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            areas = [];
        }

        var areaIndexToUpdate = areas.findIndex(area => area.id == id);
        if (areaIndexToUpdate === -1) {
            return message.channel.send("No area exists with ID `" + id + "`. Use !areas to view all areas.");
        }

        var stateBool;
        switch (state){
            case "true":
                stateBool = true;
                break;
            case "false":
                stateBool = false;
                break;
            default:
                return message.channel.send(state + " is not true or false.");
        }

       

        areas[areaIndexToUpdate].canspwan = stateBool;
        console.log(areas[areaIndexToUpdate].canspwan );
        client.data.set("AREA_DATA", areas);

        message.channel.send("Area spawning info updated!");
        message.channel.send(formatArea(areas[areaIndexToUpdate]));
    }
};