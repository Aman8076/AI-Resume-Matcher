import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function JobMatches() {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchJobs();

    }, []);

    const fetchJobs = async () => {

        try {

            const res = await API.get("/jobs/match");

            setJobs(res.data.bestMatches);

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to load job matches"
            );

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="text-center mt-20 text-2xl">

                Loading AI Job Matches...

            </div>

        );

    }

    return (

    <div className="min-h-screen bg-gray-100 p-10">

        <h1 className="text-4xl font-bold mb-8">
            AI Job Matches
        </h1>

        {/* Summary Cards */}

        {jobs.length > 0 && (

            <div className="grid md:grid-cols-3 gap-6 mb-10">

                <div className="bg-white rounded-xl shadow-lg p-6">

                    <h2 className="text-gray-500">
                        Total Matches
                    </h2>

                    <p className="text-4xl font-bold mt-2">
                        {jobs.length}
                    </p>

                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">

                    <h2 className="text-gray-500">
                        Best Match
                    </h2>

                    <p className="text-4xl font-bold text-green-600 mt-2">
                        {jobs[0].matchPercentage}%
                    </p>

                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">

                    <h2 className="text-gray-500">
                        Top Company
                    </h2>

                    <p className="text-xl font-bold mt-2">
                        {jobs[0].company}
                    </p>

                </div>

            </div>

        )}

        {jobs.length === 0 ? (

            <div className="bg-white rounded-xl shadow-lg p-8">

                No Job Matches Found

            </div>

        ) : (

            <div className="space-y-6">

                {jobs.map((job, index) => (

                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-lg p-6"
                    >

                        <div className="flex justify-between items-start">

                            <div>

                                <h2 className="text-2xl font-bold">

                                    {job.title}

                                </h2>

                                <p className="text-gray-500 mt-1">

                                    {job.company}

                                </p>

                                <p className="text-gray-500">

                                    {job.location}

                                </p>

                            </div>

                            {index === 0 && (

                                <span className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold">

                                    🏆 Best Match

                                </span>

                            )}

                        </div>

                        {/* Match Percentage */}

                        <div className="mt-6">

                            <div className="flex justify-between mb-2">

                                <span>Match Percentage</span>

                                <span className="font-bold">

                                    {job.matchPercentage}%

                                </span>

                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-4">

                                <div
                                    className={`h-4 rounded-full ${
                                        job.matchPercentage >= 80
                                            ? "bg-green-500"
                                            : job.matchPercentage >= 60
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                    }`}
                                    style={{
                                        width: `${job.matchPercentage}%`,
                                    }}
                                ></div>

                            </div>

                        </div>

                        {/* AI Reason */}

                        <div className="mt-6">

                            <h3 className="font-bold mb-2">

                                AI Recommendation

                            </h3>

                            <div className="bg-gray-100 rounded-lg p-4">

                                {job.reason}

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        )}

    </div>

);

}

export default JobMatches;