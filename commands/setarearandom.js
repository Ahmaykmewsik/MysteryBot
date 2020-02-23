const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'setarearandom',
	description: 'Set each player\'s area to a random location',
    format: "!setarearandom",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        var areas = client.data.get("AREA_DATA");

        if (players == undefined) {
            return message.channel.send("You don't have any players. Input your players first!");
        }

        if (areas == undefined) {
            return message.channel.send("You have no areas! Make some areas first.");
        }

        //Set the area
        players.forEach(function(p) {
            var randomIndex = Math.floor(Math.random() * areas.length);
            p.area = areas[randomIndex].id;
            areas[randomIndex].playersPresent.push(p.name);
        });
        
        client.data.set("PLAYER_DATA", players);
        client.data.set("AREA_DATA", areas);

        message.channel.send("All player areas have been randomzied.\n"
        + players.map(player => player.name + ": " + player.area).join('\n'));

	}
};