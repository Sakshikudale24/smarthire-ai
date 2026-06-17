import "./Dashboard.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


function Dashboard() {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [history, setHistory] = useState([]);

  const [stats, setStats] = useState({
  totalApplications: 0,
  averageATS: 0,
});

const [signals, setSignals] = useState({
  totalResumes: 0,
  avgATS: 0,
  highScoreResumes: 0,
});

const [atsData, setAtsData] = useState([]);
const [candidates, setCandidates] = useState([]);
const [skills, setSkills] = useState([]);

  const fetchHistory = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/analysis-history"
    );

    setHistory(response.data);
  } catch (error) {
    console.log(error);
  }
};

const fetchStats = async () => {
  try {

    const response = await axios.get(
      "http://localhost:5000/dashboard-stats"
    );

    setStats(response.data);

  } catch (error) {
    console.log(error);
  }
};

const fetchATSDistribution = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/ats-distribution"
    );

    setAtsData(response.data);

  } catch (error) {
    console.log(error);
  }
};

const fetchCandidates = async () => {
  try {

    const response = await axios.get(
      "http://localhost:5000/candidate-shortlist"
    );

    setCandidates(response.data);

  } catch (error) {
    console.log(error);
  }
};

const fetchSignals = async () => {
  try {

    const response = await axios.get(
      "http://localhost:5000/ai-signals"
    );

    setSignals(response.data);

  } catch (error) {
    console.log(error);
  }
};
const fetchSkills = async () => {
  try {

    const response = await axios.get(
      "http://localhost:5000/top-skills"
    );

    setSkills(response.data);

  } catch (error) {
    console.log(error);
  }
};
 useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  fetchHistory();
   fetchStats();
   fetchATSDistribution();
   fetchCandidates();
   fetchSignals();
   fetchSkills();
},
[]);

console.log(signals);
console.log("ATS DATA:", atsData);

  return (
      

    <div className="dashboard-shell">

      <button className="logout-btn" onClick={logout}>
  Logout
</button>

      <div className="hero-section">
        <span className="hero-label">COMMAND HUB</span>

        <h1>Good Morning, Recruiter</h1>

        <p>
          Snapshot of your hiring pipeline, ATS performance,
          and AI candidate insights.
        </p>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <span>APPLICATIONS</span>
          <h2>{stats.totalApplications}</h2>
             <p>
              {stats.totalApplications} submitted
            </p>
        </div>

        <div className="stat-card">
          <span>INTERVIEWING</span>
          <h2>12</h2>
          <p>Active candidates</p>
        </div>

        <div className="stat-card">
          <span>OFFERS</span>
          <h2>4</h2>
          <p>Pending review</p>
        </div>

        <div className="stat-card">
          <span>ATS SCORE</span>
          <h2>{stats.averageATS}%</h2>
          <p>AI screening quality</p>
        </div>

      </div>

     <div className="dashboard-grid">

  {/* Resume Intelligence */}
  <div className="main-card">
    <h3>Resume Intelligence</h3>

    <p>
      Upload candidate resumes and run ATS
      compatibility analysis using AI.
    </p>

    <Link to="/upload-resume">
      <button className="primary-btn">
        Open Resume Workspace
      </button>
    </Link>
  </div>

  {/* Recent Resume Analyses */}
  <div className="side-card">
    <h3>Recent Resume Analyses</h3>

    {history.length === 0 ? (
      <p>No analyses found.</p>
    ) : (
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}  
      >
        <thead>
          <tr>
            <th align="left">File</th>
            <th align="left">ATS Score</th>
          </tr>
        </thead>

        <tbody>
          {history.map((item) => (
            <tr key={item._id}>
              <td>{item.fileName}</td>
              <td>{item.atsScore}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>

  {/* Top Skills */}
  <div className="main-card">
    <h3>Top Skills Detected</h3>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginTop: "15px",
      }}
    >
      {skills.map((skill, index) => (
  <span
    key={index}
    className="skill-tag"
  >
    {skill}
  </span>
))}
    </div>
  </div>

  {/* Candidate Shortlist */}
  <div className="side-card">
    <h3>Candidate Shortlist</h3>

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr>
          <th align="left">Candidate</th>
          <th align="left">ATS Score</th>
          <th align="left">Status</th>
        </tr>
      </thead>

      <tbody>
        {candidates.map((candidate, index) => (
          <tr key={index}>
            <td>{candidate.fileName}</td>
            <td>{candidate.atsScore}%</td>
            <td>{candidate.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="main-card">
  <h3>ATS Score Distribution</h3>

  <div
    style={{
      width: "100%",
      height: "300px",
      marginTop: "20px",
    }}
  >
    <ResponsiveContainer>
      <BarChart data={atsData}>
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Bar
          dataKey="count"
          fill="#6366f1"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

 {/* AI Signals */}
<div className="main-card">
  <h3>AI Signals</h3>

  <div className="signal">
    Total resumes analyzed: {signals.totalResumes}
  </div>

  <div className="signal">
    Average ATS Score: {signals.avgATS}%
  </div>

  <div className="signal">
    High ATS resumes: {signals.highScoreResumes}
  </div>
</div>
</div>

    </div>
  );
}

export default Dashboard;