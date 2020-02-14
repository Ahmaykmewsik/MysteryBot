module.exports = {
    createEarlog(client, guild, area) {

        var earlog_data = client.data.get("EARLOG_DATA");

        if (earlog_data == undefined) {
            earlog_data = [];
        }        

        guild.createChannel("earlog-" + area.id, {
            type: 'text',
            permissionOverwrites: [{
                id: guild.id,
                deny: ['SEND_MESSAGES', 'READ_MESSAGES']
                }]
        }).then(channel => {
            const areaForEarlogID = area.id
            earlog_data.push({areaForEarlogID, areaid: area.id, channelid: channel.id});
            client.data.set("EARLOG_DATA", earlog_data);
        })
        
    }

}