const { Webhook } = require("discord.js");
const { updateAvatars } = require("./utilities/updateAvatarsUtil");

module.exports = {
	async EarlogListener(client, message) {


		const gameplayChannel = client.getGameplayChannel.get(message.channel.id);

		if (message.content == undefined || message.system || !gameplayChannel) {
			return;
		}

		if (!gameplayChannel.earlogChannelID) {
			return;
		}

		const earlogChannel = client.channels.cache.get(gameplayChannel.earlogChannelID);


		const webhooks = await earlogChannel.fetchWebhooks();

		async function PostMessage(webhooks, accuracy = 1.0) {
			var username = message.author.username;
			if (message.member.nickname) {
				username = `${message.member.nickname}  [${message.author.username}]`;
			}
	
			var webhook;
			if (!earlogChannel.lastMessage) {
				webhook = webhooks.first();
			} else if (!earlogChannel.lastMessage.webhookID) {
				webhook = webhooks.first();
			} else {
				webhooks.sweep(w => w.id == earlogChannel.lastMessage.webhookID && w.username == username);
				webhook = webhooks.first();
			}
	
			let content = " ";
	
			if (message.content) {
				content = EncryptSpyMessage(message.content, accuracy);
			}
	
			if (message.attachments.array().length != 0) {
				content += "\n" + message.attachments.array()[0].url
			}
	
			await webhook.send(content, {
				username: username,
				avatarURL: message.author.avatarURL(),
				embed: message.embed
			}).then(earlogMsg => {
	
				if (content.includes(">>> *-----Phase ")) {
					earlogMsg.pin();
				}
			})
		}

		PostMessage(webhooks);

		//Post in Spy Channels
		
		let spyCurrentData = client.getSpyCurrentAll.all(message.guild.id);

		if (spyCurrentData.length == 0 ) return;
		
		let spyChannels = client.getSpyChannels.all(message.guild.id);

		spyChannels = spyChannels.filter(c => c.areaID == gameplayChannel.areaID);

		if (spyChannels.length == 0) return;

		spyCurrentData.forEach(async spyCurrent => {

			const spyChannelData = spyChannels.find(c => c.areaID == spyCurrent.spyArea && c.username == spyCurrent.username);
			const spyChannel = client.channels.cache.get(spyChannelData.channelID);

			try {
				const webhooksSpy = await spyChannel.fetchWebhooks();
				PostMessage(webhooksSpy, spyCurrent.accuracy);
			} catch(error) {
				console.error(error);
			}
			
		});

		return;


		// webhook.edit(message.author.username,  "https://i.imgur.com/p2qNFag.png", gameplayChannel.earlogChannelID)
		// 	.then(webhook.send(message.content))



		// const tempWebhook = message.guild.channels.cache.get(gameplayChannel.earlogChannelID)
		// 	.createWebhook(message.author.username)
		// 	.then(w => {

		// 		w.delete();

		// 	})
		// 	.catch(console.error);




		console.log(tempWebhook);

		tempWebhook.send(message.content);
		tempWebhook.delete();

		webhook.edit(message.author.username, message.author.displayAvatarURL)
			.then(webhook.send(message.content));





		// var avatar_data = client.data.get("AVATAR_DATA");
		// var earlog_history = client.data.get("EARLOG_HISTORY");
		// var avatar_uploads = client.data.get("AVATAR_UPLOADS");
		// const players = client.data.get("PLAYER_DATA");
		// var spyChannelData = client.data.get("SPY_CHANNEL_DATA");

		// if (spyChannelData == undefined) {
		//     spyChannelData = [];
		// }


		//find channel

		if (avatar_data == undefined) {
			avatar_data = {}; //dictionary of username - local filename
			updateAvatars(client);
		}
		if (avatar_uploads == undefined) {
			avatar_uploads = {}; //dictionary of username - avatar discord upload
		}
		if (earlog_history == undefined) {
			earlog_history = {}; //dictionary of username - filename
		}

		//Determine if the bot should post a name
		var postName = true;
		if (earlogChannel.channelid in earlog_history) {
			const lastTalker = earlog_history[earlogChannel.channelid];
			if (lastTalker == message.author.username) {
				postName = false;
			}
		}

		earlog_history[earlogChannel.channelid] = message.author.username;
		client.data.set("EARLOG_HISTORY", earlog_history);


		//Format message
		var userHandle;
		if (postName) {
			if (message.member.nickname != undefined) {
				userHandle = "**" + message.member.nickname + ":** `[" + message.author.username.toUpperCase() + "]` \n";
			} else {
				userHandle = "**" + message.author.username + ":** \n";
			}
		} else {
			userHandle = "";
		}

		const messageContent = userHandle + message.content;

		var filenameCurrent = "./avatars/" + message.author.username + "_" + message.author.avatar + ".png";
		var filenameStored = avatar_data[message.author.username];
		var filenameReuploaded = avatar_uploads[message.author.username];
		var filename;

		//Update all avatars on local disk and set flag to reupload image
		var updateAvatarFlag = false;
		if (filenameCurrent != filenameStored && !message.author.bot) {
			//update all avatars
			updateAvatars(client)
		}



		if ((filenameReuploaded == undefined || updateAvatarFlag) && filenameStored != undefined) {
			//if an avatar hasn't been uploaded in an earlog yet
			filename = filenameStored;
		} else if (filenameReuploaded != undefined) {
			//if any avatar has already been uploaded, use it
			filename = filenameReuploaded;
		} else {
			//this in pratice should never happen
			filename = message.author.avatar.url;
		}

		//If reuploaded is outdated, use stored local image
		var outdatedReuploaded = false;
		if (filenameReuploaded != undefined) {
			if (!filenameReuploaded.includes(message.author.avatar)) {
				filename = filenameStored;
				outdatedReuploaded = true;
			}
		}

		//Copy the message to Earlog

		CopyMessage(client, message, messageContent, earlogChannel, filename, postName);

		//Post to Spy Channels
		spyChannelData.forEach(spyData => {

			if (spyData.area == areaid) {
				const playerObject = players.find(p => p.name == spyData.player);
				if (playerObject.spyCurrent.length > 0) {
					if (!message.author.bot) {
						const spyMessage = EncryptSpyMessage(message.content, parseFloat(playerObject.spyCurrent[0][1]));
						CopyMessage(client, message, userHandle + spyMessage, spyData, filename, postName);
					} else {
						CopyMessage(client, message, messageContent, spyData, filename, postName);
					}

				}
			}
		});


		if (outdatedReuploaded) {
			avatar_uploads[message.author.username] = m.attachments.array()[0].url;
			client.data.set("AVATAR_UPLOADS", avatar_uploads);
		}



		function CopyMessage(client, message, messageContent, earlogChannel, filename, postName) {
			//Copy to Ear Log
			if (!postName || message.author.bot) {
				//Message Only
				client.channels.cache.get(earlogChannel.channelid).send(messageContent)
					//Pin phase starts
					.then(message => {
						if (message.content.includes(">>> *-----Phase ")) {
							message.pin();
						};
					})
			} else {
				//Avatar
				client.channels
					.get(earlogChannel.channelid)
					.send({ files: [filename] })
					.then(m => {
						client.channels.cache.get(earlogChannel.channelid).send(messageContent);
						//Avatars used to be updated here
					});
			}

			//Attachments
			if (message.attachments.array().length != 0) {
				client.channels
					.get(earlogChannel.channelid)
					.send(message.attachments.array()[0].url);
			}
		}

		function EncryptSpyMessage(message, accuracy) {
			var messageWords = message.split(" ");
			for (let i = 0; i < messageWords.length; i++) {
				const rand = Math.random();
				if (rand >= accuracy) {
					messageWords[i] = "---";
				};
			}
			const newMessage = messageWords.join(" ");
			return newMessage;
		}
	}
};



