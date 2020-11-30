module.exports = {
    async SendMessageChannel_Failsafe(text, channel) { 
        if (text == ""){
            return;
        }

        var toSend = "";
        if (text.length < 2000) {
            toSend = text;
        } 
        else {
            for(let i = 0; i < text.length; i += 2000) {
                toSend = text.substring(i, Math.min(text.length, i + 2000));
            }
        }

        channel.send(toSend)
            .then(m => {
                m.pin().catch(console.error);
            })
            .catch(console.error);
    }
}