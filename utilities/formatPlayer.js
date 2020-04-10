const Discord = require('discord.js');
const formatItem = require('../utilities/formatItem').formatItem;

module.exports = {
    formatPlayer(player, items) {
        const status = (player.area == undefined) ? 'Dead' : '**ALIVE**';

        const color = (status == "Dead") ? 0xff0000 : 0x00ff11; // RED : GREEN

        const areaString = (player.area == undefined) ? "-" : player.area;

        const actionString = (player.action == undefined) ? "-" : player.action;

        const moveString = (player.move == undefined) ? "-" : player.move;
        
        var itemString = "*No Items.*" 
        if (player.items.length != 0) {
            itemString = "";
            player.items.forEach(item => { 
                var itemobject = items.find(i => i.id == item);
                if (itemobject != undefined) {
                    itemString += formatItem(itemobject) + "\n"
                }
            });
        }

        return new Discord.RichEmbed()
            .setColor(color)
            .setTitle("**" + player.name + "**")
            .addField(status,
                "__Character:__ **" + player.character + "**" +
                "\n__Area:__ **" + areaString + "**" +
                "\n__Phase Action:__ *" + actionString + "*" +
                "\n__Movement Action:__ *" + moveString + "*"
                )
            .addField("Items:", itemString)
    }
};