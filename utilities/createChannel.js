const formatItem = require('../utilities/formatItem').formatItem;
const SendMessageChannel = require('../utilities/SendMessageChannel_Failsafe').SendMessageChannel_Failsafe;

module.exports = {
    async createChannel(client, guild, area, categoryID, phaseNumber) { 

        //If nobody is there, don't make a channel for it
        if (area.playersPresent.length == 0) {
            return;
        }

        const players = client.data.get("PLAYER_DATA");
        const items = client.data.get("ITEM_DATA");

        //If nobody ALIVE is there, don't make a channel for it
        var livingPlayersPresent = false;
        for (var i = 0; i < area.playersPresent.length; i++){
            playerObject = players.find(p => p.name == area.playersPresent[i]);
            if (playerObject != undefined){
                if (playerObject.alive){
                    livingPlayersPresent = true;
                    break;
                }
            }
        }
        if (!livingPlayersPresent) {
            return;
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

                //Put in the catagory
                await channel.setParent(categoryID)
                    .then(channel => {
                        var channeldata = client.data.get("CHANNEL_DATA");
                        if (channeldata == undefined) {
                            channeldata = {};
                        }
                        channeldata[channelname] = channel.id;
                        client.data.set("CHANNEL_DATA", channeldata);
                    })
                    .catch(console.error);

                //If there's no image then don't try and put one
                if (area.image == undefined) {
                    area.image = "";
                }

                //Determine who has big items
                var bigItemsText = "";
                area.playersPresent.forEach(player => {
                    playerObject = players.find(p => p.name == player);
                    if (playerObject.items != undefined){
                        playerObject.items.forEach(item => {
                            itemObject = items.find(i=> i.name == item);
                            if (itemObject.big) {
                                bigItemsText += "\n**" + playerObject.character + "** has: " + formatItem(itemObject);
                            }
                        })
                    }
                })

                //Post the thing
                const outputString1 =
                    ">>> *-----Phase " + phaseNumber + "-----*\n" +
                    "**" + area.name+ "**\n\n" + area.description

                const outputString2 = bigItemsText + "\n\n" + area.image
                
                SendMessageChannel(outputString1, channel);
                if (outputString2 != "\n\n") {
                    SendMessageChannel(outputString2, channel);
                }

                //Add players and ping them
                var pingMessage = "";
                guild.members.forEach(member => {
                    playername = area.playersPresent.find(p => p == member.user.username);
                    playerObject = players.find(p => playername == p.name);
                    if (playername != undefined || playerObject != undefined) {
                        
                        if (playerObject.alive) {
                            channel.overwritePermissions(member.user, {READ_MESSAGES: true}).catch(console.error);
                        }
                        else {
                            channel.overwritePermissions(member.user, {READ_MESSAGES: true, SEND_MESSAGES: false}).catch(console.error);
                        }
                    
                        pingMessage += "<@" + member.user.id + ">\n" 
                    } 
                })

                await channel.send(pingMessage);

            }).catch(console.error);
    }
};