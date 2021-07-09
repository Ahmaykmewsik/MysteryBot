module.exports = {
    async SendMessageChannel_Failsafe(text, channel) { 
       
        if (!text) return;
        await channel.send(text, {split: true})
            .then(m => {
                m.pin();
            })
            .catch(console.error);
    }
}