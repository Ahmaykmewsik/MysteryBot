const formatArea = require('../utilities/formatArea').formatArea;

module.exports = {
	name: 'where',
	description: 'For players. Lists your current location.',
    format: "!where",
    gmonly: false,
    dmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        var areas = client.data.get("AREA_DATA");

        var items = client.data.get("ITEM_DATA");
        if (items == undefined) {
            items = [];
        }
		var player = players.find(p => p.name == message.author.username);

		if (player == undefined) {
			return message.channel.send("You don't seem to be on the list of players. If you think this is a mistake, ask your GM.");
		}

		if (player.area == undefined) {
			return message.channel.send("You're not alive! The dead have no place in this cruel world.");
        }
        
        const currentArea = areas.find(a => a.id == player.area);
        message.channel.send(formatArea(currentArea, items));
    }
};