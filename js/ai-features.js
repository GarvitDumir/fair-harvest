
function startVoiceAssistant(onResultCallback) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Web Speech API is not supported in this browser. Please use Google Chrome!");
        return;
    }

    if (window.location.protocol === 'file:') {
        alert("⚠️ Chrome blocks microphone access on file:// URLs.\n\nPlease open farmer.html using VS Code Live Server or use the Simulate Voice button!");
    }

    const recognition = new SpeechRecognition();

    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        console.log("Microphone active... Speak now!");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice Transcript Captured:", transcript);

        const parsedData = parseVoiceText(transcript);
        onResultCallback(parsedData);
    };

    recognition.onerror = (err) => {
        console.error("Speech Error:", err.error);

        if (err.error === 'not-allowed') {
            alert("Microphone access was denied! Click the lock icon in Chrome address bar to allow Microphone.");
        }
    };

    recognition.start();
}

function parseVoiceText(text) {
    const lower = text.toLowerCase();
    let cropId = "1";

    if (lower.includes("adrak") || lower.includes("ginger")) cropId = "2";
    if (lower.includes("cardamom") || lower.includes("elaichi")) cropId = "3";
    if (lower.includes("orange") || lower.includes("santra") || lower.includes("santara")) cropId = "4";

    const numbers = text.match(/\d+/);
    let qty = 50;

    if (numbers) qty = parseInt(numbers[0], 10);

    return {
        cropId,
        quantity: qty,
        rawText: text
    };
}
