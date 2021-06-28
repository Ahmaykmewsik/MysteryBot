const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'spy',
    description: 'Gives a player the ability to discretley view another channel. Includes an accuraccy value, limiting the number of words that are copied. Include -p to make the spy action permanent unless removed manually. Include -c to set the current spy action.',
    format: "!spy <player> <area> <accuracy> [-c] [-p]",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        if (args.length == 0) {
            return message.channel.send("But spy where? Enter an area.");
        }

        const areainput = args.shift().toLowerCase();

        const area = client.getArea.get(`${message.guild.id}_${areainput}`);
        if (!area) {
            return message.channel.send("No area exists with ID `" + areainput + "`. Use !areas to view all areas.");
        }

        if (args.length == 0) {
            return message.channel.send("Please include a number between 0.0 and 1.0 for the accuracy.");
        }

        const accuracyInput = args.shift();
        const accuracy = parseFloat(accuracyInput);

        if (!(typeof accuracy == "number") || accuracy < 0 || accuracy > 1.0) {
            return message.channel.send("Invalid accuracy: " + accuracyInput + ". Please enter a number between 0 and 1.");
        }

        let permanent = 0;
        let current = 0;
        let settings = UtilityFunctions.GetSettings(client, message.guild.id);



        if (args.includes("-c")) {
            //check that a game is running
            if (!settings.phase) {
                return message.channel.send("You can't make someone spy yet using \"-c\". The game hasn't started yet!");
            }

            current = 1;
        } else if (args.includes("-p")) {
            permanent = 1;
        } else if (args.length > 0){
            return message.channel.send("Invalid final tolken.");
        }


        const spyAction = {
            guild_username: `${message.guild.id}_${player.username}`,
            username: player.username,
            guild: message.guild.id,
            spyArea: area.id,
            accuracy: accuracy,
            permanent: permanent
        };

        if (current) {

            let spyCurrent = client.getSpyCurrent.all(player.guild_username);
            if (spyCurrent.some(a => a.spyArea == area.id)) {
                message.channel.send(`:warning: **${player.username} is already currently spying ${area.id}!** If you want to clear it, use \`!spyclear\` with the -c tag.`);
                return message.channel.send(formatPlayer(client, player));
            } else {
                client.addSpyCurrent.run(spyAction);
                message.channel.send(player.username + " will now spy: `" + area.id + "` with `" + accuracy + "` accuracy.");
            }

        } else {

            let spyActions = client.getSpyActions.all(player.guild_username);
            if (spyActions.some(a => a.spyArea == area.id)) {
                message.channel.send(`:warning: **${player.username} already has a spy action to spy ${area.id} next phase!** If you want to clear it, use \`!spyclear\``);
            } else {
                client.addSpyAction.run(spyAction);
                message.channel.send(player.username + " next phase will spy: `" + area.id + "` with `" + accuracy + "` accuracy.");
            }

        }

        message.channel.send(formatPlayer(client, player));


        if (current) {

            let spyChannels = client.getSpyChannels.all(message.guild.id);

            let freeSpyChannels = spyChannels.filter(d => d.username == spyAction.username && !d.spyArea);

            //Hack cause Spaceman deleted the channel
            freeSpyChannels = {};

            if (freeSpyChannels.length > 0) {
                //if a spy channel is free use it
                freeSpyChannels[0].areaID = spyAction.areaID;
                client.setSpyChannel.run(freeSpyChannels[0]);
                return message.channel.send(`Spy channel updated.`);
            } else {
                //Else make a new channel
                message.guild.channels.create("spy-" + spyAction.username, {
                    type: 'text',
                    permissionOverwrites: [{
                        id: message.guild.id,
                        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                    },
                    {
                        id: player.discordID,
                        allow: ['VIEW_CHANNEL']
                    }]
                }).then(channel => {

                    //Create Webhooks
                    channel.createWebhook(`SpyWebhook_${spyAction.username}_1`);
                    channel.createWebhook(`SpyWebhook_${spyAction.username}_2`)
                        .then(() => {
                            channel.setParent(settings.spyCategoryID)
                                .then(() => {
                                    newSpyChannel = {
                                        guild_username: `${message.guild.id}_${spyAction.username}`,
                                        guild: message.guild.id,
                                        username: spyAction.username,
                                        areaID: spyAction.areaID,
                                        channelID: channel.id
                                    };
                                    client.setSpyChannel.run(newSpyChannel);
                                    message.channel.send(`New channel created: ${channel.name}`);
                                })
                        })
                        .catch(console.error);
                })
            }



        }
    }


};