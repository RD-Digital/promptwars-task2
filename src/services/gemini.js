import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "dummy_key";
const genAI = new GoogleGenerativeAI(apiKey);

export const getCivicAdvice = async (contextStr, userQuery, messageHistory = []) => {
  try {
    if (!apiKey || apiKey === "dummy_key") {
      return "[Fallback Mode] API Key missing. Please check your .env configuration.";
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ]
    });
    
    const history = messageHistory
      .filter(msg => msg.text && msg.type !== 'question_age')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `System Prompt: You are CivicSense AI, a helpful agent for civic education. 
Context: ${contextStr}`}]
        },
        {
          role: "model",
          parts: [{ text: "Understood." }]
        },
        ...history
      ],
    });

    const result = await chat.sendMessage(userQuery);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error detailed:", error);
    // Log status code if available
    if (error.status) console.error("Error Status:", error.status);
    return `[Error] I'm currently unable to connect to the AI service. (${error.message || 'Check Console for details'})`;
  }
};

export const askGeminiWithContext = async (query, data, source) => {
  try {
    if (!apiKey || apiKey === "dummy_key") {
      return "[Fallback Mode] I see you are trying to chat! Please configure your VITE_GEMINI_API_KEY in the .env file to enable live AI responses.";
    }

    if (!data) {
      return "Data is currently syncing. Please verify using official source.";
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ]
    });
    
    const prompt = `You are a civic assistant.
Answer the user's question clearly using ONLY the provided data.

User Question:
${query}

Data:
${JSON.stringify(data)}

Instructions:
- Do not hallucinate
- If data is incomplete, say so
- Keep answer simple and structured
- You must ONLY use the provided data.

Response Format:
Provide your answer, then skip a line and append the source EXACTLY like this:

Source:
${source}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error detailed:", error);
    return `[Error] Knowledge Assistant connection failed. (${error.message || 'Check Console'})`;
  }
};
