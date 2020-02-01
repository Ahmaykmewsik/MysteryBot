const prefix = process.env.prefix;
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'setphase',
	description: 'Manually sets the phase. You shouldn\'t need to change this unless something goes wrong.',
    format: "!setphase <number>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var phaseCount = client.data.get("PHASE_COUNT");

        if (phaseCount == undefined) {
            message.channel.send("Just a heads up, the phase count is undefined. You've likely never set the phase.");
        }

        if (args.length == 0) {
            return message.channel.send("You need to give the phase count.");
        }

        if (args.length > 1) {
            return message.channel.send("Just put ONE number!");
        }

        phaseCount = parseInt(args[0]);
  
        client.data.set("PHASE_COUNT", phaseCount);

        message.channel.send("Phase count set to " + phaseCount + "!");
	}
};