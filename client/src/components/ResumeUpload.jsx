import { useState } from "react";
import { mlApi } from "../services/api";
import Loader from "./Loader";
import PredictionCard from "./PredictionCard";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [jobDescription, setJobDescription] = useState("");

  const uploadResume = async () => {
    if (!file) {
      setError("Please select a file to analyze");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      const res = await mlApi.post("/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to analyze resume. Please try again.";
      setError(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer flex flex-col h-[600px] ${
          dragActive
            ? "border-yellow-400 bg-yellow-500/10"
            : "border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/5"
        }`}
      >
        {/* Resume Upload Section - Top */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-5xl mb-4 text-yellow-400">📄</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Upload Your Resume
          </h3>
          <p className="text-gray-400 mb-6">
            Drag and drop your file or click to browse (PDF, DOCX, TXT)
          </p>

          <label className="inline-block">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                  setError(null);
                }
              }}
            />
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-8 py-3 rounded-lg font-semibold transition cursor-pointer inline-block shadow-lg hover:shadow-yellow-500/50">
              Choose File
            </span>
          </label>

          {file && (
            <div className="mt-4 text-sm text-yellow-400 font-medium">
              Selected: {file.name}
            </div>
          )}
        </div>

        {/* Job Description Chat - Bottom */}
        <div className="border-t border-yellow-500/30 pt-6">
          <div className="flex flex-col h-32 bg-black/40 rounded-lg border border-yellow-500/20 overflow-hidden">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here for better analysis..."
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 p-4 resize-none focus:outline-none border-none"
            />
            <div className="border-t border-yellow-500/20 px-4 py-2 flex items-center justify-between bg-black/60">
              <span className="text-xs text-gray-500">
                {jobDescription.length} characters
              </span>
              <span className="text-xs text-gray-500">Enter job description for enhanced matching</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 font-medium">Error: {error}</p>
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={uploadResume}
        disabled={loading || !file}
        className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition shadow-lg hover:shadow-yellow-500/50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Analyzing Resume...
          </span>
        ) : (
          "Analyze Resume"
        )}
      </button>

      {/* Results */}
      {loading && <Loader />}
      {result && <PredictionCard data={result} />}
    </div>
  );
}
