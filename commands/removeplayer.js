

module.exports = {
	name: 'removeplayer',
	description: 'Removes a player from the game',
    format: "!kill <username>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        var areas = client.data.get("AREA_DATA");

        if (players == undefined) {
            return message.channel.send("You don't have any players. There's no one to remove!");
        }

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        //find player based on input
        var playerToRemove;
        message.guild.members.forEach(function(member) {
            if (member.user.username.toLowerCase().includes(inputusername)) {
                playerToRemove = member.user;
            }
        })    

        //Notify if invalid input for user
        if (playerToRemove == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        //remove from areas
        if (areas != undefined){
            areas.forEach(area => {
                area.playersPresent.filter(p => p != playerToRemove.username);
            });
        }

        players = players.filter(p => p.name != playerToRemove.username);
  
        client.data.set("PLAYER_DATA", players);
        client.data.set("AREA_DATA", areas);

        message.channel.send(playerToRemove.username + " has been removed.");
	}
};