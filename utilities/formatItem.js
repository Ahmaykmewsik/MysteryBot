module.exports = {

    formatItem(item) {

        var infoStringArray = []

        if (item.primary) infoStringArray.push("Primary");

        if (item.use_capacity != -1) infoStringArray.push("(" + item.use_count + " of " + item.use_capacity + " uses)");

        if (item.success != 100) infoStringArray.push(item.success + "% Success")
            
        if (item.big) infoStringArray.push("BIG");

        var returnstring = "`" + item.id + "` " + item.description

        if (infoStringArray.length > 0) {
            returnstring += " *" + infoStringArray.join(", ") + "*";
        } 
        return returnstring;
    }
};