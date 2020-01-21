const Discord = require('discord.js');

module.exports = {
    formatPlayer(player) {
        const status = (player.area == undefined) ? 'Dead' : '**ALIVE**';

        const color = (status == "Dead") ? 0xff0000 : 0x00ff11; // RED : GREEN

        const areaString = (player.area == undefined) ? "-" : player.area;

        const actionString = (player.action == undefined) ? "-" : player.action;

        const moveString = (player.move == undefined) ? "-" : player.move;
        
        if (player.items.length == 0) {
            var itemString = "*No Items.*" ;
        } else {
            var itemString = "";
            player.items.forEach(item => { 
                itemString += "`" + item.id + "` " + item.description + "\n\n";
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