const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'status',
	description: 'Gives a status on what actions have been sent in.',
    format: "!status",
    aliases: ['s'],
    gmonly: true,
	execute(client, message, args) {

        const settings = UtilityFunctions.GetSettings(client, message.guild.id);
		if (!settings.phase) {
			return message.channel.send("No game is currently in progress.");
		}

        let players = client.getPlayers.all(message.guild.id);
        if (players == undefined || players.length === 0) {
            return message.channel.send("No players found. Use !addplayers <role> to set up a game with players in a given role.");
        }

        let locations = client.getLocations.all(message.guild.id);
        if (locations.length == 0) {
            return message.channel.send("No locations found. What the hell have you been doing?");
        }

        if (args.length == 0) {
            const outputMessage = CreateStatusMessage(players);
            message.channel.send(outputMessage, {split: true});
            return;
        }

        else if (args.length == 1) {

            const id = args[0];
            const area = client.getArea.get(`${message.guild.id}_${id}`);
            if (!area) {
                return message.channel.send("No area exists with ID `" + id + "`.");
            }
            const playersInArea = client.getPlayersOfArea.all(id, message.guild.id);
            if (playersInArea.length > 0) {
                let outputMessage = CreateStatusMessage(playersInArea);
                outputMessage = "__**" + area.name + "**__\n" + outputMessage;
                message.channel.send(outputMessage, {split: true});
            } else {
                message.channel.send(`No players are currently in \`${id}\``);
            }
            
            return;
        }

        else {
            message.channel.send("Too many arguments. Please enter an area.");
        }


        function CreateStatusMessage(players) {
            let outputMessageArray = [];
            outputMessageArray.push("--------ACTIONS--------");
            players.forEach(player => {
                let toAdd = `:small_orange_diamond:__${player.character.toUpperCase()}__ [${player.username}]: `;
                if (player.action == undefined){
                    toAdd += "**NONE**"
                } else {
                    toAdd += "`[" + player.roll + "]` " + player.action;
                }
                outputMessageArray.push(toAdd);
            });
    
            outputMessageArray.push("--------MOVEMENT--------");
            players.forEach(player => {
                let toAdd = `:small_blue_diamond:__${player.character.toUpperCase()}__: `;
                
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