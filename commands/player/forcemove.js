const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'forcemove',
	description: 'Moves a player manually on the map. NOTE: Using this command will prevent the player from overriding this command by disabling `!do`, `!move`, and `!movespecial` until after the phase rollover.' ,
    format: "!forcemove <player> <area>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        if (args.length == 0) {
            return message.channel.send("You need to put an area.");
        }

        const area = client.getArea.get(`${message.guild.id}_${args[0]}`);
        if (!area) {
            return message.channel.send("No area exists with ID `" + args.join(` `) + "`. Use !areas to view all areas.");
        }

        player.move = area.id;
        player.forceMoved = 1; 

        client.setPlayer.run(player);

        message.channel.send(player.username + " will move to: `" + area.id + "`\n" + formatPlayer(client, player), {split: true});

	}
};