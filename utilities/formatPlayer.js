const Discord = require('discord.js');

module.exports = {
    formatPlayer(player) {
        const status = (player.area == undefined) ? 'Dead' : 'Alive';
        return new Discord.RichEmbed()
            .setTitle(player.name)
            .addField('Status', status)
            .addField('Area', player.area)
            .addField('Movement action', player.move);
    }
};