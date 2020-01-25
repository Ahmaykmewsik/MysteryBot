const Discord = require('discord.js');

module.exports = {
    createChannel(guild, areaName, category, playerArray, phaseNumber, areaDescription) { 

        //If nobody is there, don't make a channel for it
        if (playerArray.length == 0) {
            return;
        }

        guild.createChannel("p" + phaseNumber + "-" + areaName, {
            type: 'text',
            permissionOverwrites: [{
                id: guild.id,
                deny: ['READ_MESSAGES']
              }]
          })
            .then(channel => {
                
                channel.setParent(category.id).catch(console.error);

                //Post the thing
                channel.send(
                    ">>> *-----Phase " + phaseNumber + "-----*\n" +
                    "**" + areaName + "**\n\n" +
                    areaDescription
                )

                //Add players
                playerArray.forEach(playername => {
                    
                    var playerobject;
                    guild.members.forEach(function(member) {
                        if (member.user.username == playername) {
                            playerobject = member.user;
                        }
                    })

                    channel.overwritePermissions(playerobject, {READ_MESSAGES: true}).catch(console.error);
                    channel.send("<@" + playerobject.id + ">");
                })

            })
            .catch(console.error);
    }
};