const Discord = require('discord.js');
const formatItem = require('./formatItem').formatItem;
const getHeartImage = require('./getHeartImage').getHeartImage;

module.exports = {
    formatPlayer(client, player) {

        const status = (player.alive) ? '**ALIVE**' : 'Dead';

        const color = (status == "Dead") ? 0xff0000 : 0x00ff11; // RED : GREEN
        
        const playerLocation = client.getLocationOfPlayer.all(`${player.guild}_${player.username}`);
        const areaString = (playerLocation == []) ? "-" : JSON.stringify(playerLocation);

        const actionString = (player.action == undefined) ? "-" : player.action;

        const moveString = (player.move == undefined) ? "-" : player.move;

        const moveSpecialString = (player.moveSpecial == undefined) ? "-" : player.moveSpecial;
        
        //const spyActionString = (player.spyAction.length == 0) ? "-" : player.spyAction;

        //const spyCurrentString = (player.spyCurrent.length == 0) ? "-" : player.spyCurrent;
        
        // var itemString = "*No Items.*" 
        // if (player.items.length > 0) {
        //     itemString = "";
        //     player.items.forEach(item => { 
        //         var itemobject = items.find(i => i.id == item);
        //         if (itemobject != undefined) {
        //             itemString += formatItem(itemobject) + "\n"
        //         }
        //     });
        // }

        const heartImageURL = getHeartImage(player.health); 
        const attachment = new Discord.Attachment(heartImageURL, "hearts.png");

        return new Discord.RichEmbed()
            .setColor(color)
            .setTitle("**" + player.username + "**")
            .addField(status,
                "__Character:__ **" + player.character + "**" +
                "\n__Health:__ **" + player.health + "**" +
                "\n__Area:__ **" + areaString + "**" +
                //"\n__Spy Action:__ *" + spyActionString + "*" +
                //"\n__Spy Current:__ *" + spyCurrentString + "*" +
                "\n__Phase Action:__ *" + actionString + "*" +
                "\n__Movement Action:__ *" + moveString + "*" + 
                "\n__MoveSpecial:__ *" + moveSpecialString + "*"
                )
            //.addField("Items:", itemString)
            .attachFile(attachment)
            .setThumbnail("attachment://hearts.png")
    }
};