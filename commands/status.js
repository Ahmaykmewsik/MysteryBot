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

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined || areas.length === 0) {
            return message.channel.send("No areas found. Use !addarea to create an area.");
        }

        if (args.length == 0) {
            const outputMessage = CreateStatusMessage(players);
            message.channel.send(outputMessage);
            return;
        }

        if (args.length == 1) {
            var areaToDisplay;
            areaToDisplay = areas.find(area => area.id == args[0]);
            if (areaToDisplay == undefined){
                areaToDisplay = areas.find(area => area.id.includes(args[0]));
                if (areaToDisplay == undefined) {
                    return message.channel.send("No area exists with that ID.");
                }
            }

            const playersInArea = players.filter(p => areaToDisplay.playersPresent.includes(p.name));
            const outputMessage = CreateStatusMessage(playersInArea);
            
            message.channel.send("__**" + areaToDisplay.name + "**__\n" + outputMessage);
            return;
        }

        else {
            message.channel.send("Too many arguments. Please enter an area.");
        }


        function CreateStatusMessage(players) {
            var outputMessageArray = [];
            outputMessageArray.push("--------ACTIONS--------");
            players.forEach(player => {
                var toAdd = ":small_orange_diamond:__" + player.name.toUpperCase() + "__: ";
                if (player.action == undefined){
                    toAdd += "**NONE**"
                } else {
                    toAdd += "`[" + player.roll + "]` " + player.action;
                }
                outputMessageArray.push(toAdd);
            });
    
            outputMessageArray.push("--------MOVEMENT--------");
            players.forEach(player => {
                var toAdd = ":small_blue_diamond:__" + player.name.toUpperCase() + "__: ";
                
                if (player.move == undefined && player.moveSpecial == undefined) {
                    toAdd += "**NONE**";
                }
                else if (player.moveSpecial != undefined) {
                    //check if resolved
                    if (!player.move) {
                        toAdd += ":triangular_flag_on_post:**[UNRESOLVED]**:triangular_flag_on_post: " + player.moveSpecial;
                    } else {
                        toAdd += "`(" + player.move + ")` " + player.moveSpecial;
                    }
                    
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
                    outputMessage = m + "\n";
                } else {
                    outputMessage += (m + "\n");
                }
            }
            
            return outputMessage;
        }
        
        








        
    }
};