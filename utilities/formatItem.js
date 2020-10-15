module.exports = {

    formatItem(item) {

        var infoStringArray = []

        if (item.primary) infoStringArray.push("Primary");

        if (item.big) infoStringArray.push("`BIG`");

        if (item.use_capacity != -1) infoStringArray.push("(" + item.use_count + " of " + item.use_capacity + " uses)");

        if (item.success != 100) infoStringArray.push(item.success + "% Success")

        var returnstring = "`" + item.id + "` ";

        if (infoStringArray.length > 0) {
            returnstring += " *" + infoStringArray.join(", ") + "*";
        } 

        returnstring += " " + item.description

        return returnstring;
    }
};