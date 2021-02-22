const Discord = require('discord.js');

module.exports = {
    formatArea(area) {

        //const reachable = area.reachable.length === 0 ? '*none*' : area.reachable.join(', ');

        //players present
        // var playersPresentString;
        // if (area.playersPresent.length == 0) {
        //     playersPresentString = "*None*" ;
        // } else {
        //     playersPresentString = area.playersPresent.join(", ");
        // }

        var descriptionString;
        if (area.description == undefined){
            descriptionString = "Nothing is here.";
        } else {
            descriptionString = area.description;
        }
        
        if (descriptionString.length > (1024)){
            descriptionString = descriptionString.substring(0, 1024-3) + "...";
        }

        return new Discord.RichEmbed()
            //.setTitle(area.id)
            .addField(area.id, 
                `__Connections__: UNIMPLEMENTED
                __Players Present__: UNIMPLEMENTED\n`
                )
            .addField('DESCRIPTION', descriptionString)
            .setImage(area.image)
    }
};