const getHeartImage = require("./getHeartImage");
const postErrorMessage = require('./errorHandling').postErrorMessage;

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

        if (playerInputString.length == 0)
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
            return message.channel.send("No area exists with that ID. Use !areas to view all areas, or !addarea <id> to create a new area.");
        }

        return area;
    },

    WarnUserWithPrompt(message, promptMessage, Action) {
        const responses = [`y`, `yes`, `n`, `no`];
        const filter = m => responses.includes(m.content.toLowerCase());
        message.channel.send(promptMessage, { split: true }).then(() => {
            const collector = message.channel.createMessageCollector(filter, { time: 30000, max: 1 });
            collector.on('collect', m => {
                if (m.content.toLowerCase() == 'y' || m.content.toLowerCase() == 'yes') {
                    return Action();
                }
                else if (m.content.toLowerCase() == 'n' || m.content.toLowerCase() == 'no') {
                    message.channel.send("Okay, never mind then :)");
                }
                else {
                    message.channel.send("...uh, okay.");
                }
            })
        }).catch(error => {
            postErrorMessage(error, message.channel);
        });
    },

    async RunCommand(client, message, command, args = []) {
        const commandObject =
            client.commands.get(command) ||
            client.commands.find(
                (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
            );

        try {
            commandObject.execute(client, message, args);
        } catch (error) {
            postErrorMessage(error, message.channel);
        }
    },

    FormatInstantConnection(instantConnection) {
        return `${instantConnection.area1}->${instantConnection.area2}`;
    },

    FormatSpyConnection(spyConnection) {
        let a = (spyConnection.active) ? " (active)" : "";
        let v = (spyConnection.visible) ? " (visible)" : "";
        return `${spyConnection.area1}->${spyConnection.area2} [${spyConnection.accuracy}]${a}${v}`;
    },

    FormatPlayerSpyAction(spyAction) {
        let p = (spyAction.permanent) ? " (permanent)" : "";
        let a = (spyAction.active) ? " (active)" : "";
        let v = (spyAction.visible) ? " (visible)" : "";
        return `${spyAction.spyArea} [${spyAction.accuracy}]${p}${a}${v}`;
    },

    //Transfers all active spy connections into Spy Actions
    UpdateSpyActions(client, message, spyActionsData, spyConnections, locations) {

        spyConnections.forEach(spyConnection => {
            //If the connection isn't active don't do shit
            if (!spyConnection.active) return;

            //Get all players in the spyConnection's area
            let playerLocationsInSpyArea = locations.filter(l => l.areaID == spyConnection.area1);

            playerLocationsInSpyArea.forEach(player => {

                //find if the player has a matching spy action
                //A matching spy Action that's already there takes precidnece
                matchingCurrentSpyAction = spyActionsData.find(spyAction =>
                    spyAction.username == player.username &&
                    spyAction.spyArea == spyConnection.area2
                );
                if (matchingCurrentSpyAction) return;

                newSpyAction = {
                    guild_username: player.guild_username,
                    username: player.username,
                    guild: player.guild,
                    spyArea: spyConnection.area2,
                    accuracy: spyConnection.accuracy,
                    permanent: 0,
                    visible: spyConnection.visible,
                    active: 1
                }
                client.addSpyAction.run(newSpyAction);
            })

        });
    },


    Emoji(client, emojiID) {
        //return 
 


        //return client.emojis.cache.get(emojiID);
    }
}