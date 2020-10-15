module.exports = {
    async SendMessageChannel_Failsafe(text, channel) { 
        if (text.length == 0){
            return;
        }
        if (text.length < 2000) {
            channel.send(text).catch(console.error);
        } 
        else {
            for(let i = 0; i < text.length; i += 2000) {
                const toSend = text.substring(i, Math.min(text.length, i + 2000));
                channel.send(toSend).catch(console.error);
            }
        }
    }
}