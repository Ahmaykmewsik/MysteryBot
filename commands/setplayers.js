module.exports = {
	name: 'setplayers',
	description: 'Sets the list of players to all people with a given role',
    format: "!setplayers <role>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        const playerRole = args.join(' ');
        console.log("Player role: ", playerRole);
        if (playerRole.length == 0) {
            return message.channel.send("You need to enter a role.");
        }

        const existingRole = message.guild.roles.find(r => r.name == playerRole);
        if (!existingRole) {
            return message.channel.send("Role not found.");
        }
        
        var players = existingRole.members.map(member => ({name: member.user.username, area: undefined, move: undefined}));
        client.data.set("PLAYER_DATA", players);

        message.channel.send("Player list set! " + players.length + " players participating.\n**PLAYER LIST:**\n*"
            + players.map(p => p.name).join('\n') + "*");
        
	}
};