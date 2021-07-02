const Discord = require('discord.js');
const formatItem = require('./formatItem').formatItem;
const getHeartImage = require('./getHeartImage').getHeartImage;
const UtilityFunctions = require('./UtilityFunctions');

module.exports = {
    formatPlayer(client, player, playerView = 0) {

        embed = 0;

        const status = (player.alive) ? '**Alive**' : 'Dead';

        const color = (status == "Dead") ? 0xff0000 : 0x00ff11; // RED : GREEN

        const playerLocation = client.getLocationOfPlayer.all(`${player.guild}_${player.username}`);
        const areaString = (playerLocation.length == 0) ? "-" : playerLocation.map(l => l.areaID).join(", ");

        let actionString = (player.action == undefined) ? "-" : player.action;

        const moveString = (player.move == undefined) ? "-" : player.move;

        const moveSpecialString = (player.moveSpecial == undefined) ? "-" : player.moveSpecial;

        let spyActions = client.getSpyActions.all(player.guild_username);
        let spyActionStringFull = (spyActions.length == 0) ? "-" : spyActions.map(s => UtilityFunctions.FormatSpyAction(s)).join(", ");
        let spyActionStringPlayer = (spyActions.length == 0) ? "-" : spyActions.map(s => UtilityFunctions.FormatSpyAction(s, !s.visible)).join(", ");

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

        let infoText = (playerView) ?
            MakeInfoText(status, player.health, areaString, spyActionStringPlayer, actionString, moveString, moveSpecialString):
            MakeInfoText(status, player.health, areaString, spyActionStringFull, actionString, moveString, moveSpecialString);
 
        const circle = (player.alive) ? `:green_circle:` : `:red_circle:`
        return `${circle} **${player.username}** ${circle}\n__Character:__** ${player.character}**\n${infoText}\n\n__ITEMS__\n${itemString}`;

        function MakeInfoText(status, health, areaString, spyActionString, actionString, moveString, moveSpecialString) {
            return "__Status:__ **" + status + "**" +
                "\n__Health:__ **" + health + "**" +
                "\n__Area:__ **" + areaString + "**" +
                "\n__Spy Actions:__ " + spyActionString +
                "\n__Phase Action:__ *" + actionString + "*" +
                "\n__Movement Action:__ *" + moveString + "*" +
                "\n__MoveSpecial:__ *" + moveSpecialString + "*";
        }
    }
};