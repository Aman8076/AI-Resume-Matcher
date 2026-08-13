const Job = require("../models/Job");
const Resume = require("../models/Resume");
const ai = require("../config/gemini");

// =========================
// Create Job
// =========================
const createJob = async (req, res) => {
    try {

        const {
            title,
            company,
            location,
            description,
            skills,
        } = req.body;

        const job = new Job({
            title,
            company,
            location,
            description,
            skills,
        });

        await job.save();

        res.status(201).json({
            success: true,
            message: "Job Created Successfully",
            job,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// =========================
// Get All Jobs
// =========================
const getAllJobs = async (req, res) => {
    try {

        const jobs = await Job.find().sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// =========================
// Get Job By ID
// =========================
const getJobById = async (req, res) => {
    try {

        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        res.status(200).json({
            success: true,
            job,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// =========================
// Match Resume With Jobs
// =========================
const matchJobs = async (req, res) => {
    try {

        // Find latest resume of logged-in user
        const resume = await Resume.findOne({
            user: req.user.id,
        }).sort({
            uploadedAt: -1,
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Please upload a resume first.",
            });
        }


        // Get all jobs
        const jobs = await Job.find();

        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No jobs available.",
            });
        }


        // Prepare jobs data for Gemini
        const jobsData = jobs.map((job) => ({
            jobId: job._id.toString(),
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            skills: job.skills,
        }));


        // =========================
        // ONE GEMINI REQUEST
        // =========================

        const prompt = `
You are an ATS Resume Matcher.

Analyze the resume and compare it with ALL jobs.

RESUME:
${JSON.stringify(resume.parsedData)}

JOBS:
${JSON.stringify(jobsData)}

For every job calculate a match percentage from 0 to 100.

Consider:

1. Technical skills
2. Required skills
3. Experience
4. Job requirements
5. Resume strengths
6. Overall suitability

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT use \`\`\`json.
Do NOT include any explanation outside JSON.

Use exactly this structure:

{
    "matches": [
        {
            "jobId": "job id",
            "matchPercentage": 90,
            "reason": "Short explanation of why the candidate matches this job."
        }
    ]
}
`;


        // Call Gemini only ONCE
        const result = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
        });


        const aiResponse =
            result.text ||
            result.response?.text() ||
            "";


        if (!aiResponse) {
            return res.status(500).json({
                success: false,
                message: "Empty response from Gemini.",
            });
        }


        // =========================
        // Parse Gemini Response
        // =========================

        let parsedResponse;

        try {

            parsedResponse = JSON.parse(aiResponse);

        } catch (error) {

            console.log("Gemini Raw Response:");
            console.log(aiResponse);

            return res.status(500).json({
                success: false,
                message: "Unable to parse AI response.",
            });

        }


        // Check matches
        if (
            !parsedResponse.matches ||
            !Array.isArray(parsedResponse.matches)
        ) {

            return res.status(500).json({
                success: false,
                message: "Invalid AI response format.",
            });

        }


        // =========================
        // Combine AI Results
        // With Job Information
        // =========================

        const matchedJobs = parsedResponse.matches
            .map((match) => {

                const job = jobs.find(
                    (job) =>
                        job._id.toString() ===
                        String(match.jobId)
                );


                // If Gemini returns invalid job ID
                if (!job) {
                    return null;
                }


                return {

                    jobId: job._id,

                    title: job.title,

                    company: job.company,

                    location: job.location,

                    matchPercentage: Math.min(
                        100,
                        Math.max(
                            0,
                            Number(match.matchPercentage) || 0
                        )
                    ),

                    reason:
                        match.reason ||
                        "No reason provided.",

                };

            })
            .filter(Boolean);


        // =========================
        // Sort By Match Percentage
        // =========================

        matchedJobs.sort((a, b) => {

            return (
                b.matchPercentage -
                a.matchPercentage
            );

        });


        // =========================
        // Final Response
        // =========================

        res.status(200).json({

            success: true,

            totalMatches:
                matchedJobs.length,

            bestMatches:
                matchedJobs.slice(0, 5),

        });


    } catch (error) {

        console.error("Job Matching Error:");
        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }
};


// =========================
// Export Controllers
// =========================

module.exports = {

    createJob,

    getAllJobs,

    getJobById,

    matchJobs,

};