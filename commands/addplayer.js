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

        if (characterName.length == 0) {
            return message.channel.send("You need to enter a character name.");
        }

        //find player based on input
        var player;
        message.guild.members.forEach(function(member) {
            if (member.user.username.toLowerCase().includes(inputusername)) {
                player = member.user;
            }
        })
            
        //Notify if invalid input for user
        if (player == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }


        var players = client.data.get("PLAYER_DATA");

        if (players == undefined) {
            players = [];
        }

        players.push({
            player: player, 
            name: player.username, 
            character: characterName, 
            area: undefined, 
            action: undefined,
            move: undefined,
            items: []
        });
        
        client.data.set("PLAYER_DATA", players);

        message.channel.send("Player added! " + players.length + " players so far.\n__**PLAYER LIST:**__\n"
             + players.map(p => "**" + p.name + "**, " + p.character).join('\n'));
        
	}
};