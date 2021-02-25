const { updateAvatars } = require('../utilities/updateAvatarsUtil');

module.exports = {
    name: 'updateavatars',
    description: 'Updates local storage of avatars for EarBot. Warning, may take a bit',
    format: "!updateavatars",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {
        return message.channel.send("DEPRICATED");
        message.channel.send("Updating Avatars...");
        const log = updateAvatars(client);
        message.channel.send(log);
    }
};