const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
    name: 'addplayers',
    description: 'Adds multiple players to a game at a time. Include a slash after each character name.',
    format: "!addplayers <username> <Character> / <username> <character> / <username> <character> ...",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send(`You need to enter a user.`);
        }

        playerArray = ParsePlayers(args);

        let returnMessage = [];

        const commandObject = client.commands.get("addplayer");
        for (inputArray of playerArray) 
            returnMessage.push(commandObject.execute(client, message, inputArray, true));
        
        message.channel.send(returnMessage.join(`\n`), {split: true});

        function ParsePlayers(inputArray, characterArray = []) {
            if (inputArray.length == 0)
                return characterArray;
            if (inputArray[0] == "/") {
                characterArray.push([]);
                return ParsePlayers(inputArray.slice(1), characterArray);
            }
            if (characterArray.length == 0)
                return ParsePlayers(inputArray.slice(1), [[inputArray[0]]]);
            let last = characterArray.pop();
            last.push(inputArray[0]);
            characterArray.push(last);
            return ParsePlayers(inputArray.slice(1), characterArray);
        }
    }
};