import Navbar from "../components/Navbar";
import ResumeUpload from "../components/ResumeUpload";

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <div className="p-8 max-w-2xl mx-auto">
        <ResumeUpload />
      </div>
    </>
  );
}
    