import { useState } from "react";

export default function JobMatchVisualization({ data }) {
  const [expandedTab, setExpandedTab] = useState("overview");

  if (!data) {
    return null;
  }

  // Extract data safely
  const analysis = data.analysis || {};
  const jobMatchScore = data.job_match_score || analysis.skill_match_score || 0;
  const projectSkills = analysis.project_skills_implemented || [];
  const futureSkills = analysis.future_skills_required || [];
  const requiredSkillsFromJob = analysis.required_skills_from_job || [];
  const matchingSkills = analysis.matching_skills || [];
  const resumeSkillsDetected = analysis.resume_skills_detected || [];
  const missingSkills = analysis.missing_skills || [];
  
  // Debug: Log data to console
  console.log("Resume Skills Detected:", resumeSkillsDetected);
  console.log("Required Skills from Job:", requiredSkillsFromJob);
  console.log("Matching Skills:", matchingSkills);
  console.log("Missing Skills:", missingSkills);
  
  // Calculate percentages based on actual required skills (not total in resume)
  const totalRequired = futureSkills.length > 0 ? (projectSkills.length + futureSkills.length) : projectSkills.length;
  const implementedPercentage = totalRequired > 0 ? (projectSkills.length / totalRequired) * 100 : 0;
  const requiredPercentage = totalRequired > 0 ? (futureSkills.length / totalRequired) * 100 : 0;

  // Color helpers
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-emerald-400";
    if (score >= 50) return "text-yellow-500";
    if (score >= 30) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return "bg-gradient-to-r from-green-600 to-green-500";
    if (score >= 70) return "bg-gradient-to-r from-emerald-600 to-emerald-500";
    if (score >= 50) return "bg-gradient-to-r from-yellow-600 to-yellow-500";
    if (score >= 30) return "bg-gradient-to-r from-orange-600 to-orange-500";
    return "bg-gradient-to-r from-red-600 to-red-500";
  };

  const getMatchQuality = (score) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 70) return "Very Good Match";
    if (score >= 50) return "Good Match";
    if (score >= 30) return "Fair Match";
    if (score >= 10) return "Poor Match";
    return "Very Poor Match";
  };

  return (
    <div className="w-full mt-8 space-y-6">
      {/* Main Header Card */}
      <div className={`${getScoreBgColor(jobMatchScore)} rounded-2xl p-8 text-white shadow-2xl`}>
        <div className="text-center">
          <p className="text-sm font-semibold opacity-90 mb-2">JOB MATCH SCORE</p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-6xl font-black">{jobMatchScore.toFixed(0)}%</div>
            <div className="text-2xl font-bold opacity-80">/100</div>
          </div>
          <p className="text-lg font-semibold mb-4">{getMatchQuality(jobMatchScore)}</p>
          
          {/* Quality indicator */}
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full ${
                  i < Math.ceil(jobMatchScore / 20)
                    ? "bg-white w-12"
                    : "bg-white/20 w-12"
                }`}
              />
            ))}
          </div>

          {/* Status message */}
          {jobMatchScore >= 80 && (
            <p className="text-sm">✓ Strong candidate - apply now!</p>
          )}
          {jobMatchScore >= 60 && jobMatchScore < 80 && (
            <p className="text-sm">→ Good fit - highlight your relevant skills</p>
          )}
          {jobMatchScore >= 40 && jobMatchScore < 60 && (
            <p className="text-sm">⚠ Fair match - consider gaining more experience</p>
          )}
          {jobMatchScore < 40 && (
            <p className="text-sm">⚠ Skill gaps exist - focus on learning required skills</p>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-gray-700 overflow-x-auto">
        {["overview", "implemented", "required", "analysis", "transparency"].map((tab) => (
          <button
            key={tab}
            onClick={() => setExpandedTab(tab)}
            className={`px-6 py-3 font-semibold transition border-b-2 whitespace-nowrap ${
              expandedTab === tab
                ? "border-yellow-400 text-yellow-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab === "overview" && "Overview"}
            {tab === "implemented" && `✓ Implemented (${matchingSkills.length})`}
            {tab === "required" && `📚 Required (${resumeSkillsDetected.length}/${requiredSkillsFromJob.length})`}
            {tab === "analysis" && "Analysis"}
            {tab === "transparency" && "Transparency"}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {expandedTab === "overview" && (
        <div className="space-y-6">
          {/* Skills Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Implemented Skills Card */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-400 font-semibold">Skills You Have</h3>
                <div className="text-3xl">✓</div>
              </div>
              <p className="text-4xl font-black text-green-400 mb-2">{projectSkills.length}</p>
              <p className="text-sm text-gray-400">Matching job requirements</p>
            </div>

            {/* Missing Skills Card */}
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-2 border-orange-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-orange-400 font-semibold">Skills to Acquire</h3>
                <div className="text-3xl">📚</div>
              </div>
              <p className="text-4xl font-black text-orange-400 mb-2">{futureSkills.length}</p>
              <p className="text-sm text-gray-400">Not yet in your resume</p>
            </div>

            {/* Match Percentage Card */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-blue-400 font-semibold">Coverage</h3>
                <div className="text-3xl">📊</div>
              </div>
              <p className="text-4xl font-black text-blue-400 mb-2">{implementedPercentage.toFixed(0)}%</p>
              <p className="text-sm text-gray-400">Job requirements covered</p>
            </div>
          </div>

          {/* Horizontal Bar Chart */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Skills Breakdown</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-400 w-20">You Have</span>
                <div className="flex-1 bg-gray-800 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-full flex items-center justify-center transition-all duration-500"
                    style={{ width: `${implementedPercentage}%` }}
                  >
                    {implementedPercentage > 20 && (
                      <span className="text-white text-xs font-bold">
                        {projectSkills.length}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-400 w-12 text-right">
                  {implementedPercentage.toFixed(0)}%
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-400 w-20">To Learn</span>
                <div className="flex-1 bg-gray-800 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-full flex items-center justify-center transition-all duration-500"
                    style={{ width: `${requiredPercentage}%` }}
                  >
                    {requiredPercentage > 20 && (
                      <span className="text-white text-xs font-bold">
                        {futureSkills.length}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-orange-400 w-12 text-right">
                  {requiredPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Summary Text */}
          {analysis.summary && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-blue-400 font-semibold mb-3">📋 Summary</h3>
              <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
            </div>
          )}

          {/* Experience Alignment */}
          {analysis.experience_alignment && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-purple-400 font-semibold mb-3">💼 Experience Level Match</h3>
              <p className="text-gray-300">{analysis.experience_alignment}</p>
              {analysis.experience_level && (
                <p className="text-sm text-gray-400 mt-2">
                  Your Level: <span className="text-purple-300 font-semibold">{analysis.experience_level}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* IMPLEMENTED SKILLS TAB */}
      {expandedTab === "implemented" && (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">✓</span>
              Skills You Already Have ({projectSkills.length})
            </h3>
            
            {projectSkills.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {projectSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg p-3 text-center transition"
                  >
                    <p className="text-green-300 font-semibold text-sm">{skill}</p>
                    <p className="text-xs text-gray-400 mt-1">✓ Ready</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No matching skills identified</p>
            )}
          </div>
        </div>
      )}

      {/* REQUIRED SKILLS TAB */}
      {expandedTab === "required" && (
        <div className="space-y-6">
          {/* Section 1: Your Resume Skills */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">📄</span>
              Skills Found in Your Resume ({resumeSkillsDetected.length})
            </h3>
            
            {resumeSkillsDetected.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {resumeSkillsDetected.map((skill, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg p-3 text-center transition"
                  >
                    <p className="text-blue-300 font-semibold text-sm">{skill}</p>
                    <p className="text-xs text-gray-400 mt-1">Your Skill</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No skills detected in your resume</p>
            )}
          </div>

          {/* Section 2: Job Required Skills */}
          {requiredSkillsFromJob.length > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Skills Required by the Job ({requiredSkillsFromJob.length})
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {requiredSkillsFromJob.map((skill, idx) => {
                  const isMatched = matchingSkills.includes(skill);
                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg p-3 text-center transition ${
                        isMatched
                          ? "bg-green-500/20 border-green-500/50 hover:bg-green-500/30"
                          : "bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/30"
                      }`}
                    >
                      <p className={`font-semibold text-sm ${isMatched ? "text-green-300" : "text-orange-300"}`}>
                        {skill}
                      </p>
                      <p className={`text-xs mt-1 font-semibold ${isMatched ? "text-green-400" : "text-orange-400"}`}>
                        {isMatched ? "✓ You Have" : "✗ Missing"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Matching Skills */}
          {matchingSkills.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">✓</span>
                Skills You Have That Match the Job ({matchingSkills.length})
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {matchingSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg p-3 text-center transition"
                  >
                    <p className="text-green-300 font-semibold text-sm">{skill}</p>
                    <p className="text-xs text-gray-400 mt-1">✓ Ready</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Missing Skills */}
          {missingSkills.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
              <h3 className="text-orange-400 font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Skills You Need to Learn ({missingSkills.length})
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {missingSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg p-3 text-center transition"
                  >
                    <p className="text-orange-300 font-semibold text-sm">{skill}</p>
                    <p className="text-xs text-gray-400 mt-1">→ Learn</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-black/40 rounded-lg border border-orange-500/20">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-orange-400">💡 Recommendation:</span> Focus on learning these {missingSkills.length} skills to improve your match score.
                </p>
              </div>
            </div>
          )}

          {/* If no job description */}
          {requiredSkillsFromJob.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <h3 className="text-yellow-400 font-semibold mb-3">⚠️ No Job Description Provided</h3>
              <p className="text-gray-300">
                Add a job description to see which of your skills match the job requirements and what skills you need to learn.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ANALYSIS TAB */}
      {expandedTab === "analysis" && (
        <div className="space-y-6">
          {/* Match Quality Gauge */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-6">Detailed Match Analysis</h3>
            
            <div className="space-y-4">
              {/* Coverage Metric */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 font-medium">Skills Coverage</span>
                  <span className={`font-bold ${getScoreColor(implementedPercentage)}`}>
                    {implementedPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${getScoreBgColor(jobMatchScore)} transition-all duration-500`}
                    style={{ width: `${implementedPercentage}%` }}
                  />
                </div>
              </div>

              {/* Overall Match */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 font-medium">Overall Match</span>
                  <span className={`font-bold ${getScoreColor(jobMatchScore)}`}>
                    {jobMatchScore.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${getScoreBgColor(jobMatchScore)} transition-all duration-500`}
                    style={{ width: `${jobMatchScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
            <h3 className="text-indigo-400 font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Recommendations to Improve Match
            </h3>
            
            <div className="space-y-3">
              {jobMatchScore >= 90 && (
                <div className="flex gap-3 items-start p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-lg">✓</span>
                  <p className="text-sm text-gray-300">Perfect match! Your resume meets all job requirements. Apply immediately!</p>
                </div>
              )}
              
              {jobMatchScore >= 70 && jobMatchScore < 90 && (
                <div className="flex gap-3 items-start p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <span className="text-lg">✓</span>
                  <p className="text-sm text-gray-300">Excellent match! You have {projectSkills.length} out of required skills. Highlight these in your resume.</p>
                </div>
              )}

              {jobMatchScore >= 50 && jobMatchScore < 70 && (
                <div className="flex gap-3 items-start p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <span className="text-lg">→</span>
                  <p className="text-sm text-gray-300">Good foundation! You have {projectSkills.length} matching skills. Learning {futureSkills.length} more would strengthen your candidacy.</p>
                </div>
              )}

              {futureSkills.length > 0 && (
                <div className="flex gap-3 items-start p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <span className="text-lg">📚</span>
                  <p className="text-sm text-gray-300">Priority skills to learn: {futureSkills.slice(0, 3).join(", ")}{futureSkills.length > 3 ? ", and more" : ""}</p>
                </div>
              )}

              {jobMatchScore < 50 && (
                <div className="flex gap-3 items-start p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <span className="text-lg">⚠</span>
                  <p className="text-sm text-gray-300">Significant skill gaps ({futureSkills.length} required skills missing). Build experience in these areas first.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRANSPARENCY TAB - Show calculation audit trail */}
      {expandedTab === "transparency" && (
        <div className="space-y-6">
          {/* Calculation Method */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🔍</span>
              How We Calculate Your Match Score
            </h3>
            
            <div className="space-y-4 text-gray-300 text-sm">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="font-semibold text-white mb-2">✓ Algorithm: Exact Skill Matching</p>
                <p className="text-gray-400">No AI guessing or subjective scoring. Pure mathematics.</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="font-semibold text-white mb-2">Formula</p>
                <p className="font-mono bg-black/50 p-3 rounded text-yellow-300">
                  (Matching Skills / Required Skills) × 100
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="font-semibold text-white mb-3">Your Calculation</p>
                <div className="space-y-2 font-mono text-yellow-300">
                  <p>Required Skills: {analysis.future_skills_required?.length || 0} + {analysis.project_skills_implemented?.length || 0} = {(analysis.future_skills_required?.length || 0) + (analysis.project_skills_implemented?.length || 0)}</p>
                  <p>Matching Skills: {analysis.project_skills_implemented?.length || 0}</p>
                  <p>Formula: ({analysis.project_skills_implemented?.length || 0} ÷ {(analysis.future_skills_required?.length || 0) + (analysis.project_skills_implemented?.length || 0)}) × 100 = {jobMatchScore.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trustworthiness Indicators */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">✓</span>
              Why You Can Trust This Score
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="font-semibold text-white mb-2">Exact Matching</p>
                <p className="text-sm text-gray-400">Each skill verified against 60+ industry-standard skills database</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="font-semibold text-white mb-2">No False Positives</p>
                <p className="text-sm text-gray-400">Regex word boundaries prevent Java from matching JavaScript</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="font-semibold text-white mb-2">Reproducible</p>
                <p className="text-sm text-gray-400">Same resume + job description = Same score every time</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="font-semibold text-white mb-2">Transparent</p>
                <p className="text-sm text-gray-400">You can see exactly which skills matched and which didn't</p>
              </div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-purple-400 font-semibold mb-4">📊 Complete Breakdown</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-300 font-semibold mb-2">Your Resume Contains:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.project_skills_implemented?.length > 0 ? (
                    analysis.project_skills_implemented.map((skill, idx) => (
                      <span key={idx} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs border border-green-500/50">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No matching skills detected</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-gray-300 font-semibold mb-2">Job Requires:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.future_skills_required?.length > 0 ? (
                    analysis.future_skills_required.map((skill, idx) => (
                      <span key={idx} className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs border border-orange-500/50">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">All required skills matched!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
