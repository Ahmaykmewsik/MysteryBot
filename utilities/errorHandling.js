module.exports =  {
    postErrorMessage(error, channel, player = false) {
        console.error(error);
        if (player) {
            channel.send("WARNING: Something went wrong in the bot just now. It's probably not your fault (It's probably Ahmayk's). Tell your GM.");
        }
        return channel.send(":warning: WARNING: Something went wrong in the bot just now. It's probably not your fault. Give this info to either your GM or Ahmayk:```" + error + "```", { split: true });
    }
}