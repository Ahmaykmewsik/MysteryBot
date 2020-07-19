
module.exports = {
    async createChannel(client, guild, area, categoryID, phaseNumber) { 

        //If nobody is there, don't make a channel for it
        if (area.playersPresent.length == 0) {
            return;
        }

        var channeldata = client.data.get("CHANNEL_DATA");
        if (channeldata == undefined) {
            channeldata = {};
        }

        const channelname = "p" + phaseNumber + "-" + area.id;

        guild.createChannel(channelname, {
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

                channeldata[channelname] = channel.id;
                client.data.set("CHANNEL_DATA", channeldata);

            }).catch(console.error);
    }
};