const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
	name: 'addarea',
    category:  `area`,
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

        // var areas = client.data.get("AREA_DATA");
        // if (areas == undefined) {
        //     areas = [];
        // }

        // var items = client.data.get("ITEM_DATA");
        // if (items == undefined) {
        //     items = [];
        // }

        //const phaseCount = client.data.get("PHASE_COUNT");

        const doesAreaExist = client.getArea.get(`${message.guild.id}_${id}`);

        if (doesAreaExist) {
            return message.channel.send("An area with that ID already exists!");
        }

        const newArea = {
            guild_id: `${message.guild.id}_${id}`,
            id: id,
            guild: message.guild.id,
            name: id.toUpperCase(),
            description: null, 
            image: undefined
        };

        client.setArea.run(newArea);

        message.channel.send("Successfully created new area: `" + id 
            + "`.\nUse !areaname, !areadesc, and !connect to edit this area's properties.");
        message.channel.send(formatArea(newArea));

        //TODO: implement this

        // if (phaseCount != undefined) {
        //     area = newArea;
            
        //     message.guild.createChannel("earlog-" + area.id, {
        //         type: 'text',
        //         permissionOverwrites: [{
        //             id: message.guild.id,
        //             deny: ['SEND_MESSAGES', 'READ_MESSAGES']
        //             }]
        //     }).then(channel => {
        //         //console.log(area.id + " created");
        //         var earlog_data = client.data.get("EARLOG_DATA");
        //         if (earlog_data == undefined) {
        //             earlog_data = [];
        //         }
        //         earlog_data.push({areaid: area.id, channelid: channel.id});
        //         client.data.set("EARLOG_DATA", earlog_data);
                
        //     }).catch(console.error())

        //     message.channel.send("Earlog Channel Created");    
        // }
    }
};