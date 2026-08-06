import api from "./api";

class ConversationService {

    async processMessage(message, sessionId) {

        const response = await api.post("/chat", {
            message,
            session_id: sessionId,
        });

        return response.data;

    }

}

export const conversationService = new ConversationService();