const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

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

        //Show profile status
        UtilityFunctions.RunCommand(client, message, "profilestatus");

        let warningMessage = "\n\nAre you SURE you're ready to send everyone their profile? You should only do this once! (y or n)";

        return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, SendProfiles);

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