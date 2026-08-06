import { useCallback, useEffect, useRef, useState } from "react";
import { conversationService } from "../services/conversationService";
import { audioService } from "../services/audioService";
import useMediaRecorder from "../hooks/useMediaRecorder";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";
import MicrophoneButton from "./MicrophoneButton";
import ChatWindow from "./ChatWindow";
import StatusBar from "./StatusBar";

function VoiceAgent() {
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState("idle");
    const [sessionId, setSessionId] = useState(null);
    const activeReplyRef = useRef(null);
  //  const {speaking, speak, stopSpeaking } = useSpeechSynthesis();
    const {speak} = useSpeechSynthesis();
    const {recording,startRecording,stopRecording,cancelRecording,setOnSilence,setOnTimeout,
        //setOnSpeech
    } = useMediaRecorder({
        silenceDuration: 2000,
        noSpeechTimeout: 4000,
        //isAssistantSpeaking: speaking,
    });
    const isMeaningfulTranscript = (text) => {
        const trimmed = text.trim();
        return trimmed.length > 0 && /[A-Za-z0-9]/.test(trimmed);
    };
    //const handleSpeech = useCallback(() => {

     //   if (!speaking) return;

       // console.log("🎤 User interrupted AI");
      //  activeReplyRef.current = null;

      //  stopSpeaking();

      //  setStatus("listening");

   // }, [speaking, stopSpeaking]);

    const sendMessage = useCallback(
        async (message, { restartOnEmpty = false } = {}) => {
            if (!isMeaningfulTranscript(message)) {
                if (restartOnEmpty) {
                    setStatus("listening");
                    startRecording();
                } else {
                    setStatus("idle");
                }
                return;
            }

            setMessages((prev) => [
                ...prev,
                { role: "user", text: message },
            ]);

            setStatus("processing");

            try {

                const data = await conversationService.processMessage(
                    message,
                    sessionId
                );

                setSessionId(data.session_id);

                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", text: data.reply },
                ]);

                const replyId = Date.now();
                activeReplyRef.current = { id: replyId };

                setStatus("speaking");
               // startRecording();

                speak(data.reply, () => {
                    if (activeReplyRef.current?.id !== replyId) return;
                    activeReplyRef.current = null;
                    setStatus("listening");
                    startRecording();
                });

            } catch (err) {
                console.error(err);
                setStatus("idle");
            }

        },
        [sessionId, speak, startRecording]
    );
    const handleSilence = useCallback(async () => {

        setStatus("processing");
        const transcript = await stopRecording();
        await sendMessage(transcript, { restartOnEmpty: false });

    }, [stopRecording, sendMessage]);
    const handleTimeout = useCallback(() => {

        cancelRecording();
        setStatus("idle");

    }, [cancelRecording]);

    useEffect(() => {
        setOnSilence(handleSilence);
    }, [handleSilence, setOnSilence]);

    useEffect(() => {
        setOnTimeout(handleTimeout);
    }, [handleTimeout, setOnTimeout]);

    useEffect(() => {
        return () => {
            cancelRecording();
        };
    }, [cancelRecording]);

    //useEffect(() => {
    //    setOnSpeech(handleSpeech);
   // }, [handleSpeech, setOnSpeech]);
    const handleMicClick = async () => {

        if (!recording) {

            setStatus("listening");
            await startRecording();

        } else {

            setStatus("processing");
            const transcript = await stopRecording();
            await sendMessage(transcript);
        }
    };

    return (

        <div className="voice-agent">

            <div className="header">
                AI Voice Agent
            </div>

            <StatusBar status={recording ? "listening" : status} />

            <ChatWindow messages={messages} />

            <div className="footer">
                <MicrophoneButton
                    listening={recording}
                    onClick={handleMicClick}
                />
            </div>

        </div>

    );
}

export default VoiceAgent;
