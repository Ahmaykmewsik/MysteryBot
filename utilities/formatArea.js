const Discord = require('discord.js');

module.exports = {
    formatArea(area) {
        const reachable = area.reachable.length === 0 ? '*none*' : area.reachable.join(', ');
        return new Discord.RichEmbed()
            .setTitle(area.id)
            .addField('Name', area.name)
            .addField('Description', area.description)
            .addField('Connected to', reachable);
    }
};