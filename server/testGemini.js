// 1. Explicitly load environment variables first
import 'dotenv/config'; 
import { GoogleGenAI } from '@google/genai';

// 2. Initialize the client
const ai = new GoogleGenAI({});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Hello Gemini!',
    });

    console.log(response.text);
  } catch (error) {
    console.error("Error details:", error);
  }
}

test();
