module.exports = {
    sendPassMessages(members, players, location, channel) {
        let passingMessagesArray = [];
        players.forEach(player => {
            //Don't do anything if the player didn't send movement
            if (player.move == undefined) return;

            //find players where they're passing each other and send them a notification DM that it happened
            let playerLocation = location.find(l => l.username == player.username);

            //Don't do anything if player is staying still
            if (player.move == playerLocation.areaID) return;

            swappers = players.filter(mover => {
                let moverLocation = location.find(l => l.username == mover.username);
                return playerLocation.areaID == mover.move && player.move == moverLocation.areaID && mover.username != playerLocation.username;
            });
            
            if (swappers.length > 0) {
                const swappersString = swappers.map(s => s.character).join(', ');
                playerobject = members.find(m => m.user.id == player.discordID);

                try {
                    const swapMessage = "On your way to `" + player.move + "` you pass by: " + swappersString;
                    playerobject.send(swapMessage);
                    passingMessagesArray.push({
                        username: player.username,
                        message: swapMessage
                    });
                } catch(error) {
                    channel.send("Failed to print passing message for " + player.username + " to " + player.move);
                    console.error(error);
                }
            }
        })

        if (passingMessagesArray.length == 0) {
            return "No passing messages sent";
        } else {
            return "Passing messages sent:\n" + passingMessagesArray.map(m => `${m.username}: ${m.message}`).join("\n");
        }
    }
};