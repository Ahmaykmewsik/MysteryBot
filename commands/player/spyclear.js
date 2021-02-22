const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'spyclear',
    description: 'Clears a player\'s spy action.',
    format: "!spyclear <player> [current]",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        const player = UtilityFunctions.GetPlayerFronInput(client, message.guild.id, inputusername);

        if (player == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        if (args.length == 0) {
            client.deleteSpyActions.run(`${message.guild.id}_${player.username}`);
        } else if (args.length == 1) {
            if (args[0] == "-c" || "current") {
                return message.channel.send("UNIMPLEMENTED");
                const spyChannelData = client.data.get("SPY_CHANNEL_DATA");
                spyChannelData.forEach(d=>{
                    if (d.player == player.name) {
                        d.area = undefined;
                    }
                })
                player.spyCurrent = [];
                client.data.set("SPY_CHANNEL_DATA", spyChannelData);
            }
            else {
                message.channel.send("Invalid final tolken.");
            }
        }

        message.channel.send(player.username + "'s spy Action has been cleared.");
        message.channel.send(formatPlayer(client, player));
    }
};