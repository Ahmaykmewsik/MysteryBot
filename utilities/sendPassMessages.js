const Discord = require('discord.js');

module.exports = {
    sendPassMessages(members, players) {
        players.forEach(player => {
            //find players who are swapping locations
            swappers = players.filter(p => (player.area == p.move) && (player.move == p.area) && (player.move != player.area));
            if (swappers.length > 0) {
                const swappersString = swappers.map(s => s.character).join(', ');
                playerobject = members.find(m => m.user.username == player.name);
                playerobject.send("On your way to " + player.move + " you pass by: " + swappersString);
            }
      
        });
    }
};