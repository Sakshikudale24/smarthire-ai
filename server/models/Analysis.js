const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  fileName: String,
  atsScore: Number,
  skills: [String],
  analysis: String,
  questions: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "Analysis",
  analysisSchema
);