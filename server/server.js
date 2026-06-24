const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const pdfParse = require("pdf-parse");
const multer = require("multer");

require("dotenv").config();

// Automatically create 'uploads' folder dynamically if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created missing uploads directory');
}

console.log("API KEY:", process.env.GEMINI_API_KEY);

const { analyzeResume, generateQuestionsFromAnalysis, calculateAtsScore } = require("./services/geminiService");
const calculateATSScore = require("./services/atsScoreService");

const User = require("./models/User");
const Analysis = require("./models/Analysis");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("SmartHire AI Backend Running");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads'); 
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration Failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong Password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login Failed" });
  }
});

app.post("/upload-resume", upload.single("resume"), (req, res) => {
  console.log(req.file);
  res.json({
    message: "Resume Uploaded Successfully",
    filePath: req.file.path, // Sends complete dynamic absolute path back to frontend
  });
});

app.post("/analyze-resume", async (req, res) => {
  let absoluteFilePath = "";
  try {
    const incomingPath = req.body.filePath;

    // Resolve structural paths relative vs absolute safely for cloud environments
    absoluteFilePath = path.isAbsolute(incomingPath) 
      ? incomingPath 
      : path.join(__dirname, incomingPath);

    console.log("Reading file:", absoluteFilePath);

    const dataBuffer = fs.readFileSync(absoluteFilePath);
    console.log("PDF loaded");

    const pdfData = await pdfParse(dataBuffer);
    console.log("PDF parsed");

    const analysis = await analyzeResume(pdfData.text);

    let atsScore = calculateATSScore(
      pdfData.text,
      req.body.jobDescription || ""
    );

    console.log("ATS Score:", atsScore);

    const scoreMatch = analysis.match(/(\d+)\s*\/\s*100/);
    atsScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    console.log("About to save analysis...");
    const skills = ["React", "Node.js", "MongoDB", "Express", "JavaScript"];

    const savedAnalysis = await Analysis.create({
      fileName: path.basename(absoluteFilePath),
      atsScore,
      skills,
      analysis,
    });
    console.log(savedAnalysis);

    console.log("Analysis saved successfully. Gemini analysis completed.");

    // Dynamic disk cleanup to save resource limits on Render
    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
    }

    res.json({ analysis });

  } catch (error) {
    console.log(error);
    // Safe fallback cleanup if an execution exception triggers midway
    if (absoluteFilePath && fs.existsSync(absoluteFilePath)) {
      try { fs.unlinkSync(absoluteFilePath); } catch (e) {}
    }
    res.status(500).json({ message: "Error analyzing resume" });
  }
});

app.post("/generate-questions", async (req, res) => {
  try {
    const { analysis } = req.body;

    if (!analysis) {
      return res.status(400).json({ error: "Analysis text is required" });
    }

    const questions = await generateQuestionsFromAnalysis(analysis);
    res.json({ questions });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

app.post("/analyze-ats", async (req, res) => {
  let absoluteFilePath = "";
  try {
    const { filePath, jobDescription } = req.body;

    if (!filePath || !jobDescription) {
      return res.status(400).json({
        message: "File path and job description are both required.",
      });
    }

    // Resolve structural paths relative vs absolute safely for cloud environments
    absoluteFilePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(__dirname, filePath);

    const dataBuffer = fs.readFileSync(absoluteFilePath);
    const pdfData = await pdfParse(dataBuffer);

    let cleanText = (pdfData.text || "")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const optimizedResumeText = cleanText.substring(0, 4000);
    console.log("Sending clean, lightweight text stream to Gemini...");

    const rawAnalysisText = await calculateAtsScore(
      optimizedResumeText,
      jobDescription.substring(0, 2000)
    );

    const scoreMatch = rawAnalysisText.match(/(\d+)\s*\/\s*100/);
    const atsScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    console.log("Saving ATS analysis to MongoDB...");

    const savedAnalysis = await Analysis.create({
      fileName: path.basename(absoluteFilePath),
      atsScore,
      analysis: rawAnalysisText,
    });

    console.log("Saved:", savedAnalysis._id);
    console.log("Data processing complete!");

    // Dynamic disk cleanup to save resource limits on Render
    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
    }

    res.json({ atsAnalysis: rawAnalysisText });

  } catch (error) {
    console.error("Server ATS Route Failure:", error);
    // Safe fallback cleanup if an execution exception triggers midway
    if (absoluteFilePath && fs.existsSync(absoluteFilePath)) {
      try { fs.unlinkSync(absoluteFilePath); } catch (e) {}
    }
    res.status(500).json({ message: "Failed to evaluate ATS metrics." });
  }
});

app.get("/analysis-history", async (req, res) => {
  try {
    const history = await Analysis.find().sort({ createdAt: -1 }).limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

app.get("/dashboard-stats", async (req, res) => {
  try {
    const totalApplications = await Analysis.countDocuments();
    const avgResult = await Analysis.aggregate([
      {
        $group: {
          _id: null,
          averageATS: { $avg: "$atsScore" },
        },
      },
    ]);

    const averageATS = avgResult.length > 0 ? Math.round(avgResult[0].averageATS) : 0;

    res.json({ totalApplications, averageATS });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
});

app.get("/ats-distribution", async (req, res) => {
  try {
    const analyses = await Analysis.find();

    const distribution = [
      { range: "90-100", count: 0 },
      { range: "80-89", count: 0 },
      { range: "70-79", count: 0 },
      { range: "60-69", count: 0 },
      { range: "0-59", count: 0 },
    ];

    analyses.forEach((item) => {
      const score = item.atsScore;
      if (score >= 90) distribution[0].count++;
      else if (score >= 80) distribution[1].count++;
      else if (score >= 70) distribution[2].count++;
      else if (score >= 60) distribution[3].count++;
      else distribution[4].count++;
    });

    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ATS distribution" });
  }
});

// App listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
