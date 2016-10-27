// Emoji based audio visualizer.

/**
 * Gets the audio context, in case of an old browser.
 */
function getContext() {
    if (typeof AudioContext !== "undefined") {
        return new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
        return new webkitAudioContext();
    } else {
        return null;
    }
}


/**
 * Adjusts the value to the appropriate range of values.
 *
 * value - value to adjust
 * returns the adjusted value
 */
function getAdjustedValue(value) {
    var newValue = value + 128513;
    if (newValue == 128512) {
        newValue = 128528;
    }
    return newValue;
}



/**
 * Calculates the average of an array
 *
 * values - array of ints
 * returns the average
 */
function arrayAverage(values) {
    var sum = 0;
    var length = values.length;
    for (var i = 0 ; i < values.length; i++) {
        if (values.length != 0) {
            sum += values[i];
        } else {
            length -= 1;
        }
    }
    return sum / length;
}


/**
 * Calculates the values from the frequency data
 *
 * frequencyData - array of data
 * returns an array with the values
 */
function getValues(frequencyData, valueCount) {
    var length = Math.floor(frequencyData.length / valueCount);
    var values = []
    for (var i = 0; i < valueCount; i++) {
        var subarray = frequencyData.slice(i * length, (i + 1) * length - 1);
        var value = arrayAverage(subarray) * (52 / 225) - 1;
        value = getAdjustedValue(Math.floor(value));
        values[i] = Math.min(value, 128565);
    }
    return values;
}


/**
 * Converts the values to their emoji representations
 *
 * values - array of data
 * returns string containing the emojis
 */
function valuesToEmojiString(values) {
    var emojis = []
    for (var i = 0; i < values.length; i++) {
        if (!values[i]) {
            // default value: music note
            // it seems fitting
            values[i] = 127925; 
        }
        emojis[i] = "&#" + values[i];
    }
    return emojis.join(" ");
}


/**
 * Starts the visualization
 *
 * elementID - id of the visualization display element
 * audioID - id of the audio element
 * emojiCount - number of emojis to display; best with multiples of 
 *              two; does not work well when greater than 16
 */
function startVisualizer(elementID, audioID, emojiCount) {

    // Create the analyser.
    var context = getContext();
    var analyser = context.createAnalyser();
    analyser.fftSize = 64;
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // Get the frequency data and update the visualization.
    var visualization = document.getElementById(elementID);
    function updateEmojis() {

        // This is on a timeout so that it doesn't update too quickly.
        setTimeout(function() {

            // Next update.
            requestAnimationFrame(updateEmojis);

            // Calculate the emoji values.
            analyser.getByteFrequencyData(frequencyData);
            var values = getValues(frequencyData, emojiCount);
            var emojiString = valuesToEmojiString(values);

            // Display the emojis. First as unicode, then use twemoji for pretty images.
            visualization.innerHTML = emojiString + " <br />";
            twemoji.parse(visualization);
        }, 70);
    };

    // Connect the analyzer to the audio eleent.
    var audioElement = document.getElementById(audioID);
    audioElement.addEventListener("canplay", function() {
		var source = context.createMediaElementSource(this);
		source.connect(analyser);
		analyser.connect(context.destination);

        // Start the visualizer.
        updateEmojis();
	});

    
}