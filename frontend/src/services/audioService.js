class AudioService {

    speak(text, onFinish) {

        speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {

            if (onFinish)
                onFinish();

        };

        speechSynthesis.speak(utterance);

    }

    stop() {

        speechSynthesis.cancel();

    }

    isSpeaking() {

        return speechSynthesis.speaking;

    }

}

export const audioService = new AudioService();