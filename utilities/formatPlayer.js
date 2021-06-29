const Discord = require('discord.js');
const formatItem = require('./formatItem').formatItem;
const getHeartImage = require('./getHeartImage').getHeartImage;
const UtilityFunctions = require('./UtilityFunctions');

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

        let spyActions = client.getSpyActions.all(player.guild_username);
        let spyActionString = (spyActions.length == 0) ? "-" : spyActions.map(s => UtilityFunctions.FormatPlayerSpyAction(s)).join(", ");

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
        const attachment = new Discord.MessageAttachment(heartImageURL, "hearts.png");

        let infoText = MakeInfoText(status, player.health, areaString, spyActionString, actionString, moveString, moveSpecialString)

        if (embed) {
            if (infoText.length > (1024)) {
                let difference = infoText.length - actionString.length;
                actionString = actionString.substring(0, 1024 - difference) + "...";
                infoText = MakeInfoText(status, player.health, areaString, spyActionString, actionString, moveString, moveSpecialString)
            }

            return new Discord.MessageEmbed()
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


        function MakeInfoText(status, health, areaString, spyActionString, actionString, moveString, moveSpecialString) {
            return "__Status:__ **" + status + "**" +
                "\n__Health:__ **" + health + "**" +
                "\n__Area:__ **" + areaString + "**" +
                "\n__Spy Actions:__ *" + spyActionString + "*" +
                "\n__Phase Action:__ *" + actionString + "*" +
                "\n__Movement Action:__ *" + moveString + "*" +
                "\n__MoveSpecial:__ *" + moveSpecialString + "*";
        }
    }
};