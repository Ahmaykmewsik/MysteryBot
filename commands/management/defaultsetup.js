const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'defaultsetup',
	description: ` For development purposes. \
                   Adds the minimum requirement to a game so you can use !gamestart immediatley.`,
	format: "!defaultsetup",
	guildonly: true,
	gmonly: true,
	async execute(client, message, args) {

        let players = client.getPlayers.all(message.guild.id);
        let areas = client.getAreas.all(message.guild.id);
        let settings = UtilityFunctions.GetSettings(client, message.guild.id);
        let locations = client.getLocations.all(message.guild.id);
        
        let returnMessage = "";

        //Add player if there are none
        if (players.length == 0) {
            await UtilityFunctions.RunCommand(client, message, "addplayer", [message.author.username, "Default", "Man"]);
        } else {
            returnMessage += `Game already has ${players.length} players. No new players added.\n`;
        }
        
        //Add area if none exists
        if (areas.length == 0) {
            await UtilityFunctions.RunCommand(client, message, "addarea",  ["room"]);
        } else {
            returnMessage += `Game already has ${areas.length} areas. No new areas added.\n`;
        }

        //Set action log if not set
        if (!settings.actionLogID) {
            await UtilityFunctions.RunCommand(client, message, "actionlog");
        } else {
            returnMessage += `ActionLog already set.\n`;
        }

        //Sets the game name and creates category
        if (!settings.categoryName) {
            await UtilityFunctions.RunCommand(client, message, "gamename", ["Test", "Game"]);
        } else {
            returnMessage += `Game category already exists. No category created.\n`;
        }

        players = client.getPlayers.all(message.guild.id);
        areas = client.getAreas.all(message.guild.id);

        //Set area for all players with no area set
        players.forEach(function(p) {
            let playerLocation = locations.find(l => p.username == l.username);
            if (!playerLocation) {
                var randomIndex = Math.floor(Math.random() * areas.length);
                client.setLocation.run({
                    guild_username: `${message.guild.id}_${p.username}`,
                    username: p.username,
                    guild: message.guild.id,
                    areaID: areas[randomIndex].id
                })
                returnMessage += `${p.username}'s area has been set to \`${areas[randomIndex].id}\`\n`;
            }
        });
        
        returnMessage += `**Default Game setup complete!**`;

        return message.channel.send(returnMessage);
	}

};