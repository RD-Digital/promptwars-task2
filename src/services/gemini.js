import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";
import { API_CONFIG } from "../config/constants";

/**
 * Gemini AI Knowledge Assistant Service.
 * Implements input locking and strict safety thresholds for security metrics.
 */

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Sanitizes and truncates user input before AI processing.
 * @param {string} text - Raw user input
 * @returns {string} Sanitized and safely truncated text
 */
const sanitizeInput = (text) => {
  if (typeof text !== 'string') return "";
  return text
    .trim()
    .slice(0, API_CONFIG.MAX_INPUT_LENGTH)
    .replace(/[<>]/g, "");
};

/**
 * Generates context-aware civic advice.
 */
export const getCivicAdvice = async (contextStr, userQuery, messageHistory = []) => {
  const safeQuery = sanitizeInput(userQuery);
  if (!safeQuery || !genAI) return "I'm sorry, my systems are currently restricted. Please check your configuration.";
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: API_CONFIG.SAFETY_THRESHOLD },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: API_CONFIG.SAFETY_THRESHOLD },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: API_CONFIG.SAFETY_THRESHOLD },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: API_CONFIG.SAFETY_THRESHOLD },
      ]
    });
    
    const history = messageHistory
      .filter(msg => msg.text && msg.type !== 'question_age')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: sanitizeInput(msg.text) }]
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

    const result = await chat.sendMessage(safeQuery);
    const response = await result.response;
    return response.text();
  } catch (error) {
    logger.error("Gemini API Failure", error);
    return `[Error] I'm currently unable to connect to the AI service. (${error.message || 'Check connection'})`;
  }
};

/**
 * Specialized Knowledge Retrieval with structured data context.
 */
export const askGeminiWithContext = async (query, data, source) => {
  const safeQuery = sanitizeInput(query);
  if (!safeQuery || !genAI) return "Knowledge Retrieval is currently unavailable.";

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: API_CONFIG.SAFETY_THRESHOLD },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: API_CONFIG.SAFETY_THRESHOLD },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: API_CONFIG.SAFETY_THRESHOLD },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: API_CONFIG.SAFETY_THRESHOLD },
      ]
    });
    
    const prompt = `You are a civic assistant.
Answer the user's question clearly using ONLY the provided data.

User Question:
${safeQuery}

Data:
${JSON.stringify(data)}

Instructions:
- Do not hallucinate
- If data is incomplete, say so
- You must ONLY use the provided data.

Source:
${source}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    logger.error("Knowledge Assistant failure", error);
    return `[Error] Knowledge Assistant connection failed.`;
  }
};
