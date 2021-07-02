const createChannels = require('../../utilities/createChannels.js').createChannels;
const UtilityFunctions = require('../../utilities/UtilityFunctions');
const ChannelCreationFunctions = require('../../utilities/channelCreationFunctions.js');
const postErrorMessage = require('../../utilities/errorHandling').postErrorMessage;

module.exports = {
    name: 'gamestart',
    description: 'Starts the game! In order to use, you need to have:\nPlayers\nAreas\nRun `!gamename`\nrRun `!actionlog`\nPut all players in a starting location (use `!setarea` or `!setarearandom`).',
    format: "!gamestart",
    gmonly: true,
    async execute(client, message, args) {

        let players = client.getPlayers.all(message.guild.id);
        if (players == undefined || players.length === 0)
            return message.channel.send("Nope. Can't do that. You don't got no players! Setup your god damn game first.");

        let areas = client.getAreas.all(message.guild.id);
        if (areas == undefined || areas.length === 0)
            return message.channel.send("No areas found. Use !addarea to create an area.");


        let locations = client.getLocations.all(message.guild.id);

        let settings = UtilityFunctions.GetSettings(client, message.guild.id);
        if (!settings.categoryName)
            return message.channel.send("You need to name the game! Use `!gamename` to name the game. (This will create a catagory with that name)");

        if (!settings.actionLogID)
            return message.channel.send("You need to set the action log! Use `!actionlog` to set the action log.");

        const lonelyPlayers = client.getPlayersWithoutLocation.all(message.guild.id);
        if (lonelyPlayers.length > 0) {
            return message.channel.send("The following players do not have an area set:\n"
                + "`" + lonelyPlayers.map(p => p.username).join('\n') + "`"
                + "\nAborting game start.");
        }

        if (settings.phase) {
            
            let warningMessage = `The game has already started phase ${settings.phase}. Are you SURE you want to run this again? (You probably DON'T!) (y/n)`;
            return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, GameStart);
        }

        
        UtilityFunctions.RunCommand(client, message, "stats");
        let warningMessage = "\n\n";
        while (warningMessage.length < 200) {
            warningMessage += ":checkered_flag:"
        }
        warningMessage += `\n\n**Looks like everything is ready to go. Start the game? (y/n)**`;
        return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, GameStart);
            

        async function GameStart() {
            message.channel.send("*Then it's time to start!*");
            console.log(`GAME START FOR: ${settings.categoryName}`);
    
            if (settings.phase == null)
                settings.phase = 1;
    
            //If you're running !gamestart you probably don't have any earlogs you care about, so delete them.
            client.deleteAllEarlogChannelData.run(message.guild.id);
    
            //create earlogs
            areas.forEach(async area => {
                await ChannelCreationFunctions.CreateEarlog(client, message, area);
            })
    
            //Create spy category and store it
            let categoryObject = await message.guild.channels.create("SPY CHANNELS", { type: 'category' });
            settings.spyCategoryID = categoryObject.id;
            client.setSettings.run(settings);
    
            //set position underneath game category
            let position = message.guild.channels.cache.get(settings.categoryID).position;
    
            if (position)
                categoryObject.setPosition(position + 1);
    
            try {
                await createChannels(client, message, areas, players, locations, settings);
            }  catch (error) {
                postErrorMessage(error, message.channel);
            }
            
            client.channels.cache.get(settings.actionLogID).send(
                "----------------------------\n---------**PHASE " + settings.phase + "**---------\n----------------------------"
            );
    
            message.channel.send("**The game has begun!**\n" + locations.map(l => l.username + ": " + l.areaID).join('\n'));
        }

    }
};