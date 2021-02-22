module.exports = {

     
    GetPlayerFronInput(client, guildID, input) {
        /* 
        Return player object from the database using user input.
        Returns closest matching string to username via Includes() 
        */
        for (const p of client.getPlayers.iterate(guildID)) {
            if (p.username.toLowerCase().includes(input)) {
                return p;
            } else if (p.character.toLowerCase().includes(input)) {
                return p;
            }
        }
        return null;
    },



    GetSettings(client, guildID) {
        /*
        Returns current settings. If no settings exist, insert default settings.
        */
        const settings = client.getSettings.get(guildID);

        if (!settings) {
            const settingsDefault = {
                guild: guildID,
                categoryName: null,
                categoryID: null,
                categoryNum: null,
                spyCategoryID: null,
                phase: null,
                actionLogID: null,
                healthSystemActivated: 1,
                defaultHealth: 3.0,
                maxHealth: 3.0
            };

            client.setSettings.run(settingsDefault);

            return settingsDefault;
        }

        return settings;
    },

    GetPlayerFromDM(client, message) {
        let player = client.getUserInDatabase.get(message.author.username);

		if (!player) {
			return message.channel.send("You don't seem to be on a list of players. If you think this is a mistake, ask your GM.");
		}
		if (player.discordID != message.author.id) {
			return message.channel.send("You don't seem to be on a list of players. If you think this is a mistake, ask your GM.");
		}

		if (!player.alive) {
			return message.channel.send("You're not alive! No action for you.");
		}

        return player;
    }
}