
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'spyclear',
    description: 'Clears a player\'s spy action.',
    format: "!spyclear <player> [current]",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        if (players == undefined) {
            return message.channel.send("You don't have any players!");
        }

        const items = client.data.get("ITEM_DATA");

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        //find player based on input
        const playerObject = players.find(p => p.name.toLowerCase().includes(inputusername));

        //Notify if invalid input for user
        if (playerObject == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        if (args.length == 0) {
            playerObject.spyAction = [];
        } else if (args.length == 1) {
            if (args[0] == "current") {
                const spyChannelData = client.data.get("SPY_CHANNEL_DATA");
                spyChannelData.forEach(d=>{
                    if (d.player == playerObject.name) {
                        d.area = undefined;
                    }
                })
                playerObject.spyCurrent = [];
                client.data.set("SPY_CHANNEL_DATA", spyChannelData);
            }
            else {
                message.channel.send("Invalid final tolken.");
            }
        }

    
        client.data.set("PLAYER_DATA", players);

        message.channel.send(playerObject.name + "'s spy Action has been cleared.");

        message.channel.send(formatPlayer(playerObject, items));
    }
};