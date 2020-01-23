const createChannel = require('../utilities/createChannel.js').createChannel;

module.exports = {
	name: 'gamestart',
	description: 'Assigns each player a random starting area',
    format: "!gamestart",
    gmonly: true,
	execute(client, message, args) {
        
        var players = client.data.get("PLAYER_DATA");
        if (players == undefined || players.length === 0) {
            return message.channel.send("No players found. Use !addplayers <role> to set up a game with players in a given role.");
        }

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined || areas.length === 0) {
            return message.channel.send("No areas found. Use !addarea to create an area.");
        }

        const catagory = client.data.get("CATEGORY_NAME");
        if (catagory == undefined) {
            return message.channel.send("You need to name the game! Use !gamename to name the game. (This will set the catagory name)");
        }

        const phaseCount = 1;

        players.forEach(player => {
            var randomIndex = Math.floor(Math.random() * areas.length);
            player.area = areas[randomIndex].id;
            areas[randomIndex].playersPresent.push(player.name);
        });

        client.data.set("PLAYER_DATA", players);

        areas.forEach(area => {
            createChannel(message.guild, area.name, catagory, area.playersPresent, phaseCount, area.description); 
        });

        client.data.set("PHASE_COUNT", phaseCount);
        client.data.set("AREA_DATA", areas);

        message.channel.send("Let's go! All players have been assigned a random starting area:\n"
            + players.map(player => player.name + ": " + player.area).join('\n'));
    }
};