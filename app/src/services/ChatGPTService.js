import axios from "axios";

const API_URL = "http://localhost:3008/gptEnhance/enhance"; // or your deployed server URL

const ChatGPTService = {
  callChatGPT: async (prompt) => {
    try {
      const response = await axios.post(API_URL, { prompt });
      return response.data.enhanced;
    } catch (err) {
      console.error("Failed to call backend ChatGPT API:", err);
      return null;
    }
  },
};

export default ChatGPTService;
