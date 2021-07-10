module.exports = {
    async SendMessageChannel_Failsafe(text, channel) { 
       try {
        if (!text) return;
        const msgArray = await channel.send(text, {split: true});
        let msg = msgArray[0];
        if (!msg) return;
        await msg.pin();
       } catch (error) {
           console.error(error);
       }
        
    }
}