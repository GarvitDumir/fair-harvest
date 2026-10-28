
function startVoiceAssistant(onResultCallback) {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert(
            "Voice recognition is not supported in this browser. Please use Chrome!"
        );
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        console.log("Listening for voice...");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Spoken text:", transcript);

        const lower = transcript.toLowerCase();

        let cropName = "Arunachal Kiwi";
        let qty = 50;

        if (
            lower.includes("adrak") ||
            lower.includes("ginger") ||
            lower.includes("अदरक")
        ) {
            cropName = "Fresh Ginger";
        } else if (
            lower.includes("cardamom") ||
            lower.includes("elaichi") ||
            lower.includes("इलायची")
        ) {
            cropName = "Large Cardamom";
        } else if (
            lower.includes("orange") ||
            lower.includes("santra") ||
            lower.includes("संतरा")
        ) {
            cropName = "Organic Orange";
        } else if (
            lower.includes("kiwi") ||
            lower.includes("कीवी")
        ) {
            cropName = "Arunachal Kiwi";
        }

        const numbers = transcript.match(/\d+/);

        if (numbers) {
            qty = parseInt(numbers[0], 10);
        }

        if (typeof onResultCallback === "function") {
            onResultCallback({
                cropName: cropName,
                quantity: qty,
                rawText: transcript
            });
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);

        if (event.error === "no-speech") {
            alert("No speech detected. Please speak clearly and try again.");
        } else {
            alert("Could not recognize your speech. Please try again.");
        }
    };

    recognition.onend = () => {
        console.log("Voice recognition ended.");
    };

    try {
        recognition.start();
    } catch (error) {
        console.error("Could not start recognition:", error);
        alert("Unable to start voice recognition. Please try again.");
    }
}

function scanCropQuality() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                cropName: "Arunachal Kiwi",
                grade: "Grade A Export Quality",
                freshnessDays: 5,
                confidence: "96%",
                notes: "Demo result: Optimal firm texture, uniform color, and no visible transport decay reported."
            });
        }, 1200);
    });
}
