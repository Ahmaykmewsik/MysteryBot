const { updateAvatars } = require("./utilities/updateAvatarsUtil");

module.exports = {
	EarlogListener(client, message) {
		const earlog_data = client.data.get("EARLOG_DATA");
		var avatar_data = client.data.get("AVATAR_DATA");
		var earlog_history = client.data.get("EARLOG_HISTORY");
		var avatar_uploads = client.data.get("AVATAR_UPLOADS");

		const areaid = message.channel.name.split("-").pop();

		if (earlog_data == undefined) {
			//No earlogs setup
			return;
		}

		if (message.content == undefined || message.system){
			return;
		}

		const earlogChannel = earlog_data.find((c) => {
			return c.areaid == areaid;
		});

		if (earlogChannel != undefined) {
			//find channel

			if (avatar_data == undefined) {
				avatar_data = {}; //dictionary of username - local filename
				updateAvatars(client);
			}
			if (avatar_uploads == undefined){
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
			if (postName) {
				if (message.member.nickname != undefined) {
					var messageContent =
						"**" +
						message.member.nickname +
						":** `[" +
						message.author.username.toUpperCase() +
						"]` \n" +
						message.content;
				} else {
					var messageContent =
						"**" + message.author.username + ":** " + message.content;
				}
			} else {
				var messageContent = message.content;
			}

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

			

			if ((filenameReuploaded == undefined || updateAvatarFlag) && filenameStored != undefined){
				//if an avatar hasn't been uploaded in an earlog yet
				filename = filenameStored;
			} else if (filenameReuploaded != undefined){
				//if any avatar has already been uploaded, use it
				filename = filenameReuploaded;
			} else {
				//this in pratice should never happen
				filename = message.author.avatar.url;
			}

			//If reuploaded is outdated, use stored local image
			var outdatedReuploaded = false;
			if (filenameReuploaded != undefined){
				if (!filenameReuploaded.includes(message.author.avatar)) {
					filename = filenameStored;
					outdatedReuploaded = true;
				}
			}
			

			//Copy to Ear Log
			if (!postName || message.author.bot) {
				//Message Only
				client.channels.get(earlogChannel.channelid).send(messageContent)
					//Pin phase starts
					.then(message => {
						if (message.content.includes(">>> *-----Phase ")){
							message.pin();
						};
					})
			} else {
				//Avatar
				client.channels
					.get(earlogChannel.channelid)
					.send({ files: [filename] })
					.then(m => {
						client.channels.get(earlogChannel.channelid).send(messageContent);
						if (outdatedReuploaded) {
							avatar_uploads[message.author.username] = m.attachments.array()[0].url;
							client.data.set("AVATAR_UPLOADS", avatar_uploads);
						}
					});
			}

			//Attachments
			if (message.attachments.array().length != 0) {
				client.channels
					.get(earlogChannel.channelid)
					.send(message.attachments.array()[0].url);
			}
        }

	}
};