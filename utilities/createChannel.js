
module.exports = {
    createChannel(guild, area, category, phaseNumber) { 

        //If nobody is there, don't make a channel for it
        if (area.playersPresent.length == 0) {
            return;
        }

        guild.createChannel("p" + phaseNumber + "-" + area.id, {
            type: 'text',
            permissionOverwrites: [{
                id: guild.id,
                deny: ['READ_MESSAGES']
              }]
          })
            .then(async channel => {

                //Post the thing
                await channel.send(
                    ">>> *-----Phase " + phaseNumber + "-----*\n" +
                    "**" + area.name+ "**\n\n" +
                    area.description
                )

                //Add players
                await area.playersPresent.forEach(playername => {
                    
                    var playerobject;
                    guild.members.forEach(function(member) {
                        if (member.user.username == playername) {
                            playerobject = member.user;
                        }
                    })

                    channel.overwritePermissions(playerobject, {READ_MESSAGES: true}).catch(console.error);
                    channel.send("<@" + playerobject.id + ">");
                })

                await channel.setParent(category.id).catch(console.error);

            })
            .catch(console.error);
    }
};