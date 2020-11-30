const formatArea = require('../utilities/formatArea').formatArea;

module.exports = {
	name: 'addarea',
	description: 'Creates a new area with specified ID string. The area ID cannot contain whitespace.',
    format: "!addarea <id>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No area ID provided. Please specify an ID string for the new area.");
        }
        if (args.length > 1) { 
            return message.channel.send("Area ID cannot contain whitespace.");
        }
        const id = args[0];

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            areas = [];
        }

        var items = client.data.get("ITEM_DATA");
        if (items == undefined) {
            items = [];
        }

        const phaseCount = client.data.get("PHASE_COUNT");

        if (areas.some(area => area.id == id)) {
            return message.channel.send("An area with that ID already exists!");
        }

        const newArea = {
            id, 
            name: id,
            description: undefined, 
            details: [],
            items: [],
            reachable: [id], 
            playersPresent: [],
            image: undefined
        };
        areas.push(newArea);
        client.data.set("AREA_DATA", areas);
        message.channel.send("Successfully created new area: `" + id 
            + "`.\nUse !areaname, !areadesc, and !connect to edit this area's properties.");
        message.channel.send(formatArea(newArea, items));

        
        if (phaseCount != undefined) {
            area = newArea;
            
            message.guild.createChannel("earlog-" + area.id, {
                type: 'text',
                permissionOverwrites: [{
                    id: message.guild.id,
                    deny: ['SEND_MESSAGES', 'READ_MESSAGES']
                    }]
            }).then(channel => {
                //console.log(area.id + " created");
                var earlog_data = client.data.get("EARLOG_DATA");
                if (earlog_data == undefined) {
                    earlog_data = [];
                }
                earlog_data.push({areaid: area.id, channelid: channel.id});
                client.data.set("EARLOG_DATA", earlog_data);
                
            }).catch(console.error())

            message.channel.send("Earlog Channel Created");    
        }
    }
};