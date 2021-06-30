module.exports = {
    async SendMessageChannel_Failsafe(text, channel) { 
       
        if (!text) return;
        channel.send(text)
            .then(m => {
                m.pin();
            })
            .catch(console.error);
    }
}