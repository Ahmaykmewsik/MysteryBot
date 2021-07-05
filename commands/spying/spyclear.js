const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'spyclear',
    description: 
        'Clears a player\'s non-active spy actions. ' + 
        'You should only need this command if you\'re doing somemthing tricky. ' + 
        'In most cases you probably want to use `!disconnectspy` instead so that spy actions are automated. ' +
        'To clear a player\'s active spy actions, use `-a`. ' +
        'Otherwise, only non-active spy actions will be cleared. ' +
        'To clear their player spy actions (spy actions created with `!spyplayer`) use `-p`',
    format: "!spyclear <player> [-a] [-p]",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        let pString = (args.includes("-p")) ? " **player**" : "";

        let allSpyActions = client.getSpyActions.all(player.guild_username);
        let actionsToClear = (args.includes("-p")) ? allSpyActions.filter(a => a.player) : allSpyActions;
        actionsToClear = (args.includes("-a")) ? actionsToClear.filter(a => a.active) : actionsToClear.filter(a => !a.active);

        if (actionsToClear.length == 0) {
            let returnMessage = (args.includes("-a")) ? `Huh? ${player.username} has no **active**${pString} spy actions to clear.` 
                                                      : `Huh? ${player.username} has no **non-active**${pString} spy actions to clear.` ;
            message.channel.send(returnMessage);
            return message.channel.send(formatPlayer(client, player));
        }
            
        actionsToClear.forEach(a => {
            client.deleteSpyAction.run(a.guild_username, a.spyArea, a.active);
        })

        let returnMessage = (args.includes("-a")) ? `${player.username}'s **active**${pString} spy actions have been cleared.` 
                                                  : `${player.username} **non-active**${pString} spy actions have been cleared.`;

        message.channel.send(returnMessage);
        message.channel.send(formatPlayer(client, player));
    }
};