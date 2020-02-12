const createChannel = require('../utilities/createChannel.js').createChannel;

module.exports = {
	name: 'gamestart',
	description: 'Assigns each player a random starting area',
    format: "!gamestart",
    gmonly: true,
	execute(client, message, args) {
        
        var players = client.data.get("PLAYER_DATA");
        if (players == undefined || players.length === 0) {
            return message.channel.send("No players found. Use !addplayers <role> to set up a game with players in a given role.");
        }

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined || areas.length === 0) {
            return message.channel.send("No areas found. Use !addarea to create an area.");
        }

        const category = client.data.get("CATEGORY_DATA");
        if (category == undefined) {
            return message.channel.send("You need to name the game! Use !gamename to name the game. (This will set the catagory name)");
        }

        const actionLogChannelID = client.data.get("ACTION_LOG");
		if (actionLogChannelID == undefined) {
			return message.channel.send("You need to set the action log!");
		}

        const phaseCount = 1;

        const nonAreas = players.filter(p => (p.area == undefined))

        console.log(nonAreas);

        if (nonAreas.length > 0) {
            return message.channel.send("The following players do not have an area set:\n"
                + "`" + nonAreas.map(p => p.name).join('\n') + "`"
                + "\nAborting game start.");
        }

        //Change nickname
        players.forEach(player => {
            var playerobject;
            message.guild.members.forEach(function(member) {
                if (member.user.username == player.name) {
                    playerobject = member;
                }
            })    
            playerobject.setNickname(player.character)
            .catch(console.error)
        });

        areas.forEach(area => {
            createChannel(message.guild, area, category.id, phaseCount); 
        });

        client.data.set("PLAYER_DATA", players);
        client.data.set("PHASE_COUNT", phaseCount);
        client.data.set("AREA_DATA", areas);

        client.channels.get(actionLogChannelID).send("----------------------------\n---------**PHASE " + phaseCount + "**---------\n----------------------------");

        message.channel.send("**The game has begun!**\n"
            + players.map(player => player.name + ": " + player.area).join('\n'));
    }
};