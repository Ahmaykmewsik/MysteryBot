const ChannelCreationFunctions = require('../../utilities/ChannelCreationFunctions.js');
const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const postErrorMessage = require('../../utilities/errorHandling').postErrorMessage;
const getHeartImage = require('../../utilities/getHeartImage').getHeartImage;

module.exports = {
	name: 'moveinstant',
	description: 'Moves to an area instantly, automaticly placing a player out of their current area channel and into another one. Is accessed via DM by players.',
	format: "!moveinstant <id>",
	dmonly: true,
	execute(client, message, args) {

		let player = UtilityFunctions.GetPlayerFromDM(client, message);
		if (!player.username) return;

		const settings = UtilityFunctions.GetSettings(client, player.guild);
		if (settings.phase == null) {
			return message.channel.send("No game is currently in progress.");
		}

		let location = client.getLocationOfPlayer.get(`${player.guild}_${player.username}`);

		if (!location) {
			return message.channel.send("I can't find where you are! Ask your GM for assistance. (Cannot find location)");
		}

		//Check to see if channel is locked
		const gameplayChannels = client.getGameplayChannels.all(player.guild);
		const currentGameplayChannel = gameplayChannels.find(g => (g.areaID == location.areaID) && g.active);
		if (!currentGameplayChannel) {
			return message.channel.send("I can't find your current gameplay channel. Ask your GM for assistance.");
		}

		if (currentGameplayChannel.locked) {
			return message.channel.send("You can't !moveinstant right now because your gameplay channel is LOCKED!");
		}

		const instantConnections = client.getInstantConnections.all(player.guild);

		const instantConnectionsOfLocation = instantConnections.filter(c => c.area1 == location.areaID);

		const areaOptions = instantConnectionsOfLocation.map(c => c.area2);

		if (areaOptions.length == 0) {
			return message.channel.send("You have no !moveisntant options avaliable.");
		}

		if (args.length === 0) {
			return message.channel.send("Please specify the ID of the area you wish to instant move to. Valid options: `"
				+ areaOptions.join('`, `') + '`.');
		}

		let areaInput = areaOptions.find(a => a == args.join(" "));
		if (areaInput == undefined) {
			areaInput = areaOptions.find(a => a.includes(args.join(" ")));
		}

		if (args.length > 1 || !areaInput) {
			return message.channel.send("Sorry, `" + args.join(' ') + "` is not a valid instant movement option. Valid options: "
				+ areaOptions.join(`, `));
		}

		const canMoveBack = instantConnections.filter(c => c.area2 == location.areaID && c.area1 == areaInput).length > 0;

		let promptMessage = `Are you sure you want to instantly move to \`${areaInput}\`? You will lose access to \`${location.areaID}\``
		if (canMoveBack) {
			promptMessage += ` (but will be able to instant move back if you wish)`;
		} else {
			promptMessage += ` and NOT be able to instant move back to it.`;
		}
		promptMessage += ` (y / n)`;

		const responses = [`y`, `yes`, `n`, `no`];
		const filter = m => responses.includes(m.content.toLowerCase());

		message.reply(promptMessage).then(() => {
			const collector = message.channel.createMessageCollector(filter, { time: 30000, max: 1 });
			collector.on('collect', m => {

				if (m.content.toLowerCase() == 'y' || m.content.toLowerCase() == 'yes') {


					const areas = client.getAreas.all(player.guild);
					const areaCurrent = areas.find(a => a.id == location.areaID);
					const areaToMove = areas.find(a => a.id == areaInput);

					//Move the player!
					const gameplayChannelInfoCurrent = gameplayChannels.find(g => (g.areaID == location.areaID) && g.active);
					const gameplayChannelCurrent = client.channels.cache.get(gameplayChannelInfoCurrent.channelID);

					const gameplayChannelInfoToMove = gameplayChannels.find(g => (g.areaID == areaInput) && g.active);

					m.reply("Moving you...");
					if (gameplayChannelInfoToMove == undefined) {
						//channel doesn't exist, we gotta make it
						let players = client.getPlayers.all(player.id);
						let inventoryData = client.getItemsAndInventories.all(player.id);
						let locations = client.getLocations.all(player.id);
						let guild = client.guilds.cache.find(g => g.id == settings.guild);
						ChannelCreationFunctions.CreateSingelChannelMidPhase(client, message, guild, areaToMove, players, locations, inventoryData, settings)
							.then(channel => InstantMove(channel))
							.catch(error => console.log(error));
					} else {
						let gameplayChannelToMove = client.channels.cache.get(gameplayChannelInfoToMove.channelID);
						InstantMove(gameplayChannelToMove)
					}
					

					async function InstantMove(gameplayChannelToMove) {
						let inventoryData = client.getItemsAndInventories.all(player.id);
						const user = await client.users.cache.find(m => m.username == player.username);

						await gameplayChannelCurrent.createOverwrite(user, { VIEW_CHANNEL: false });
						await gameplayChannelCurrent.send(`<@${user.id}>:bangbang: **${player.character} instantly moved to ${areaToMove.name}!**`);
						
						let entranceMessage = `<@${user.id}>:bangbang: **${player.character} appeared from ${areaCurrent.name}!**\n`;
						
						await gameplayChannelToMove.send(entranceMessage);
						await ChannelCreationFunctions.SendEntranceMessageAndOpenChannel(client, player, user, inventoryData, gameplayChannelToMove);

						//TODO: tweak this for multi-location mode
						client.deleteLocationsOfPlayer.run(player.guild_username);
						const newLocation = {
							guild_username: player.guild_username,
							username: player.username,
							guild: player.guild,
							areaID: areaInput
						};
						client.setLocation.run(newLocation);

						await m.reply("You have been moved!");
					}

					//InstantMove();
				}
				if (m.content.toLowerCase() == 'n' || m.content.toLowerCase() == 'no') {

					m.reply("Alright. Instant move aborted.");
				}

			});
		});
	}
};