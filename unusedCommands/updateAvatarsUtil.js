///This implementation is not ethical if this bot becomes widespread...change if it does!

const fs = require("fs");
const https = require("https");

module.exports = {
    updateAvatars(client) {
        console.log("Updating Avatars...");
        var avatar_data = client.data.get("AVATAR_DATA");
        var sum = 0;

        if (avatar_data == undefined) {
            avatar_data = {};
        }

        client.users.forEach(user => {
            if (user.bot) return;
            const url = user.displayAvatarURL.split("?")[0] + "?size=32";
            var filename = "./avatars/" + user.username + "_" + user.avatar + ".png";
            if (filename == avatar_data[user.username]) {
                return;
            } else {
                const file = fs.createWriteStream(filename);
                const request = https.get(url, function (response) {
                    response.pipe(file);
                });
                avatar_data[user.username] = filename;
                console.log("Avatar Updated: " + user.username);
                console.log("Filename: " + filename);
                sum++;
            }
        });
        client.data.set("AVATAR_DATA", avatar_data);
        const logMessage = sum + " avatars were updated."
        return (logMessage);
    }
}
