import { useEffect, useRef, useState, useCallback } from "react";
import api from "../services/api";
export default function useMediaRecorder({
    silenceDuration = 2000,
    noSpeechTimeout = 12000,
    isAssistantSpeaking = false,
} = {}) {
    const assistantSpeakingRef = useRef(isAssistantSpeaking);
    useEffect(() => {
        assistantSpeakingRef.current = isAssistantSpeaking;
    }, [isAssistantSpeaking]);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationFrameRef = useRef(null);
    const silenceStartRef = useRef(null);
    const hasSpokenRef = useRef(false);
    const speechFramesRef = useRef(0);
    const recordingStartTimeRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const recordingRef = useRef(false);
    const setRecordingState = useCallback((value) => {
        recordingRef.current = value;
        setRecording(value);
    }, []);
    const onSpeechRef = useRef(() => {});
    const setOnSpeech = useCallback(fn => {
        onSpeechRef.current = fn;
    }, []);
    const onSilenceRef = useRef(() => {});
    const onTimeoutRef = useRef(() => {});
    const bargeFramesRef = useRef(0);
    const setOnSilence = useCallback((fn) => {onSilenceRef.current = fn;}, []);
    const setOnTimeout = useCallback((fn) => {onTimeoutRef.current = fn;}, []);
    const stopAnalysisLoop = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    };
    const teardownAudioGraph = () => {
        stopAnalysisLoop();
        audioContextRef.current?.close();
        audioContextRef.current = null;
        analyserRef.current = null;
        sourceRef.current = null;
        silenceStartRef.current = null;
        hasSpokenRef.current = false;
        speechFramesRef.current = 0;
        recordingStartTimeRef.current = null;
    };

    const startRecording = useCallback(async () => {
        if (recordingRef.current) return;
        if (!navigator.mediaDevices) {
            alert("Media Devices are not supported.");
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            setRecordingState(true);
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            audioContextRef.current = audioContext;
            sourceRef.current = source;
            analyserRef.current = analyser;
            silenceStartRef.current = null;
            hasSpokenRef.current = false;
            speechFramesRef.current = 0;
            recordingStartTimeRef.current = Date.now();
            const dataArray = new Uint8Array(analyser.fftSize);
            const checkVolume = () => {
                analyser.getByteTimeDomainData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const sample = (dataArray[i] - 128) / 128;
                    sum += sample * sample;
                }
                const rms = Math.sqrt(sum / dataArray.length);
                const THRESHOLD = 0.03;
                const SPEECH_FRAME_THRESHOLD = 8;
                if (rms > THRESHOLD) {
                    if (assistantSpeakingRef.current) {

                        // User trying to interrupt AI
                        bargeFramesRef.current++;

                        if (bargeFramesRef.current >= 10) {

                            console.log("🛑 Barge-In Detected");

                            onSpeechRef.current?.();

                            bargeFramesRef.current = 0;

                        }

                    } else {

                        // Normal conversation
                        speechFramesRef.current++;

                        if (speechFramesRef.current >= SPEECH_FRAME_THRESHOLD) {

                            hasSpokenRef.current = true;

                            silenceStartRef.current = null;

                            console.log("🎤 Speaking", rms.toFixed(4));

                        }

                    }

                } else {

                    // Reset counters
                    speechFramesRef.current = 0;
                    bargeFramesRef.current = 0;

                    if (!silenceStartRef.current) {

                        silenceStartRef.current = Date.now();

                    }

                    const silenceTime =
                        Date.now() - silenceStartRef.current;

                    if (hasSpokenRef.current &&
                        silenceTime >= silenceDuration) {

                        console.log("🛑 Silence detected (turn end)");

                        stopAnalysisLoop();

                        onSilenceRef.current?.();

                        return;

                    }

                    if (!hasSpokenRef.current &&
                        silenceTime >= noSpeechTimeout) {

                        console.log("⌛ No speech timeout");

                        stopAnalysisLoop();

                        onTimeoutRef.current?.();

                        return;

                    }

                    console.log(
                        "🤫 Silent",
                        silenceTime,
                        rms.toFixed(4)
                    );

                }

                animationFrameRef.current = requestAnimationFrame(checkVolume);
            };
            checkVolume();
            chunksRef.current = [];
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };
            recorder.start();
        } catch (err) {
            console.error(err);
            setRecordingState(false);
        }
    }, [setRecordingState, silenceDuration, noSpeechTimeout]);
    const stopRecording = useCallback(() => {
        return new Promise((resolve) => {
            const recorder = mediaRecorderRef.current;
            if (!recorder) {
                resolve("");
                return;
            }
            recorder.onstop = async () => {
                const blob = new Blob(
                    chunksRef.current,
                    { type: recorder.mimeType || "audio/webm" }
                );
                const formData = new FormData();
                const extension = recorder.mimeType.includes("mp4")? "m4a": "webm";
                formData.append("audio", blob, `audio.${extension}`);
                try {
                    const res = await api.post("/speech/transcribe", formData);
                    resolve(res.data.text);
                } catch (err) {
                    console.error(err);
                    resolve("");
                } finally {
                    recorder.stream.getTracks().forEach((track) => track.stop());
                    teardownAudioGraph();
                    setRecordingState(false);
                }
            };
            stopAnalysisLoop();
            if (recorder.state !== "inactive") {
                recorder.stop();
            } else {
                setRecordingState(false);
            }
        });

    }, []);
    const cancelRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        stopAnalysisLoop();
        if (recorder) {
            recorder.onstop = null;
            if (recorder.state !== "inactive") {
                recorder.stop();
            }
            recorder.stream?.getTracks().forEach((track) => track.stop());
        }
        teardownAudioGraph();
        setRecordingState(false);
    }, [setRecordingState]);
    return {
        recording,
        startRecording,
        stopRecording,
        cancelRecording,
        setOnSilence,
        setOnTimeout,
        setOnSpeech
    };
}
