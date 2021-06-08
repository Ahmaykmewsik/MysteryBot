const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

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

        message.channel.send("Are you sure you want to do this? This is probably going to be a LOT of text. (y or n)\nIf you're just checking if each player has a profile, use `!profilestatus`").then(() => {
            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {

                        return PostProfiles();

                    } else if (messages.first().content == 'n') {
                        message.channel.send("Okay, never mind then :)");
                    } else {
                        message.channel.send("...uh, okay.");
                    }
                })
                .catch(() => {
                    message.channel.send("Something went wrong with that.");
                    console.log(Error);
                })
        });


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