
module.exports = {
	name: 'help',
	description: 'Makes the message sender the GM of the game',
	format: "!help, !help <command>",
	guildonly: true,
	execute(client, message, args) {


		if (!message.member.hasPermission('ADMINISTRATOR')) {
			message.channel.send(
				"Nah, you good."
				);
			return;
		}

		const data = [];
		const { commands } = message.client;

		if (!args.length) {

			data.push('**:exclamation:------ALL COMMANDS------:exclamation: **');

			let categories = new Set(commands.map(command => command.category));

			categories.forEach(category => {
				data.push(`:small_orange_diamond:**__${category.toUpperCase()}__:small_orange_diamond:**`);
				data.push(commands.filter(command => command.category == category).map(command => command.name).join(`, `));
			})

			data.push(`\n:book: __DOCUMENTATION:__ :book: <https://docs.google.com/document/d/1_aF2M3hEbcCTNj-d9jwDk5PKLALTj8J5Qvh1RxIKsEY/edit?usp=sharing>\n`);

			return message.channel.send(data, { split: true });
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('I can\'t help you with that chief. That\'s not a valid command.');
		}

		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		if (command.format) data.push(`**Format:** *${command.format}*`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		//if (command.cooldown) data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		message.channel.send(data, { split: true });
		
	}
};