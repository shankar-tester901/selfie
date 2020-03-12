(function () {
	// The width and height of the captured photo. We will set the
	// width to the value defined here, but the height will be
	// calculated based on the aspect ratio of the input stream.

	var width = 350;    // We will scale the photo width to this
	var height = 0;     // This will be computed based on the input stream

	// |streaming| indicates whether or not we're currently streaming
	// video from the camera. Obviously, we start at false.

	var streaming = false;
	var photoTaken = false;
	// The various HTML elements we need to configure or control. These
	// will be set by the startup() function.

	var video = null;
	var canvas = null;
	var photo = null;
	var startbutton = null;

	function startup() {
		video = document.getElementById('video');
		canvas = document.getElementById('canvas');
		photo = document.getElementById('photo');
		startbutton = document.getElementById('startbutton');
		stopbutton = document.getElementById(('stopbutton'));
		start_Camera_button = document.getElementById('start_Camera_button');

		navigator.mediaDevices.getUserMedia(
			{
				video: true,
				audio: false
			})
			.then(function (stream) {
				video.srcObject = stream;
				video.play();
			})
			.catch(function (err) {
				console.log("An error occurred: " + err);
			});

		video.addEventListener('canplay', function (ev) {
			//	alert('video streaming started');
			if (!streaming) {
				height = video.videoHeight / (video.videoWidth / width);

				// Firefox currently has a bug where the height can't be read from
				// the video, so we will make assumptions if this happens.

				if (isNaN(height)) {
					height = width / (4 / 3);
				}

				video.setAttribute('width', width);
				video.setAttribute('height', height);
				canvas.setAttribute('width', width);
				canvas.setAttribute('height', height);
				streaming = true;
			}
		}, false);

		start_Camera_button.addEventListener('click', function (ev) {

			navigator.mediaDevices.getUserMedia(
				{
					video: true,
					audio: false
				})
				.then(function (stream) {
					video.srcObject = stream;
					video.play();


				})
				.catch(function (err) {
					console.log("An error occurred: " + err);
				});


		})
		startbutton.addEventListener('click', function (ev) {
			//	alert('startbutton clicked');


			photoTaken = true;
			takepicture();
			ev.preventDefault();


		}, false);

		//This switches off the camera including the light
		stopbutton.addEventListener('click', function (ev) {
			//	alert('stopbutton clicked');
			stream = video.srcObject;
			// now get all tracks
			tracks = stream.getTracks();
			// now close each track by having forEach loop
			tracks.forEach(function (track) {
				// stopping every track
				track.stop();
			});
			streaming = false;
			ev.preventDefault();

		}, false);

		clearphoto();
	}

	// Fill the photo with an indication that none has been
	// captured.

	function clearphoto() {

		var context = canvas.getContext('2d');
		context.fillStyle = "#AAA";
		context.fillRect(0, 0, canvas.width, canvas.height);

		var data = canvas.toDataURL('image/png');
		photo.setAttribute('src', data);



	}

	// Capture a photo by fetching the current contents of the video
	// and drawing it into a canvas, then converting that to a PNG
	// format data URL. By drawing it on an offscreen canvas and then
	// drawing that to the screen, we can change its size and/or apply
	// other changes before drawing it.

	function takepicture() {
		var context = canvas.getContext('2d');
		if (width && height) {
			canvas.width = width;
			canvas.height = height;
			context.drawImage(video, 0, 0, width, height);

			var data = canvas.toDataURL('image/png');
			photo.setAttribute('src', data);
			if (photoTaken) {

				$.ajax({
					type: "POST",
					enctype: 'multipart/form-data',
					url: "/server/selfie/upload_selfie",
					data: JSON.stringify(data),
					processData: false,
					contentType: false,
					cache: false,
					success: function (data) {

						$("#result_output").prepend(data);
						photoTaken = false;
					},
					error: function (e) {
						$("#result_output").text("Failure in File Upload");
						photoTaken = false;
					}
				});
			}
		} else {
			clearphoto();
		}
	}


	// Set up our event listener to run the startup process
	// once loading is complete.
	window.addEventListener('load', startup, false);
})();