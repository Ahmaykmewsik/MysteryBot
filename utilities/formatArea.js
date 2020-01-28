const Discord = require('discord.js');

module.exports = {
    formatArea(area) {
        const reachable = area.reachable.length === 0 ? '*none*' : area.reachable.join(', ');

        if (area.playersPresent.length == 0) {
            var playersPresentString = "*None*" ;
        } else {
            var playersPresentString = "";
            area.playersPresent.forEach(id => {
                playersPresentString += (id + " ");
            });
        }
        console.log(area.canspawn);
        return new Discord.RichEmbed()
            .setTitle(area.id)
            .addField('Name', area.name)
            .addField('Description', area.description)
            .addField('Connected to', reachable)
            .addField('Players Present', playersPresentString)
            .addField("Can Spawn", area.canspawn)
    }
};