import Navbar from "../components/Navbar";
import ResumeUpload from "../components/ResumeUpload";

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-16">
          {/* Header Section */}
          <div className="mb-16 text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
              AI Resume Analyzer
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Upload your resume and get instant AI-powered analysis. Improve your
              chances with professional insights and recommendations.
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-yellow-500/20 p-8 mb-12 shadow-2xl">
            <ResumeUpload />
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/40 backdrop-blur-md border border-yellow-500/20 p-6 rounded-xl hover:border-yellow-500/50 hover:bg-black/50 transition group">
              <div className="text-3xl mb-4 text-yellow-400 group-hover:scale-110 transition">⚡</div>
              <h3 className="font-bold text-white mb-2 group-hover:text-yellow-400 transition">
                Instant Analysis
              </h3>
              <p className="text-gray-400 text-sm">
                Get comprehensive feedback on your resume in seconds
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-yellow-500/20 p-6 rounded-xl hover:border-yellow-500/50 hover:bg-black/50 transition group">
              <div className="text-3xl mb-4 text-yellow-400 group-hover:scale-110 transition">⚙️</div>
              <h3 className="font-bold text-white mb-2 group-hover:text-yellow-400 transition">
                Smart Insights
              </h3>
              <p className="text-gray-400 text-sm">
                Receive actionable recommendations tailored to your profile
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-yellow-500/20 p-6 rounded-xl hover:border-yellow-500/50 hover:bg-black/50 transition group">
              <div className="text-3xl mb-4 text-yellow-400 group-hover:scale-110 transition">📈</div>
              <h3 className="font-bold text-white mb-2 group-hover:text-yellow-400 transition">
                Track Progress
              </h3>
              <p className="text-gray-400 text-sm">
                View your analysis history and monitor improvements over time
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
    