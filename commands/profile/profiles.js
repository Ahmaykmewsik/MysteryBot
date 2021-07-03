const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
    name: 'profiles',
    description: 'Lists all profiles of all players.',
    format: "!profiles",
    gmonly: true,
    execute(client, message, args) {

        const players = client.getPlayers.all(message.guild.id);
        if (players.length == 0) {
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        }

        if (args.length != 0)
            return message.channel.send("This command takes no arguments.");

        let promptMessage = "Are you sure you want to show all profiles in this channel? This is probably going to be a LOT of text! (y or n)\nIf you're just checking if each player has a profile, use `!profilestatus`";

        return UtilityFunctions.WarnUserWithPrompt(message, promptMessage, PostProfiles);

        function PostProfiles() {

            let profiles = client.getProfiles.all(message.guild.id);
            let outputMessage = "__**PROFILES**__";


            players.forEach(player => {
                outputMessage += `\n\n**---------------------${player.username}-------------------------**\n\n`
                let profile = profiles.find(prof => prof.username == player.username);
                let profileOutput = (profile) ? profile.profileText : "*No Profile*";
                outputMessage += profileOutput;

            })

            return message.channel.send(outputMessage, { split: true });
        }
    }
};