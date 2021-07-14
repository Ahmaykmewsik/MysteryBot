const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'follow',
    description: '`!forcemoves` a player to follow where another player will go next phase, if possible. Will abort if the follower cannot follow the leader though normal movement.',
    format: "!follow <player> <player> (first player follows the second)",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        let playerFollower = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (playerFollower.username == undefined) return;

        if (args.length == 0)
            return message.channel.send(`:warning: Ok, but who should ${playerFollower.username} follow?`);

        let playerLeader = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (playerLeader.username == undefined) return;

        //Check that the leader has a movement action
        if (!playerLeader.move)
            return message.channel.send(`:warning: Aborting. ${playerLeader.username} has no movement set! Set a movement action for them first.\n\n` + formatPlayer(client, playerLeader), { split: true });


        //Notify if they're already following each other
        if (playerLeader.move == playerFollower.move)
            return message.channel.send(`${playerFollower.username} and ${playerLeader.username} are already following each other! They're both going to **${playerLeader.move}**.`)

        //Check that the follower can go where the leader is going
        let locationFollower = client.getLocationOfPlayer.get(`${playerFollower.guild}_${playerFollower.username}`);
        if (!locationFollower)
            return message.channel.send(`:warning: Huh? I can't find where ${playerFollower.username} is. Do they have an area set?`);
        let followerAreaConnections = client.getConnections.all(locationFollower.areaID, playerFollower.guild);
        if (!followerAreaConnections.find(c => c.area2 == playerLeader.move))
            return message.channel.send(`:warning: Aborted. ${playerFollower.username} can't go to **${playerLeader.move}** from **${locationFollower.areaID}**!`);
        
        //Follow the leader
        playerFollower.move = playerLeader.move;
        playerFollower.forceMoved = 1;
        client.setPlayer.run(playerFollower);

        //Notify
        return message.channel.send(`${playerFollower.username} will follow ${playerLeader.username} and go to **${playerLeader.move}** next phase.\n\n` + formatPlayer(client, playerFollower), { split: true });
    }
};