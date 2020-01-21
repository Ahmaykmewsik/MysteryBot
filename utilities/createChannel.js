const Discord = require('discord.js');

module.exports = {
    createChannel(guild, areaName, categoryName, playerArray, phaseNumber, areaDescription) {

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
                playerArray.forEach(p => {
                    let player = guild.members.get(p.id);
                    
                    channel.overwritePermissions(player, {READ_MESSAGES: true}).catch(console.error);
                    
                    channel.send("<@" + p.id + ">");
                })

            })
            .catch(console.error);
    }
};