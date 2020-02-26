const Discord = require('discord.js');

module.exports = {

    formatItem(item) {

        var infoStringArray = []

        if (item.primary) infoString.push("Primary");

        if (item.use_capacity != -1) infoString.push("(" + item.use_count + " of " + item.use_capacity + ") Uses");
            
        if (item.big) infoString.push("BIG");

        return new Discord.RichEmbed()
        .addField(item.id, item.description + "\n" + infoString.join(", "));
    }
};