

module.exports = {
	name: 'setarearandom',
	description: 'Set each player\'s area to a random location',
    format: "!setarearandom",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var players = client.getPlayers.all(message.guild.id);
        var areas = client.getAreas.all(message.guild.id);

        if (players.length == 0) {
            return message.channel.send("You don't have any players. Input your players first!");
        }

        if (areas.length == 0) {
            return message.channel.send("You have no areas! Make some areas first.");
        }

        //Delete all current location data
        client.deleteAllLocations.run(message.guild.id);

        //Set random locations for each player
        players.forEach(function(p) {
            var randomIndex = Math.floor(Math.random() * areas.length);
            client.setLocation.run({
                guild_username: `${message.guild.id}_${p.username}`,
                username: p.username,
                guild: message.guild.id,
                areaID: areas[randomIndex].id
            })
        });

        message.channel.send("All player areas have been randomzied.");
	}
};