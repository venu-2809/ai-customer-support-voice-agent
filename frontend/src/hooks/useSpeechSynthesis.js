import { useEffect, useRef, useState } from "react";

export default function useSpeechSynthesis() {

    const [speaking, setSpeaking] = useState(false);
    const activeUtteranceRef = useRef(null);

    const speak = (text, onFinish) => {

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        activeUtteranceRef.current = utterance;

        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
            setSpeaking(true);
        };

        utterance.onend = () => {
            if (activeUtteranceRef.current !== utterance) return;

            activeUtteranceRef.current = null;
            setSpeaking(false);
            onFinish?.();
        };

        utterance.onerror = () => {
            if (activeUtteranceRef.current !== utterance) return;

            activeUtteranceRef.current = null;
            setSpeaking(false);
        };

        speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        speechSynthesis.cancel();
        activeUtteranceRef.current = null;
        setSpeaking(false);
    };

    useEffect(() => {
        return () => speechSynthesis.cancel();
    }, []);

    return {
        speaking,
        speak,
        stopSpeaking,
    };
}