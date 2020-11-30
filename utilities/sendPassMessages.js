
module.exports = {
    sendPassMessages(members, players) {
        players.forEach(player => {
            //find players who are swapping locations
            console.log("Looking for passerbys.");
            swappers = players.filter(p => (player.area == p.move) && (player.move == p.area) && (player.move != player.area) && (player.area != undefined));
            if (swappers.length > 0) {
                const swappersString = swappers.map(s => s.character).join(', ');
                playerobject = members.find(m => m.user.username == player.name)

                if (playerobject != null) {
                    playerobject.send("On your way to " + player.move + " you pass by: " + swappersString)
                }
                else {
                    console.log("Failed to print passing message for " + player.username + " to " + player.move);
                }
            }
        });
    }
};