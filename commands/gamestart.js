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

        if (nonAreas.length > 0) {
            return message.channel.send("The following players do not have an area set:\n"
                + "`" + nonAreas.map(p => p.name).join('\n') + "`"
                + "\nAborting game start.");
        }

        message.channel.send("*Setting up game...*");

        // //Change nickname
        // players.forEach(player => {
        //     message.guild.members.forEach(function(member) {
        //         if (member.user.username == player.name) {
        //             member.setNickname(player.character).catch(console.log)
        //         }
        //     })    
        // });

        //Create channels
        console.log("Game Start!");


        //create earlog
        areas.forEach(area => {
            message.guild.createChannel("earlog-" + area.id, {
                type: 'text',
                permissionOverwrites: [{
                    id: message.guild.id,
                    deny: ['SEND_MESSAGES', 'READ_MESSAGES']
                    }]
            }).then(channel => {
                console.log(area.id + " created");
                var earlog_data = client.data.get("EARLOG_DATA");
                if (earlog_data == undefined) {
                    earlog_data = [];
                }
                earlog_data.push({areaid: area.id, channelid: channel.id});
                client.data.set("EARLOG_DATA", earlog_data);
                console.log("Making channel for: " + area.id);
                //create channel
                createChannel(message.guild, area, category.id, phaseCount);
            }).catch(console.error())
        })

        client.data.set("PLAYER_DATA", players);
        client.data.set("PHASE_COUNT", phaseCount);
        client.data.set("AREA_DATA", areas);


        client.channels.get(actionLogChannelID).send("----------------------------\n---------**PHASE " + phaseCount + "**---------\n----------------------------");

        message.channel.send("**The game has begun!**\n"
            + players.map(player => player.name + ": " + player.area).join('\n'));

    }
};