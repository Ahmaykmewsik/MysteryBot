const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'setmaxhealth',
	description: 'Sets the standard maximum health that a player can have. `!heal` will cap at this value. If your\'e using this, you may also want to use `!setdefaulthealth`.',
    format: "!setmaxhealth <number>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send("You need to give a number.");
        }

        if (args.length > 1) {
            return message.channel.send("Too much. Please just put ONE number.");
        }

        const settings = UtilityFunctions.GetSettings(client, message.guild.id);

        const input = args.shift();
        const value = parseFloat(input);
        
        if (isNaN(value) || value % 0.25 != 0.0) {
            return message.channel.send("Invalid health value: " + input + ". Please enter a number divisible by 1/4.");
        }
        
        settings.maxHealth = value;
        client.setSettings.run(settings);

        message.channel.send("Max Health value set to " + settings.maxHealth + "!");
	}
};