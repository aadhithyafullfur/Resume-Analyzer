import { useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

export default function History() {
  const { user } = useAuth();
  const [analyses] = useState([]);
  const error = !user ? "Please log in to view your analysis history" : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-900">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-3">
              Analysis History
            </h1>
            <p className="text-gray-400 text-lg">
              View all your resume analyses and insights
            </p>
          </div>

          {/* Content */}
          {error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          ) : analyses.length === 0 ? (
            <div className="bg-black/30 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4 text-yellow-400">📊</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No analyses yet
              </h2>
              <p className="text-gray-400 mb-6">
                Start by uploading your resume on the dashboard to see your analysis history here
              </p>
              <a
                href="/"
                className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-3 px-8 rounded-lg transition shadow-lg hover:shadow-yellow-500/50"
              >
                Go to Dashboard
              </a>
            </div>
          ) : (
            <div className="grid gap-6">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="bg-black/30 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {analysis.fileName}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-semibold text-lg">
                        {analysis.score}%
                      </p>
                      <p className="text-gray-500 text-sm">Match Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Category</p>
                      <p className="text-white font-semibold">
                        {analysis.category}
                      </p>
                    </div>
                    <div className="bg-black/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Skills Found</p>
                      <p className="text-white font-semibold">
                        {analysis.skillsCount}
                      </p>
                    </div>
                  </div>

                  <button className="w-full text-yellow-400 hover:text-yellow-300 font-semibold transition py-2">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
