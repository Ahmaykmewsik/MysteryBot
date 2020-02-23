
module.exports = {
    async createChannel(guild, area, categoryID, phaseNumber) { 

        //If nobody is there, don't make a channel for it
        if (area.playersPresent.length == 0) {
            return;
        }

        guild.createChannel("p" + phaseNumber + "-" + area.id, {
            type: 'text',
            parentID: categoryID,
            permissionOverwrites: [{
                id: guild.id,
                deny: ['READ_MESSAGES']
              }]
          }).then(async channel => {

                if (area.image == undefined) {
                    area.image = "";
                }

                //Post the thing
                await channel.send(
                    ">>> *-----Phase " + phaseNumber + "-----*\n" +
                    "**" + area.name+ "**\n\n" +
                    area.description + "\n\n" +
                    area.image
                )

                //Add players
                await guild.members.forEach(member => {
                    
                    playername = area.playersPresent.find(p => p == member.user.username);

                    if (playername != undefined) {
                        
                        channel.overwritePermissions(member.user, {READ_MESSAGES: true}).catch(console.error);
                        channel.send("<@" + member.user.id + ">");
                    }

                })

            }).catch(console.error);
    }
};