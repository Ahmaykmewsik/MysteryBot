const UtilityFunctions = require('../../utilities/UtilityFunctions');
const prefix = process.env.prefix;

module.exports = {
    name: 'run',
    description:
        'A way to run multiple commands in the bot at once.' + 
        'Use with caution, may have unintended side effects, especially if the command has a prompt.' +
        `\n\nExample: \`!run !addarea room !areaname room The Awesome Room !setarea ahmayk room\``,
    format: "!run <!command [arguments]>...",
    guildonly: true,
    gmonly: true,
    async execute(client, message, args) {

        let arrayOfCommands = ParseArguments(args);

        if (!arrayOfCommands)
            message.channel.send(`What? I don't see any commands here. (Did you use \`${prefix}\`?)`);

        for (i in arrayOfCommands) 
            UtilityFunctions.RunCommand(client, message, arrayOfCommands[i][0], arrayOfCommands[i].slice(1));  

        function ParseArguments(inputArray, arrayOfCommands = []) {

            if (inputArray.length == 0) return arrayOfCommands;
            if (!inputArray[0].startsWith(prefix) && arrayOfCommands.length == 0) return;

            if (inputArray[0].startsWith(prefix)) {
                newCommand = [inputArray[0]];
                arrayOfCommands.push(newCommand);
            } else {
                arrayOfCommands[arrayOfCommands.length-1].push(inputArray[0]);
            }

            return ParseArguments(inputArray.slice(1), arrayOfCommands);

        }
    }
};

