module.exports = {

    formatItem(client, item, showEquipped = true) {

        var infoStringArray = []

        if (item.big) infoStringArray.push("`BIG`");

        if (item.clothing) infoStringArray.push("`CLOTHING`");

        var returnstring = "`" + item.id + "` ";

        if (infoStringArray.length > 0) {
            returnstring += " *" + infoStringArray.join(", ") + "*";
        } 

        returnstring += " " + item.description;

        if (showEquipped) {
            const playersWithItem = client.getPlayersOfItem.all(item.id, item.guild);
            returnstring += `\n__Equipped by:__ `
            var playersString = playersWithItem.map(p => p[`username`]).join(", ");
            if (playersString == "") {
                playersString = "None";
            }
            returnstring += playersString;
        }

        return returnstring;
    }
};