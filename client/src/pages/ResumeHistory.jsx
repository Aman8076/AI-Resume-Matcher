import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function ResumeHistory() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await API.get("/resume/my-resumes");
      setResumes(res.data.resumes);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  // Delete Resume
  const handleDelete = async (id) => {
    try {
      await API.delete(`/resume/${id}`);

      toast.success("Resume deleted successfully");

      // Refresh resume list
      fetchResumes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-2xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-8">Resume History</h1>

      {resumes.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow">
          No resumes uploaded yet.
        </div>
      ) : (
        <div className="space-y-6">
          {resumes.map((resume) => (
            <div key={resume._id} className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold">
                {resume.filename}
              </h2>

              <p className="mt-3">
                <strong>ATS Score:</strong>{" "}
                <span className="text-green-600 font-bold">
                  {resume.atsScore}/100
                </span>
              </p>

              <p className="mt-2">
                <strong>Uploaded:</strong>{" "}
                {new Date(resume.uploadedAt).toLocaleString()}
              </p>

              <div className="mt-5">
                <h3 className="font-bold text-lg mb-2">
                  AI Analysis
                </h3>

                <div className="bg-gray-100 rounded-lg p-4 whitespace-pre-wrap">
                  {resume.analysis}
                </div>
              </div>

              <button
                onClick={() => handleDelete(resume._id)}
                className="mt-5 bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 transition"
              >
                Delete Resume
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumeHistory;