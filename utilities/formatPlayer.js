const Discord = require('discord.js');
const formatItem = require('./formatItem').formatItem;
const getHeartImage = require('./getHeartImage').getHeartImage;

module.exports = {
    formatPlayer(client, player, embed = 1) {

        embed = 0;

        const status = (player.alive) ? '**Alive**' : 'Dead';

        const color = (status == "Dead") ? 0xff0000 : 0x00ff11; // RED : GREEN
        
        const playerLocation = client.getLocationOfPlayer.all(`${player.guild}_${player.username}`);
        const areaString = (playerLocation.length == 0) ? "-" : playerLocation.map(l => l.areaID).join(", ");

        let actionString = (player.action == undefined) ? "-" : player.action;

        const moveString = (player.move == undefined) ? "-" : player.move;

        const moveSpecialString = (player.moveSpecial == undefined) ? "-" : player.moveSpecial;
        
        let spyAction = client.getSpyActions.all(player.guild_username);
        let spyActionString = (spyAction.length == 0) ? "-" : spyAction.map(s => {let p = (s.permanent) ? " (permanent)" : ""; return `${s.spyArea} [${s.accuracy}]${p}`}).join(", ");

        const spyCurrent = client.getSpyCurrent.all(player.guild_username);
        const spyCurrentString = (spyCurrent.length == 0) ? "-" : spyCurrent.map(s => `${s.spyArea} [${s.accuracy}]`).join(", ");
        
        const inventoryData = client.getItemsAndInventories.all(player.guild);
        const playerInventoryData = inventoryData.filter(d => d.username == player.username);

        let itemString = "*No Items.*" 
        if (playerInventoryData.length > 0) {
            itemString = "";
            playerInventoryData.forEach(d => {
                itemString += formatItem(client, d, false) + "\n"
            });
        }

        const heartImageURL = getHeartImage(player.health); 
        const attachment = new Discord.Attachment(heartImageURL, "hearts.png");

        function MakeInfoText(status, health, areaString, spyActionString, spyCurrentString, actionString, moveString, moveSpecialString){
            return  "__Status:__ **" + status + "**" +
                    "\n__Health:__ **" + health + "**" +
                    "\n__Area:__ **" + areaString + "**" +
                    "\n__Spy Action:__ *" + spyActionString + "*" +
                    "\n__Spy Current:__ *" + spyCurrentString + "*" +
                    "\n__Phase Action:__ *" + actionString + "*" +
                    "\n__Movement Action:__ *" + moveString + "*" + 
                    "\n__MoveSpecial:__ *" + moveSpecialString + "*";
        }

        let infoText = MakeInfoText(status, player.health, areaString, spyActionString, spyCurrentString, actionString, moveString, moveSpecialString)

        if (embed) {
            if (infoText.length > (1024)) {
                let difference = infoText.length - actionString.length;
                actionString = actionString.substring(0, 1024 - difference) + "...";
                infoText = MakeInfoText(status, player.health, areaString, spyActionString, spyCurrentString, actionString, moveString, moveSpecialString)
            }
    
            return new Discord.RichEmbed()
                .setColor(color)
                .setTitle("**" + player.username + "**")
                .addField(player.character.toUpperCase(), infoText)
                .addField("Items:", itemString)
                .attachFile(attachment)
                .setThumbnail("attachment://hearts.png")
        } else {
            const circle = (player.alive) ? `:green_circle:` : `:red_circle:` 
            return `${circle} **${player.username}** ${circle}\n__Character:__** ${player.character}**\n${infoText}\n\n__ITEMS__\n${itemString}`;
        }
    }
};