const Discord = require('discord.js');
const formatItem = require('../utilities/formatItem').formatItem;

module.exports = {
    formatArea(area, items) {

        //reachable
        const reachable = area.reachable.length === 0 ? '*none*' : area.reachable.join(', ');

        //players present
        var playersPresentString;
        if (area.playersPresent.length == 0) {
            playersPresentString = "*None*" ;
        } else {
            playersPresentString = area.playersPresent.join(", ");
        }

        var itemsString
        if (area.items.length == 0) {
            itemsString = "*None*" ;
        } else {
            area.items.forEach(item => {
                var itemobject = items.find(i => i.id == item);
                if (itemobject != undefined) {
                    itemsString += formatItem(itemobject) + "\n";
                }
            })
            
        }

        return new Discord.RichEmbed()
            .setTitle(area.id)
            .addField('Name', area.name)
            .addField('Description', area.description)
            .addField('Items', itemsString)
            .addField('Connected to', reachable)
            .addField('Players Present', playersPresentString)
            .setImage(area.image)
    }
};