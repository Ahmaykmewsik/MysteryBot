const Discord = require('discord.js');

module.exports = {
    sendPassMessages(players) {
        players.forEach(player => {
            swappers = players.filter(p => (p.area == player.move) && (p.move == player.area));
            console.log(swappers);
            if (swappers > 0) {
                var swappersString = swappers.ForEach(s => swappersString += "\n" + s.character );
                player.send("On your way to " + p.move + " you pass by the following:" + swappersString);
            }
      
        });
    }
};