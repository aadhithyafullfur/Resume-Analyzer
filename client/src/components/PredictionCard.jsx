import { useState } from "react";

export default function PredictionCard({ data }) {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!data) {
    return null;
  }

  // Get match score from different possible sources
  const jobMatchScore = data.job_match_score || data.analysis?.skill_match_score || 0;
  const matchColorClass = 
    jobMatchScore >= 75 ? "text-green-500" : 
    jobMatchScore >= 50 ? "text-yellow-500" : 
    "text-red-500";

  // Get analysis data
  const analysis = data.analysis || {};
  const openaiData = data.openai_analysis || {};
  const hasOpenAI = !openaiData.error && Object.keys(openaiData).length > 0;

  // Get skills from analysis
  const projectSkills = analysis.project_skills_implemented || [];
  const futureSkills = analysis.future_skills_required || [];

  return (
    <div className="w-full mt-8 space-y-6">
      {/* Main Match Score Card */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-2 border-yellow-500/30 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Resume Analysis Results</h2>
        
        {/* Large Match Score Display */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className={`text-7xl font-black ${matchColorClass} mb-2`}>
              {jobMatchScore.toFixed(1)}%
            </div>
            <p className="text-gray-300 text-lg">Skill Match Score</p>
          </div>
        </div>

        {/* Circular Progress Bar */}
        <div className="flex justify-center mb-8">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {/* Background circle */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="#404040" strokeWidth="12"/>
            {/* Progress circle */}
            <circle 
              cx="100" 
              cy="100" 
              r="90" 
              fill="none" 
              stroke="#FCD34D" 
              strokeWidth="12"
              strokeDasharray={`${(jobMatchScore / 100) * (2 * Math.PI * 90)} ${2 * Math.PI * 90}`}
              strokeLinecap="round"
              style={{transition: "stroke-dasharray 0.5s ease"}}
            />
            {/* Center text */}
            <text x="100" y="115" textAnchor="middle" className="text-2xl font-bold fill-white">
              {jobMatchScore.toFixed(0)}%
            </text>
          </svg>
        </div>

        {/* Experience Alignment */}
        {analysis.experience_alignment && (
          <div className="text-center mb-6">
            <p className="text-gray-300">
              <span className="font-semibold text-yellow-400">Experience Level:</span> {analysis.experience_alignment}
            </p>
          </div>
        )}

        {/* Skills Distribution */}
        {(projectSkills.length > 0 || futureSkills.length > 0) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/40 rounded-lg p-4 border border-green-500/30">
              <p className="text-gray-400 text-sm mb-1">Project Skills</p>
              <p className="text-3xl font-bold text-green-400">{projectSkills.length}</p>
            </div>
            <div className="bg-black/40 rounded-lg p-4 border border-orange-500/30">
              <p className="text-gray-400 text-sm mb-1">Skills to Learn</p>
              <p className="text-3xl font-bold text-orange-400">{futureSkills.length}</p>
            </div>
          </div>
        )}

        {/* Skills Distribution Bar Chart */}
        {(projectSkills.length > 0 || futureSkills.length > 0) && (
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Skills Overview</h3>
            <div className="flex gap-2 h-8 rounded-lg overflow-hidden bg-gray-800">
              {projectSkills.length > 0 && (
                <div
                  className="bg-green-500 transition-all duration-300"
                  style={{width: `${(projectSkills.length / (projectSkills.length + futureSkills.length)) * 100}%`}}
                  title={`${projectSkills.length} implemented`}
                />
              )}
              {futureSkills.length > 0 && (
                <div
                  className="bg-orange-500 transition-all duration-300"
                  style={{width: `${(futureSkills.length / (projectSkills.length + futureSkills.length)) * 100}%`}}
                  title={`${futureSkills.length} to learn`}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>✓ Implemented: {projectSkills.length}</span>
              <span>○ To Learn: {futureSkills.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Project Skills Implemented */}
      {projectSkills.length > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <button
            onClick={() => setExpandedSection(expandedSection === "projectSkills" ? null : "projectSkills")}
            className="flex justify-between items-center w-full text-white font-semibold mb-4 hover:text-green-400 transition"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              ✓ Project Skills Implemented ({projectSkills.length})
            </span>
            <svg className={`w-5 h-5 transition-transform ${expandedSection === "projectSkills" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          {expandedSection === "projectSkills" && (
            <div className="flex flex-wrap gap-2">
              {projectSkills.map((skill, idx) => (
                <span key={idx} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Future Skills Required */}
      {futureSkills.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
          <button
            onClick={() => setExpandedSection(expandedSection === "futureSkills" ? null : "futureSkills")}
            className="flex justify-between items-center w-full text-white font-semibold mb-4 hover:text-orange-400 transition"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              📚 Skills to Learn ({futureSkills.length})
            </span>
            <svg className={`w-5 h-5 transition-transform ${expandedSection === "futureSkills" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          {expandedSection === "futureSkills" && (
            <div className="flex flex-wrap gap-2">
              {futureSkills.map((skill, idx) => (
                <span key={idx} className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {analysis.summary && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Summary
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
        </div>
      )}

      {/* OpenAI Analysis Section */}
      {hasOpenAI && (
        <div className="space-y-4">
          {/* Summary */}
          {openaiData.summary && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                AI Summary
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">{openaiData.summary}</p>
            </div>
          )}

          {/* Experience Level */}
          {openaiData.experience_level && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Experience Level</h3>
              <div className="text-3xl font-bold text-purple-400">{openaiData.experience_level}</div>
            </div>
          )}

          {/* Strengths */}
          {openaiData.strengths && Array.isArray(openaiData.strengths) && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <button
                onClick={() => setExpandedSection(expandedSection === "strengths" ? null : "strengths")}
                className="flex justify-between items-center w-full text-white font-semibold mb-4 hover:text-green-400 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Strengths
                </span>
                <svg className={`w-5 h-5 transition-transform ${expandedSection === "strengths" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {expandedSection === "strengths" && (
                <ul className="space-y-2">
                  {openaiData.strengths.map((strength, idx) => (
                    <li key={idx} className="text-green-300 text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Weaknesses */}
          {openaiData.weaknesses && Array.isArray(openaiData.weaknesses) && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
              <button
                onClick={() => setExpandedSection(expandedSection === "weaknesses" ? null : "weaknesses")}
                className="flex justify-between items-center w-full text-white font-semibold mb-4 hover:text-orange-400 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Areas for Improvement
                </span>
                <svg className={`w-5 h-5 transition-transform ${expandedSection === "weaknesses" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {expandedSection === "weaknesses" && (
                <ul className="space-y-2">
                  {openaiData.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-orange-300 text-sm flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Recommendations */}
          {openaiData.recommendations && Array.isArray(openaiData.recommendations) && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6">
              <button
                onClick={() => setExpandedSection(expandedSection === "recommendations" ? null : "recommendations")}
                className="flex justify-between items-center w-full text-white font-semibold mb-4 hover:text-cyan-400 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                  Recommendations
                </span>
                <svg className={`w-5 h-5 transition-transform ${expandedSection === "recommendations" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {expandedSection === "recommendations" && (
                <ul className="space-y-2">
                  {openaiData.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-cyan-300 text-sm flex items-start gap-2">
                      <span className="text-cyan-500 mt-1">{idx + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Soft Skills */}
          {openaiData.soft_skills && Array.isArray(openaiData.soft_skills) && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Soft Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {openaiData.soft_skills.map((skill, idx) => (
                  <span key={idx} className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm border border-indigo-500/50">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technical Skills */}
          {openaiData.technical_skills && Array.isArray(openaiData.technical_skills) && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {openaiData.technical_skills.map((skill, idx) => (
                  <span key={idx} className="bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-sm border border-rose-500/50">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Match Analysis */}
          {openaiData.job_match_analysis && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
              <button
                onClick={() => setExpandedSection(expandedSection === "jobmatch" ? null : "jobmatch")}
                className="flex justify-between items-center w-full text-white font-semibold mb-4 hover:text-yellow-400 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Job Match Analysis
                </span>
                <svg className={`w-5 h-5 transition-transform ${expandedSection === "jobmatch" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {expandedSection === "jobmatch" && (
                <p className="text-gray-300 text-sm leading-relaxed">{openaiData.job_match_analysis}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Matched Skills Section */}
      {data.matched_skills && data.matched_skills.length > 0 && (
        <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-6">
          <button
            onClick={() => setExpandedSection(expandedSection === "matched" ? null : "matched")}
            className="flex justify-between items-center w-full text-white font-semibold mb-4 hover:text-yellow-400 transition"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Matched Skills ({data.matched_skills.length})
            </span>
            <svg className={`w-5 h-5 transition-transform ${expandedSection === "matched" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          {expandedSection === "matched" && (
            <div className="flex flex-wrap gap-2">
              {data.matched_skills.map((skill, idx) => (
                <span key={idx} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/50">
                  ✓ {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Predictions */}
      <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-6">
        <button
          onClick={() => setExpandedSection(expandedSection === "category" ? null : "category")}
          className="flex justify-between items-center w-full text-white font-semibold mb-4 hover:text-yellow-400 transition"
        >
          <span>Category Classification</span>
          <svg className={`w-5 h-5 transition-transform ${expandedSection === "category" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
        {expandedSection === "category" && (
          <div className="space-y-3">
            {data.category_tfidf && (
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>TF-IDF Model</span>
                  <span className="text-yellow-400 font-semibold">{data.category_tfidf_conf}%</span>
                </div>
                <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-yellow-500 h-full" style={{width: `${data.category_tfidf_conf}%`}} />
                </div>
                <p className="text-sm text-gray-400 mt-1">{data.category_tfidf}</p>
              </div>
            )}
            {data.category_lstm_conf && (
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>LSTM Model</span>
                  <span className="text-yellow-400 font-semibold">{data.category_lstm_conf}%</span>
                </div>
                <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-yellow-500 h-full" style={{width: `${data.category_lstm_conf}%`}} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skill Type Predictions */}
      <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-6">
        <button
          onClick={() => setExpandedSection(expandedSection === "skilltype" ? null : "skilltype")}
          className="flex justify-between items-center w-full text-white font-semibold mb-4 hover:text-yellow-400 transition"
        >
          <span>Skill Type Classification</span>
          <svg className={`w-5 h-5 transition-transform ${expandedSection === "skilltype" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
        {expandedSection === "skilltype" && (
          <div className="space-y-3">
            {data.skill_type_tfidf && (
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>TF-IDF Model</span>
                  <span className="text-yellow-400 font-semibold">{data.skill_type_tfidf_conf}%</span>
                </div>
                <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-yellow-500 h-full" style={{width: `${data.skill_type_tfidf_conf}%`}} />
                </div>
                <p className="text-sm text-gray-400 mt-1">{data.skill_type_tfidf}</p>
              </div>
            )}
            {data.skill_type_lstm_conf && (
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>LSTM Model</span>
                  <span className="text-yellow-400 font-semibold">{data.skill_type_lstm_conf}%</span>
                </div>
                <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-yellow-500 h-full" style={{width: `${data.skill_type_lstm_conf}%`}} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Found Skills List */}
      {data.skills_found && data.skills_found.length > 0 && (
        <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-6">
          <button
            onClick={() => setExpandedSection(expandedSection === "allskills" ? null : "allskills")}
            className="flex justify-between items-center w-full text-white font-semibold mb-4 hover:text-yellow-400 transition"
          >
            <span>All Skills Found ({data.skills_found.length})</span>
            <svg className={`w-5 h-5 transition-transform ${expandedSection === "allskills" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          {expandedSection === "allskills" && (
            <div className="flex flex-wrap gap-2">
              {data.skills_found.map((skill, idx) => (
                <span key={idx} className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm border border-yellow-500/30">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resume Filename */}
      {data.filename && (
        <div className="text-gray-400 text-sm text-center pt-4 border-t border-yellow-500/20">
          Analyzed: {data.filename}
        </div>
      )}
    </div>
  );
}
