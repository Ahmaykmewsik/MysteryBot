module.exports = {
    sendPassMessages(members, players, channel) {
        players.forEach(player => {
            //Don't do anything if we're in or going to multiarea mode
            if ((Array.isArray(player.area) && player.area.length > 1) || player.area == undefined) {return;}
            if ((Array.isArray(player.move) && player.move.length > 1) || player.area == undefined) {return;}
            if (player.move == undefined) {return;}

            //find players where they're passing each other and send them a notification DM that it happened
            swappers = players.filter(p => (player.area.includes(p.move)) && (player.move.includes(p.area)));
            if (swappers.length > 0) {
                const swappersString = swappers.map(s => s.character).join(', ');
                playerobject = members.find(m => m.user.username == player.name)

                try {
                    playerobject.send("On your way to `" + player.move + "` you pass by: " + swappersString)
                } catch(error) {
                    channel.send("Failed to print passing message for " + player.username + " to " + player.move);
                    console.error(error);
                }
                  
            }
        });
    }
};