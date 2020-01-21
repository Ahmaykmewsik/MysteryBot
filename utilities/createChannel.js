const Discord = require('discord.js');

module.exports = {
    createChannel(guild, areaName, categoryName, playerArrayID, phaseNumber, areaDescription) {

        // let category = guild.channels.find(c => c.name == categoryName);

        // console.log(category);

        // if (category == null) {
        //     guild.createChannel(categoryName, {
        //         type: 'category',
        //         permissionOverwrites: [{
        //             id: guild.id,
        //             deny: ['READ_MESSAGES']
        //           }]
        //       })
        //       //.then(console.log)
        //       .catch(console.error);
        // }

        guild.createChannel("p-" + areaName, {
            type: 'text',
            permissionOverwrites: [{
                id: guild.id,
                deny: ['READ_MESSAGES']
              }]

          })
            .then(channel => {
                //Post the thing
                channel.send(
                    ">>> *-----Phase " + phaseNumber + "-----*\n" +
                    "**" + areaName + "**\n\n" +
                    areaDescription
                )

                //Add players
                playerArrayID.forEach(id => {
                    let player = guild.members.get(id);
                    
                    channel.overwritePermissions(player, {READ_MESSAGES: true}).catch(console.error);
                    
                    channel.send("<@" + id + ">");
                })

            })
            .catch(console.error);
    }
};