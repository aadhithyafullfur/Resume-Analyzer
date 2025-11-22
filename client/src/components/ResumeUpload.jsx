import { useState } from "react";
import { mlApi } from "../services/api";
import Loader from "./Loader";
import PredictionCard from "./PredictionCard";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadResume = async () => {
    if (!file) return alert("Upload a file!");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await mlApi.post("/predict", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setResult(res.data);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 shadow rounded">
      <input
        type="file"
        className="border p-2"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 mt-3"
        onClick={uploadResume}
      >
        Analyze
      </button>

      {loading && <Loader />}
      {result && <PredictionCard data={result} />}
    </div>
  );
}
