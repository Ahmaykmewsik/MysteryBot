const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const SpyManagement = require('../../utilities/SpyManagement');

module.exports = {
    name: 'spyplayer',
    description: 'Gives a player the ability to discretley view another channel. Includes an accuraccy value (0.0 - 1.0) limiting the number of words that are copied. Include -v to make the spy visible. This will turn on the area name, area description, area image, and other info posted at the beginning of the phase that would be seen by someone\'s eyes (This is hidden by default). Include `-p` to make the spy action permanent unless removed manually. Include `-a` to make the spying active now instead of activated on the phase rollover. ',
    format: "!spyplayer <player> <areaIDToSpy> <accuracy> [-v] [-p] [-a]",
    aliases: [`playerspy`],
    guildonly: true,
    gmonly: true,
    async execute(client, message, args) {

        //return UtilityFunctions.NotImplemented(message);

        if (args.length == 0) {
            return message.channel.send("What? Please enter a player. And like, all the other shit.");
        }

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        if (args.length == 0)
            return message.channel.send("But spy where? Enter an area.");

        let area = UtilityFunctions.GetArea(client, message, args.shift().toLowerCase());
        if (!area.guild) return;

        if (args.length == 0)
            return message.channel.send("Please include a number between 0.0 and 1.0 for the accuracy.");

        const accuracyInput = args.shift();
        const accuracy = parseFloat(accuracyInput);

        if (isNaN(accuracy) || accuracy < 0 || accuracy > 1.0) {
            return message.channel.send("Invalid accuracy: " + accuracyInput + ". Please enter a number between 0 and 1.");
        }

        let permanent = 0;
        let active = 0;
        let visible = 0;
        let settings = UtilityFunctions.GetSettings(client, message.guild.id);
        let returnMessage = "";

        //Visible flat
        if (args.includes("-v"))
            visible = 1;

        //Active flag
        if (args.includes("-a")) {
            //check that a game is running
            if (!settings.phase)
                return message.channel.send("You can't make someone spy yet using \"-a\". The game hasn't started yet!");
            active = 1;
        }

        //Perniment flag
        if (args.includes("-p"))
            permanent = 1;

        let spyActionsData = client.getSpyActions.all(player.guild_username);
        let spyConnections = client.getSpyConnectionsAll.all(message.guild.id);
        let locations = client.getLocations.all(message.guild.id);
        let players = client.getPlayers.all(message.guild.id);
        let areas = client.getAreas.all(message.guild.id);
        let spyChannelData = client.getSpyChannels.all(message.guild.id);

        //Check if this action already exists (matches player, area, and active state). Overwrite all matches
        let matchedActions = spyActionsData.filter(a => a.username == player.username && a.spyArea == area.id && a.active == active);
        //Delete all matching actions
        for (action of matchedActions) {
            spyActionsData = spyActionsData.filter(a => !UtilityFunctions.MatchSpyAction(a, action));
            client.deleteSpyAction.run(action.guild_username, action.spyArea, action.active);
            returnMessage += `**This spy action has been overridden: ** ${UtilityFunctions.FormatSpyAction(action)}\n`;
        }

        const newSpyAction = {
            guild_username: `${message.guild.id}_${player.username}`,
            username: player.username,
            guild: message.guild.id,
            spyArea: area.id,
            accuracy: accuracy,
            permanent: permanent,
            playerSpy: 1,
            visible: visible,
            active: active
        };

        spyActionsData.push(newSpyAction);
        client.addSpyAction.run(newSpyAction);

        //Notify
        returnMessage += (active) ?
            `The following spy action will go into effect immediatley:\n` :
            `The following spy action will go into effect next phase:\n`;

        returnMessage += `**${UtilityFunctions.FormatSpyAction(newSpyAction)}**\n\n`;

        //Visible?
        returnMessage += (visible) ?
            `:eye: This is a visible spy.\n\n` :
            `:ear: This is NOT a visible spy. The area name and description will be hidden in the spy channel. ` +
            `If you don't want this, make the spy a visible spy with \`-v\`\n\n`;

        //Refresh spying, see if we need to do anything fancy like update spy actions or spy channels
        returnMessage += await SpyManagement.RefreshSpying(client, message, message.guild, spyActionsData, spyConnections, spyChannelData, players, areas, locations, settings);

        message.channel.send(`\n` + returnMessage + `\n\n` + formatPlayer(client, player), { split: true });
    }


};