const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'spyplayer',
    description: 'Gives a player the ability to discretley view another channel. Includes an accuraccy value (0.0 - 1.0) limiting the number of words that are copied. Include -v to make the spy visible. This will turn on the area name, area description, area image, and other info posted at the beginning of the phase that would be seen by someone\'s eyes (This is hidden by default). Include `-p` to make the spy action permanent unless removed manually. Include `-a` to make the spying active now instead of activated on the phase rollover. ',
    format: "!spyplayer <player> <areaIDToSpy> <accuracy> [-v] [-p] [-a]",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send("What? Please enter a player. And like, all the other shit.");
        }

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        if (args.length == 0) {
            return message.channel.send("But spy where? Enter an area.");
        }

        let area = UtilityFunctions.GetArea(client, message, args.shift().toLowerCase());
        if (!area.guild) return;

        if (args.length == 0) {
            return message.channel.send("Please include a number between 0.0 and 1.0 for the accuracy.");
        }

        const accuracyInput = args.shift();
        const accuracy = parseFloat(accuracyInput);

        if (!(typeof accuracy == "number") || accuracy < 0 || accuracy > 1.0) {
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

        
        //Check if this action already exists (matched with the inputed active value). If it does, delete it
        let spyActions = client.getSpyActions.all(player.guild_username);
        let matchedAction = spyActions.find(a => a.username == player.username && a.spyArea == area.id && a.active == active);
        if (matchedAction) {
            if (matchedAction.permanent) 
                permanent = 1;
            client.deleteSpyAction.run(matchedAction.guild_username, matchedAction.spyAction, matchedAction.active)
           returnMessage += `Spy action of accuracy ${matchedAction.accuracy} has been overridden.`;
        }

        const spyAction = {
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

        client.addSpyAction.run(spyAction);

        //Notify
        if (active) {
            returnMessage += `The following spy action will go into effect immediatley:\n`
        } else {
            returnMessage += `The following spy action will go into effect next phase:\n`
        }

        returnMessage += `**${UtilityFunctions.FormatSpyAction(spyAction)}**\n`;
        
        //Visible?
        if (visible) {
            returnMessage += `This is a visible spy.`;
        } else {
            returnMessage += `This is NOT a visible spy.`;
        }

        message.channel.send(returnMessage);

        message.channel.send(formatPlayer(client, player));

        if (active) {

            //Make a new spy channel for that player if they need it (they probably do!!!!)






            // let spyChannels = client.getSpyChannels.all(message.guild.id);

            // let freeSpyChannels = spyChannels.filter(d => d.username == spyAction.username && !d.spyArea);


            // if (freeSpyChannels.length > 0) {
            //     //if a spy channel is free use it
            //     freeSpyChannels[0].areaID = spyAction.areaID;
            //     client.setSpyChannel.run(freeSpyChannels[0]);
            //     return message.channel.send(`Spy channel updated.`);
            // } else {
            //     //Else make a new channel
            //     message.guild.channels.create("spy-" + spyAction.username, {
            //         type: 'text',
            //         permissionOverwrites: [{
            //             id: message.guild.id,
            //             deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            //         },
            //         {
            //             id: player.discordID,
            //             allow: ['VIEW_CHANNEL']
            //         }]
            //     }).then(channel => {

            //         //Create Webhooks
            //         channel.createWebhook(`SpyWebhook_${spyAction.username}_1`);
            //         channel.createWebhook(`SpyWebhook_${spyAction.username}_2`)
            //             .then(() => {
            //                 channel.setParent(settings.spyCategoryID)
            //                     .then(() => {
            //                         newSpyChannel = {
            //                             guild_username: `${message.guild.id}_${spyAction.username}`,
            //                             guild: message.guild.id,
            //                             username: spyAction.username,
            //                             areaID: spyAction.areaID,
            //                             channelID: channel.id
            //                         };
            //                         client.setSpyChannel.run(newSpyChannel);
            //                         message.channel.send(`New channel created: ${channel.name}`);
            //                     })
            //             })
            //             .catch(console.error);
            //     })
            // }
        }
    }


};