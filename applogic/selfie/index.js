const express = require('express');
const fs = require('fs');
const catalyst = require("zcatalyst-sdk-node");
const resizeImg = require('resize-img');


const app = express();


async function changeFileSize(inputFile, outputFile) {
	console.log('about to changeFileSize ');
	const image = fs.readFileSync(inputFile);

	const newImage = await resizeImg(image, { width: 250, height: 250 });

	fs.writeFileSync(outputFile, newImage);

}


app.post('/upload_selfie', (req, res) => {

	const catalystApp = catalyst.initialize(req);
	const filestore = catalystApp.filestore();

	var body = '';
	req.on('data', function (data) {
		body += data;
	});


	req.on('end', function () {

		post = JSON.parse(body);
		var data_parsed = post.replace(/^data:image\/\w+;base64,/, "");
		var buf = Buffer.from(data_parsed, 'base64');

		var genRandomNum = Math.floor(Date.now() / 1000);
		var image_tempName = genRandomNum + '.png';


		var fileDir = __dirname + '/' + image_tempName;

		fs.writeFile(fileDir, buf, function (err) {
			if (err) {
				console.log("Error in writing file " + err);
				res.send('Unable to upload original file');
			}
			filestore
				.folder('343000000063054')
				.uploadFile({
					code: fs.createReadStream(__dirname + "/" + image_tempName),
					name: image_tempName
				}).then((uploadedFile) => {

					let inputFile = __dirname + "/" + image_tempName;
					let outputFile = __dirname + "/" + "resized-" + image_tempName;
					console.log('output file is ' + outputFile);

					changeFileSize(inputFile, outputFile).then(() => {

						filestore
							.folder('343000000063054')
							.uploadFile({
								code: fs.createReadStream(outputFile),
								name: outputFile
							}).then((newuploadedFile) => {
								res.send('<img id="theImg" src="/baas/v1/project/343000000063001/folder/343000000063054/file/' + newuploadedFile.id + '/download" >');
							}).catch(err1 => {
								console.log('Error here ' + err1);
								res.send('Unable to send resized file');
							});
					})



				}).catch(err11 => {
					console.log('Error here in the outer catch  ' + err11);
					res.send('Sadly unable to send resized file');
				});
		});
	})
})






module.exports = app;
