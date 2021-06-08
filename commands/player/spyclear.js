const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'spyclear',
    description: 'Clears a player\'s spy action.',
    format: "!spyclear <player> [current]",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        if (args.length == 0) {
            client.deleteSpyActions.run(`${message.guild.id}_${player.username}`);
        } else if (args.length == 1) {
            if (args[0] == "-c" || "current") {
                
                client.deleteSpyCurrent.run(`${message.guild.id}_${player.username}`);
                message.channel.send(player.username + "'s Current spy actions has been cleared. They are no longer spying anything.");
                message.channel.send(formatPlayer(client, player));
                return;
            }
            else {
                message.channel.send("Invalid final tolken.");
            }
        }

        message.channel.send(player.username + "'s spy Action has been cleared.");
        message.channel.send(formatPlayer(client, player));
    }
};