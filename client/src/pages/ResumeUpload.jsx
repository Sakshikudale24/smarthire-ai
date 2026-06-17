import "./ResumeUpload.css";
import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

function ResumeUpload() {
const [file, setFile] = useState(null);
const [jobDescription, setJobDescription] = useState("");
const [atsResult, setAtsResult] = useState("");
const [questions, setQuestions] = useState("");
const [loading, setLoading] = useState(false);

const extractScore = () => {
if (!atsResult) return null;


const cleanText = atsResult.replace(/\*/g, "");

const match =
  cleanText.match(/Score\s*:\s*(\d+)/i) ||
  cleanText.match(/(\d+)\s*\/\s*100/);

return match ? parseInt(match[1], 10) : null;


};

const score = extractScore();

const handleAtsAnalysis = async () => {
if (!file) {
alert("Please upload a resume.");
return;
}

if (!jobDescription.trim()) {
  alert("Please enter a job description.");
  return;
}

setLoading(true);
setAtsResult("");
setQuestions("");

try {
  const formData = new FormData();
  formData.append("resume", file);

  const uploadResponse = await axios.post(
    "http://localhost:5000/upload-resume",
    formData
  );

  const atsResponse = await axios.post(
    "http://localhost:5000/analyze-ats",
    {
      filePath: uploadResponse.data.filePath,
      jobDescription,
    }
  );

  setAtsResult(atsResponse.data.atsAnalysis);
} catch (error) {
  console.error(error);
  alert("Failed to analyze resume.");
} finally {
  setLoading(false);
}


};

const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("SmartHire AI Report", 20, 20);

  doc.setFontSize(12);

  doc.text(
    `ATS Score: ${score || 0}%`,
    20,
    40
  );

  doc.text(
    "ATS Analysis:",
    20,
    60
  );

  doc.text(
    atsResult
      ? atsResult.substring(0, 2000)
      : "No analysis available",
    20,
    70
  );

  doc.save("SmartHire_Report.pdf");
};

const generateQuestions = async () => {
try {
const response = await axios.post(
"http://localhost:5000/generate-questions",
{
analysis: atsResult,
}
);

  setQuestions(response.data.questions);
} catch (error) {
  console.error(error);
  alert("Failed to generate questions.");
}


};

return (
   <div className="upload-shell">

  <div className="hero-section">
    <span className="hero-label">
      RESUME INTELLIGENCE
    </span>

    <h1>AI Candidate Screening</h1>

    <p>
      Upload resumes, analyze ATS compatibility,
      and generate interview questions.
    </p>
  </div>

  <div className="workspace-grid">

    <div className="workspace-card">

      <h3>Resume Upload</h3>

      <div className="upload-zone">

        <div className="upload-icon">
          📄
        </div>

        <h4>
          {file ? file.name : "Select Resume PDF"}
        </h4>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

      </div>

    </div>

    <div className="workspace-card">

      <h3>Job Description</h3>

      <textarea
        rows="12"
        placeholder="Paste job description..."
        value={jobDescription}
        onChange={(e) =>
          setJobDescription(e.target.value)
        }
      />

    </div>

  </div>

  <div className="action-row">

    <button
      className="primary-btn"
      onClick={handleAtsAnalysis}
      disabled={loading}
    >
      {loading
        ? "Analyzing..."
        : "Analyze Candidate"}
    </button>

  </div>

  {loading && (
    <div className="result-card">
      <h2>AI Analysis Running</h2>
      <p>Processing resume...</p>
    </div>
  )}

  {atsResult && !loading && (
    <div className="result-card">

      <div className="result-header">

        <h2>ATS Compatibility Report</h2>

        {score !== null && (
          <div className="score-pill">
            {score}%
          </div>
        )}

      </div>

      <button
        className="secondary-btn"
        onClick={generateQuestions}
      >
        Generate Questions
      </button>

      <button
  onClick={downloadPDF}
  style={{
    marginTop: "10px",
    padding: "10px 18px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
  }}
>
  📄 Download PDF Report
</button>

      <div className="markdown-content">
        <ReactMarkdown>
          {atsResult}
        </ReactMarkdown>
      </div>

    </div>
  )}

  {questions && (
    <div className="result-card">

      <h2>Interview Questions</h2>

      <div className="markdown-content">
        <ReactMarkdown>
          {questions}
        </ReactMarkdown>
      </div>

    </div>
  )}

</div>


);
}

export default ResumeUpload;
