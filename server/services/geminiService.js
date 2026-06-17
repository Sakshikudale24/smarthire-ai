const { GoogleGenAI } = require("@google/genai");

// Revert back to the stable initialization instance layout
const ai = new GoogleGenAI({});



// Function 1: Analyze the resume text
async function analyzeResume(text) {
  try {
    const prompt = `
You are an expert recruiter.
Analyze this resume and provide a Score out of 100, Strengths, Weaknesses, Missing Skills, and Suggestions.
Resume: ${text}
`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    throw error;
  }
}

// Function 2: Generate questions based on the analysis text
async function generateQuestionsFromAnalysis(analysisText) {
  try {
    const prompt = `
Based on the following resume analysis, generate 10 interview questions including Technical, Project, and HR Questions.
Analysis: ${analysisText}
`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Question Generation Error:", error);
    throw error;
  }
}

// Function 3: Calculate ATS Score based on Resume and Job Description (JSON MODE)
async function calculateAtsScore(resumeText, jobDescription) {
  try {
    const prompt = `
You are an advanced Application Tracking System (ATS) optimization engine.
Evaluate the following Candidate Resume against the specific Job Description provided.

Format your output EXACTLY with this structure:
Score: [Insert Integer Number here]/100
Keyword Gaps: [Insert details]
Recommendations: [Insert details]

---
JOB DESCRIPTION:
${jobDescription}

---
CANDIDATE RESUME:
${resumeText}
`;

    // CHANGE: Use generateContentStream to stream the text word-by-word
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.5-flash',
      contents: prompt
    });

    // Combine all incoming word chunks into one final text block string
    let completeText = "";
    for await (const chunk of responseStream) {
      completeText += chunk.text;
    }

    return completeText;
  } catch (error) {
    console.error("ATS Calculation Error:", error);
    throw error;
  }
}


module.exports = { 
  analyzeResume, 
  generateQuestionsFromAnalysis, 
  calculateAtsScore 
};
