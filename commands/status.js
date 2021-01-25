const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'status',
	description: 'Gives a status on what actions have been sent in.',
    format: "!status",
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        if (players == undefined || players.length === 0) {
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        }

        const items = client.data.get("ITEM_DATA");

        var outputMessageArray = [];
        outputMessageArray.push("--------ACTIONS--------");
        players.forEach(player => {
            var toAdd = "`" + player.name.toUpperCase() + "`: ";
            if (player.action == undefined){
                toAdd += "**NONE**"
            } else {
                toAdd += player.action;
            }
            outputMessageArray.push(toAdd);
        });

        outputMessageArray.push("--------MOVEMENT--------");
        players.forEach(player => {
            var toAdd = "`" + player.name.toUpperCase() + "`: ";
            if (player.move == undefined && player.movespecial == undefined) {
                toAdd += "**NONE**";
            }
            else if (player.movespecial != undefined) {
                toAdd += player.movespecial;
            }
            else if (player.move != undefined) {
                toAdd += player.move;
            }
            outputMessageArray.push(toAdd);
        })

        var outputMessage = "";
        while (outputMessageArray.length > 0) {
            var m = outputMessageArray.shift();
            if ((outputMessage + m).length > 2000) {
                message.channel.send(outputMessage);
                outputMessage = m;
            } else {
                outputMessage += (m + "\n");
            }
        }
        message.channel.send(outputMessage);
    }
};