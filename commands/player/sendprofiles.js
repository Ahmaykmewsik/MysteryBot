const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'sendprofiles',
    description: 'DMs all players their profile. You should only do this once!',
    format: "!sendprofiles",
    gmonly: true,
    execute(client, message, args) {

        const players = client.getPlayers.all(message.guild.id);
        if (players.length == 0) {
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        }

        if (args.length != 0)
            return message.channel.send("This command takes no arguments.");

        //Show profile status!
        const profileStatusCommand =
            client.commands.get("profilestatus") ||
            client.commands.find(
                (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
            );

        try {
            profileStatusCommand.execute(client, message, args);
        } catch (error) {
            postErrorMessage(error, message.channel);
        }

        message.channel.send("\n\nAre you SURE you're ready to send everyone their profile? You should only do this once! (y or n)").then(() => {
            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {

                        return SendProfiles();

                    } else if (messages.first().content == 'n') {
                        message.channel.send("Okay, never mind then :)");
                    } else {
                        message.channel.send("...uh, okay.");
                    }
                })
                .catch(() => {
                    message.channel.send(`Something went wrong with that: ${error}`);
                    console.log(Error);
                })
        });


        function SendProfiles() {

            message.channel.send("Alright, let's do this! Sending...");
            let profiles = client.getProfiles.all(message.guild.id);
            statusMessage = ""

            players.forEach(player => {
                let status = "";
                let profile = profiles.find(prof => prof.username == player.username);
                if (!profile) {
                    status = "**No profile exists.**";
                }
                else {
                    try {
                        client.users.cache.get(player.discordID).send(profile.profileText);
                    } catch (error) {
                        status = `:x:**FAILED TO SEND.**:x: \`${error}\``;
                    }

                    status = "SENT!:white_check_mark:";
                }



                statusMessage += `${player.username}: ${status}\n`;
            })

            return message.channel.send(statusMessage, { split: true });
        }
    }
};