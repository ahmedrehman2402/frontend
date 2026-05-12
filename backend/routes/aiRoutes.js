import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { protect, authorize } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY;

// @route   POST /api/ai/generate-quiz
// @desc    Generate a JSON quiz using Gemini API
const aiConfig = {
  // If api key isn't provided directly as an env var GEMINI_API_KEY, 
  // you can fall back to passing it here if needed. But it's recommended to rely on env.
};

router.post('/generate-quiz', protect, async (req, res) => {
  try {
    const { courseTitle, category, difficulty = 'Medium', questionsCount = 5 } = req.body;

    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the backend.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert educator. Generate a multiple-choice quiz for a course titled "${courseTitle}" in the category "${category}". 
      Target Difficulty: ${difficulty}.
      Number of questions: ${questionsCount}.
      
      Respond STRICTLY with a valid JSON array of question objects. 
      Do NOT include markdown block markers (e.g. \`\`\`json). Just the raw JSON array.
      Use this exact JSON schema format for each object in the array:
      {
        "id": "q1",
        "question": "The question text",
        "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"],
        "correctAnswerIndex": 0 // Integer representing the correct index in the options array
      }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    let resultText = response.text.trim();
    // Strip markdown formatting if the model still accidentally includes it
    if (resultText.startsWith('\`\`\`json')) {
      resultText = resultText.replace(/^\`\`\`json\s*/, '');
      resultText = resultText.replace(/\s*\`\`\`$/, '');
    }

    const quizJSON = JSON.parse(resultText);

    res.status(200).json({ quiz: quizJSON });
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    res.status(500).json({ message: error.message || 'Failed to generate AI quiz' });
  }
});

export default router;
