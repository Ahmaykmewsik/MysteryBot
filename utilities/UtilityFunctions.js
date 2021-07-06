const getHeartImage = require("./getHeartImage");
const postErrorMessage = require('./errorHandling').postErrorMessage;
//const SpyManagement = require('./SpyManagement');

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
                categoryNum: 0,
                spyCategoryID: null,
                earlogCategoryID: null,
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
        let player = client.getUserInDatabase.get(message.author.id);

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
    },

    GetPlayer(client, message, guildID, playerInputString) {

        var table = client.countPlayers.get(guildID);

        if (table['count(*)'] == 0)
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");

        if (!playerInputString)
            return message.channel.send("You need to enter a player.");

        const player = this.GetPlayerFronInput(client, guildID, playerInputString);

        if (player == undefined)
            return message.channel.send("Invalid username: " + playerInputString);

        return player;
    },


    GetArea(client, message, areaInputString) {
        if (!areaInputString) {
            return message.channel.send("No arguments given. Please specify area ID and desired area description.");
        }

        const area = client.getArea.get(`${message.guild.id}_${areaInputString}`);

        if (area == undefined) {
            return message.channel.send(`No area exists with id \`${areaInputString}\`. Use !areas to view all areas, or !addarea <id> to create a new area.`);
        }

        return area;
    },

    WarnUserWithPrompt(message, promptMessage, Action) {
        const responses = [`y`, `yes`, `n`, `no`];
        const filter = m => responses.includes(m.content.toLowerCase());
        message.channel.send(promptMessage, {
            split: true
        }).then(() => {
            const collector = message.channel.createMessageCollector(filter, {
                time: 30000,
                max: 1
            });
            collector.on('collect', async m => {
                if (m.content.toLowerCase() == 'y' || m.content.toLowerCase() == 'yes') {
                    return await Action();
                } else if (m.content.toLowerCase() == 'n' || m.content.toLowerCase() == 'no') {
                    message.channel.send("Okay, never mind then :)");
                } else {
                    message.channel.send("...uh, okay.");
                }
            })
        }).catch(error => {
            postErrorMessage(error, message.channel);
        });
    },

    async RunCommand(client, message, commandName, args = []) {

        if (commandName.startsWith("!"))
            commandName = commandName.slice(1).toLowerCase();

        const commandObject =
            client.commands.get(commandName) ||
            client.commands.find(
                (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
            );

        if (!commandObject)
            return message.channel.send(`Unrecognized command \`${commandName}\``);

        try {
            commandObject.execute(client, message, args);
        } catch (error) {
            postErrorMessage(error, message.channel);
        }
    },

    FormatInstantConnection(instantConnection) {
        return `\`${instantConnection.area1}->${instantConnection.area2}\``;
    },

    FormatSpyConnection(spyConnection) {
        let a = (spyConnection.active) ? ":white_check_mark:" : ":track_next:";
        let v = (spyConnection.visible) ? ":eye:" : ":ear:";
        return `\`${spyConnection.area1}->${spyConnection.area2} [${spyConnection.accuracy}]\`${v}${a}`;
    },

    FormatSpyAction(spyAction, hiddenFromPlayer = false) {
        let p = (spyAction.permanent) ? ":closed_lock_with_key:" : "";
        let a = (spyAction.active) ? ":white_check_mark:" : ":track_next:";
        let v = (spyAction.visible) ? ":eye:" : ":ear:";
        let ps = (spyAction.playerSpy) ? ":face_with_monocle:" : "";
        if (hiddenFromPlayer)
            return `\`[HIDDEN NON-VISIBLE SPY ACTION]\` ${a}`
        return `\`${spyAction.spyArea} [${spyAction.accuracy}]\`${v}${a}${p}${ps}`;
    },

    MatchSpyAction(a1, a2) {
        return (
            a1.username == a2.username &&
            a1.spyArea == a2.spyArea &&
            a1.active == a2.active &&
            a1.guild == a2.guild
        )
    },

    MatchSpyConnection(c1, c2) {
        return (
            c1.area1 == c2.area1 &&
            c1.area2 == c2.area2 &&
            c1.active == c2.active &&
            c1.guild == c2.guild
        )
    },

    MatchSpyChannel(c1, c2) {
        return (
            c1.guild == c2.guild &&
            c1.username == c2.username &&
            c1.areaID == c2.areaID
        )
    },

    FindMatchedConnections(connection, list) {
        return list.filter(c => this.MatchSpyConnection(connection, c));
    },

    //Returns the objects that are 
    // 1 2 3
    // 1 2
    DifferenceOfSpyActions(list1, list2) {
        return list1.filter(o1 => !(list2.some(o2 => this.MatchSpyAction(o1, o2))));
    },

    DifferenceOfSpyConnections(list1, list2) {
        return list1.filter(o1 => !(list2.some(o2 => this.MatchSpyConnection(o1, o2))));
    },

    DifferenceOfSpyChannels(list1, list2) {
        return list1.filter(o1 => !(list2.some(o2 => this.MatchSpyChannel(o1, o2))));
    },

    //This is so goddamn inefficent but I'm desperate to make this work
    UpdateSpyData(client, guildID, spyConnections = null, spyActions = null, spyChannels = null) {
        if (spyConnections != null) {
            client.deleteAllSpyConnections.run(guildID);
            spyConnections.forEach(c => client.addSpyConnection.run(c));
        }
        if (spyActions != null) {
            client.deleteAllSpyActions.run(guildID);
            spyActions.forEach(a => client.addSpyAction.run(a));
        }
        if (spyChannels != null) {
            client.deleteAllSpyChannelData.run(guildID);
            spyChannels.forEach(c => client.setSpyChannel.run(c));
        }
    },

    // CloneSpyAction(spyAction) {
    //     return {
    //         guild_username: spyAction.guild_username,
    //         username: player.username,
    //         guild: player.guild,
    //         spyArea: spyConnection.area2,
    //         accuracy: spyConnection.accuracy,
    //         permanent: 0,
    //         playerSpy: 0,
    //         visible: spyConnection.visible,
    //         active: 1
    //     }
    // },

    GetHeartEmojis(num) {
        let heart100 = `<:h10:859700259152199721>`;
        let heart075 = `<:h75:859700259064512522>`;
        let heart050 = `<:h50:859700259223109632>`;
        let heart025 = `<:h25:859700259168714762>`;
        let heart000 = `<:h00:859700258950348842>`;

        return GenerateHeartString(num);

        function GenerateHeartString(n) {
            if (n < 0 || n > 30) return "";
            if (n == 0.00) return heart000;
            if (n == 0.25) return heart025;
            if (n == 0.50) return heart050;
            if (n == 0.75) return heart075;
            if (n == 1.00) return heart100;

            let remainder = n % 1.0;
            switch (remainder) {
                case 0.00:
                    return `${GenerateHeartString(n - 1.00)} ${heart100}`;
                case 0.25:
                    return `${GenerateHeartString(n - 0.25)} ${heart025}`;
                case 0.50:
                    return `${GenerateHeartString(n - 0.50)} ${heart050}`;
                case 0.75:
                    return `${GenerateHeartString(n - 0.75)} ${heart075}`;
                default:
                    return "";
            }
        }
    },

    async PostMessage(message, messageString, channelToPost, webhooks, accuracy = 1.0, changeApperance = true) {

        if (messageString.length == 0 && message.attachments.array().length == 0) return;

        let username = message.author.username;
        if (message.member.nickname)
            username = `${message.member.nickname}  [${message.author.username}]`;

        let avatarToDisplay = message.author.avatarURL();

        if (!changeApperance) {
            username = message.client.user.username;
            avatarToDisplay = message.client.user.avatarURL();
            embedFile = undefined;
        }

        var webhook;
        if (!channelToPost.lastMessage) {
            webhook = webhooks.first();
        } else if (!channelToPost.lastMessage.webhookID) {
            webhook = webhooks.first();
        } else {
            webhooks.sweep(w => w.id == channelToPost.lastMessage.webhookID && w.username == username);
            webhook = webhooks.first();
        }

        let content = this.EncryptSpyMessage(messageString, accuracy);

        if (message.attachments.array().length != 0)
            content += "\n" + message.attachments.array()[0].url

        //The magic happens here
        let postedMessage = await webhook.send(content, {
            username: username,
            avatarURL: avatarToDisplay,
            embed: message.embed
        })

        //A little bit of a hack but who cares lol it works
        if (content.includes(">>> *-----Phase ") || content.includes(`:detective: :detective: :detective: **NOW SPYING:`))
            postedMessage.pin();
    },

    EncryptSpyMessage(message, accuracy) {
        if (message.length == 0) return "";
        let messageWords = message.split(" ");
        for (let i = 0; i < messageWords.length; i++) {
            const rand = Math.random();
            if (rand >= accuracy)
                messageWords[i] = "---";
        }
        const newMessage = messageWords.join(" ");
        return newMessage;
    },



    async PostSpyMessage(client, message, spyMessage, spyAction, spyChannels, accuracy = undefined, changeApperance = true) {

        if (!spyAction.active) return;

        if (!accuracy) accuracy = spyAction.accuracy;

        //Check if a spy channel is spying it
        let spyChannelData = spyChannels.find(c => c.areaID == spyAction.spyArea && c.username == spyAction.username);
        if (!spyChannelData) return;

        try {
            let spyChannel = client.channels.cache.get(spyChannelData.channelID);
            if (!spyChannel) {
                //Can't find the discord channel for some reason? So check it exists (will create it if it can)
                let players = client.getPlayers.all(message.guild.id);
                let areas = client.getAreas.all(message.guild.id);
                let spyChannelData = client.getSpyChannels.all(message.guild.id);
                let guild = client.guilds.cache.find(g => g.id == message.guild.guild);
                await SpyManagement.MakeSureSpyChannelsExist(client, null, guild, players, areas, spyChannelData);
                spyChannel = client.channels.cache.get(spyChannelData.channelID);
            }

            const webhooksSpy = await spyChannel.fetchWebhooks();
            this.PostMessage(message, spyMessage, spyChannel, webhooksSpy, accuracy, changeApperance);
        } catch (error) {
            console.error(`Spy channel Error: ` + error);
        }

    },

    async PostSpyNotification_SpyEnd(client, message, spyChannelData) {
        let spyMessage = `:x: :x: :x: **SPYING TERMINATED** :x: :x: :x:`;
        try {
            let spyChannel = client.channels.cache.get(spyChannelData.channelID);
            const webhooksSpy = await spyChannel.fetchWebhooks();
            this.PostMessage(message, spyMessage, spyChannel, webhooksSpy, 1.0, false);
        } catch (error) {
            postErrorMessage(error, message.chanel);
        }
    },

    async NotifyPlayer(client, message, player, notification, settings, pregameOverride = false) {
        
        if (notification.length == 0) return;

        if (settings.phase == null && !pregameOverride)
            return message.channel.send(`The game has not started. ${player.username} was not notified.`);
        
        try {
            await client.users.cache.get(player.discordID).send(notification);
        } catch (error) {
            return message.channel.send(`:x: Failed to send notification to ${player.username}.`);
        }
        
        return message.channel.send(`:exclamation:${player.username} was notified.`);
    }

}