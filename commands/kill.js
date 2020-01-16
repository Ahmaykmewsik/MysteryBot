const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'kill',
	description: 'Kills a player and removes them from the game',
    format: "!kill <username>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");

        if (players == undefined) {
            return message.channel.send("You don't have any players. There's no one to kill!");
        }

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        //find player based on input
        var playerToDie;
        message.guild.members.forEach(function(member) {
            if (member.user.username.toLowerCase().includes(inputusername)) {
                playerToDie = member.user;
            }
        })    

        //Notify if invalid input for user
        if (playerToDie == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        players.forEach(function(p) {
            if (p.name == playerToDie.username) {
                p.area = undefined;
            }
        });
  
        client.data.set("PLAYER_DATA", players);

        message.channel.send(playerToDie.username + " is dead!\n");
	}
};