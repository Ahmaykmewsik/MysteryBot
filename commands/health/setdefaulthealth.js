const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'setdefaulthealth',
	description: 'Sets the health that players will recieve when they are added to the game. Is set to 3 by default. This will not change any players you\'ve already added. If you\'re using this, you may also want to use `!setmaxhealth`',
    format: "!setdefaulthealth <number>",
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
        
        settings.defaultHealth = value;
        client.setSettings.run(settings);

        message.channel.send("Default Health value set to " + settings.defaultHealth + "!");
	}
};