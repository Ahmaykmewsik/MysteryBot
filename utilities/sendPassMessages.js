const Discord = require('discord.js');

module.exports = {
    sendPassMessages(members, players) {
        players.forEach(player => {
            swappers = players.filter(p => (player.area == p.move) && (player.move == p.area));
            if (swappers.length > 0) {
                const swappersString = swappers.map(s => s.character).join(', ');
                playerobject = members.find(m => m.user.username == player.name);
                playerobject.send("On your way to " + player.move + " you pass by: " + swappersString);
            }
      
        });
    }
};