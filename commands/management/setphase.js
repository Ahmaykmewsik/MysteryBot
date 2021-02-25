const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'setphase',
	description: 'Manually sets the phase. You shouldn\'t need to change this unless you\'re doing something freaky.',
    format: "!setphase <number>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send("You need to give the phase count.");
        }

        if (args.length > 1) {
            return message.channel.send("Too much. Please just put ONE number.");
        }

        const settings = UtilityFunctions.GetSettings(client, message.guild.id);

        if (parseInt(args[0])) {
            
        } else {
            return message.channel.send("Sorry, it needs to be a number.");
            //TODO: make this possible
            //phaseCount = args[0];
            //message.channel.send("That isn't a number, but that's okay. This label will not change when the phase changes unless you change it back to a number.");
        }

        if (!settings.phase) {
            //TODO: make this possible
            return message.channel.send("Sorry, but the game has to start on phase 1.");
        }
        client.setSettings.run(settings);

        settings.phase = parseInt(args[0]);

        message.channel.send("Phase count set to " + settings.phase + "!");
	}
};