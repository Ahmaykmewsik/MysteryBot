const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'addplayer',
	description: 'Adds a player to the game',
    format: "!addplayer <username> <Character>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send("You need to enter a user.");
        }

        const inputusername = args.shift().toLowerCase();
        const characterName = args.join(" ");

        //find player based on input
        var playerobject;
        message.guild.members.cache.forEach(function(member) {
            if (member.user.username.toLowerCase().includes(inputusername)) {
                playerobject = member.user;
            }
        })
            
        //Notify if invalid input for user
        if (playerobject == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        const playerExists = client.getUserInDatabase.get(playerobject.username);

        if (playerExists) {
            if (playerExists.guild == message.guild.id) {
                return message.channel.send(`Adding player failed. ${playerobject.username} is already a player in this server!`);
            }
            else {
                //TODO: Check if game is in progress. If it isn't, delete it!
                return message.channel.send(`Adding player failed. ${playerobject.username} is currently in a game on another server!`);
            }
        }

        if (characterName.length == 0) {
            return message.channel.send("You need to enter a character name.");
        }

        const settings = UtilityFunctions.GetSettings(client, message.guild.id);
        
        const newPlayer = {
            guild_username: `${message.guild.id}_${playerobject.username}`,
            username: playerobject.username,
            guild: message.guild.id,
            character: characterName,
            discordID: playerobject.id,
            alive: 1,
            health: settings.defaultHealth,
            action: null,
            roll: null,
            move: null,
            moveSpecial: null,
            forceMoved: 0
        };

        client.setPlayer.run(newPlayer);

        const players = client.getPlayers.all(message.guild.id);

        var outputMessage = `Player added! ${players.length} players so far.\n__**PLAYER LIST:**__\n`

        for (let player in players) {
            outputMessage += `**${players[player].username}**, ${players[player].character}\n`
        }
        
        message.channel.send(outputMessage);
        
	}
};