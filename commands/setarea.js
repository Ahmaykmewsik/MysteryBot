

module.exports = {
	name: 'setarea',
	description: 'Manually sets the area for a player. You should only need to use this command if you kill a player by accident.',
    format: "!setarea <username> <areaid>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        var areas = client.data.get("AREA_DATA");

        if (players == undefined) {
            return message.channel.send("You don't have any players. What the heck!?");
        }

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        //find player based on input
        var playerToSet;
        message.guild.members.forEach(function(member) {
            if (member.user.username.toLowerCase().includes(inputusername)) {
                playerToSet = member.user;
            }
        })    

        //Notify if invalid input for user
        if (playerToSet == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        //remove from all areas
        areas.forEach(area => {
            area.playersPresent = area.playersPresent.filter(p => p != playerToSet.username);
        });

        //Find area
        var areaToSet;
        areaToSet = areas.find(area => area.id == args[0]);
        if (areaToSet == undefined) {
            areaToSet = areas.find(area => area.id.includes(args[0]));
            if (areaToSet == undefined) {
                return message.channel.send("No area exists with that ID.");
            }
        }

        //Set the area
        players.forEach(function(p) {
            if (p.name == playerToSet.username) {
                p.area = areaToSet.id;
                areaToSet.playersPresent.push(p.name);
            }
        });
        
        client.data.set("PLAYER_DATA", players);
        client.data.set("AREA_DATA", areas);

        message.channel.send(playerToSet.username + "'s area has been manually set.\n");

	}
};