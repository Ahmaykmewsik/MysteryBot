const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'spyclear',
    description: 'Clears a player\'s non-active spy actions. To clear their active spy actions, use [-a]. To delete a spy action between two areas, use `!disconnectspy`.',
    format: "!spyclear <player> [-a]",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;


        let allSpyActions = client.getSpyActions.all(player.guild_username);
        let actionsToClear = (args.includes("-a")) ? allSpyActions.filter(a => a.active) : allSpyActions.filter(a => !a.active);

        if (actionsToClear.length == 0) {
            let returnMessage = (args.includes("-a")) ? `Huh? ${player.username} has no active spy actions to clear.` 
                                                      : `Huh? ${player.username} has no non-active spy actions to clear.` ;
            message.channel.send(returnMessage);
            return message.channel.send(formatPlayer(client, player));
        }
            
        actionsToClear.forEach(a => {
            client.deleteSpyAction.run(a.guild_username, a.spyArea, a.active);
        })

        let returnMessage = (args.includes("-a")) ? `${player.username}'s active spy actions have been cleared.` 
                                                  : `${player.username} non-active spy actions have been cleared.`;

        message.channel.send(returnMessage);
        message.channel.send(formatPlayer(client, player));
    }
};