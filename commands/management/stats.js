const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
    name: 'stats',
    description: 'Displays some stats about what data is stored in the bot for this server.',
    format: "!stats",
    gmonly: true,
    execute(client, message, args) {
        
        const settings = UtilityFunctions.GetSettings(client, message.guild.id);
        
        const players = client.getPlayers.all(message.guild.id);
        const areas = client.getAreas.all(message.guild.id);
        const connections = client.getAllConnections.all(message.guild.id);
        const locations = client.getLocations.all(message.guild.id);
        const items = client.getItems.all(message.guild.id);
        const inventories = client.getInventories.all(message.guild.id);
        const spyActions = client.getSpyActionsAll.all(message.guild.id);
        const spyChannels = client.getSpyChannels.all(message.guild.id);
        const spyConnections = client.getSpyConnectionsAll.all(message.guild.id);
        const numEarlogChannels = client.countEarlogChannels.get(message.guild.id);
        const gameplayChannels = client.getGameplayChannels.all(message.guild.id);

        let returnMessage = `
        -----------STATS-----------`
        + `\n__Game Name:__** ${settings.categoryName}**`
        + `\n__Category Num:__** ${settings.categoryNum}**`
        + `\n__Phase:__ **${settings.phase}**`
        + `\n__actionLogID:__ **${settings.actionLogID}**`
        + `\n__Health System Activated:__ **${settings.healthSystemActivated}**`
        + `\n__Default Health:__ **${settings.defaultHealth}**`
        + `\n__Max Health:__ **${settings.maxHealth}**\n`
        + `\n__Players:__ **${players.map(p => p.username).join(", ")}**`
        + `\n__Areas:__ **${areas.map(p => p.id).join(", ")}**`
        + `\n__#Connections:__ **${connections.length}**`
        + `\n__#Connections:__ ${connections.map(c => `\`${c.area1}->${c.area2}\``).join(", ")}`
        + `\n__#Locations:__ **${locations.length}**`
        + `\n__#Items:__ **${items.length}**`
        + `\n__Items:__** ${items.map(i => i.id).join(", ")}**`
        + `\n__#Inventories:__ **${inventories.length}**`
        + `\n__#Spy Actions:__ **${spyActions.length}**`
        + `\n__#Spy Connections:__ **${spyConnections.length}**`
        + `\n__#Spy Channels:__ **${spyChannels.length}**`
        + `\n__#Earlog Channels:__ **${numEarlogChannels[`count(*)`]}**`
        + `\n__#Gameplay Channels:__ **${gameplayChannels.length}**`
        
        message.channel.send(returnMessage, {split: true});

    }
}