const d20roll = require('../utilities/d20roll').d20roll;

const fs = require('fs');

module.exports = {
	name: 'testrandomness',
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var printstring = [];

        while (printstring.length < 1000) {
            printstring.push((Math.floor(Math.random() * 20 ) + 1 ));
        }

        console.log(printstring[0]);

        const title = "Random" + printstring[0] + printstring[1] + printstring[2] + ".txt";

        fs.writeFile(title, printstring.join("\n"), (err) => {
			// throws an error, you could also catch it here
			if (err) throw err;

			// success case, the file was saved
			message.channel.send("File made!", { files: [title] });
		});

    }
}