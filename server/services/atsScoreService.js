function calculateATSScore(
  resumeText,
  jobDescription
) {
  const resume = resumeText.toLowerCase();
  const jd = jobDescription.toLowerCase();

  const keywords = jd
    .split(/\s+/)
    .filter((word) => word.length > 3);

  let matchedKeywords = 0;

  keywords.forEach((keyword) => {
    if (resume.includes(keyword)) {
      matchedKeywords++;
    }
  });

  const keywordScore =
    (matchedKeywords / keywords.length) * 100;

  return Math.round(keywordScore);
}

module.exports = calculateATSScore;