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
        var playerobject;
        message.guild.members.forEach(function(member) {
            if (member.user.username.toLowerCase().includes(inputusername)) {
                playerobject = member.user;
            }
        })
            
        //Notify if invalid input for user
        if (playerobject == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        let players = client.data.get("PLAYER_DATA");

        if (players == undefined) {
            players = [];
        }

        players.push({
            name: playerobject.username, //string
            character: characterName, //string
            alive: true, //bool
            health: 3.0, //float
            area: undefined, //id
            action: undefined, //string
            move: undefined, //id
            items: [], //list of strings
            spyAction: [],
            spyCurrent: [],
            discordid: playerobject.id
        });
        
        client.data.set("PLAYER_DATA", players);

        message.channel.send("Player added! " + players.length + " players so far.\n__**PLAYER LIST:**__\n"
             + players.map(p => "**" + p.name + "**, " + p.character).join('\n'));
        
	}
};