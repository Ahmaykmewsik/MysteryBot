const formatArea = require('../../utilities/formatArea').formatArea;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
    name: 'removearea',
    description: 'Removes the area with specified ID string.',
    format: "!removearea <id>",
    gmonly: true,
    execute(client, message, args) {

        let area = UtilityFunctions.GetArea(client, message, args.shift());
        if (!area.guild) return;

        message.channel.send(formatArea(client, area));
        let warningMessage = "Are you sure you want to delete this area? (y or n)";
        return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, RemoveArea);

        function RemoveArea() {
            //remove area
            client.deleteArea.run(`${message.guild.id}_${area.id}`);

            //remove connections to other areas
            client.deleteConnectionsOfArea.run(area.id, area.id, message.guild.id);

            //remove locations
            client.deleteLocationsOfArea.run(area.id, message.guild.id);

            message.channel.send("Area `" + area.id + "` removed. All connection and location data has also been deleted.");
        }
    }
};