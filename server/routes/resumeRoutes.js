const express = require("express");
const router = express.Router();

const multer = require("multer");

const {
    uploadResume,
    getMyResumes,
    getResumeById,
    deleteResume,
} = require("../controllers/resumeController");

const authMiddleware = require("../middleware/authMiddleware");

// Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({
    storage,
});

// Upload Resume
router.post(
    "/upload",
    authMiddleware,
    upload.single("resume"),
    uploadResume
);

// Get Logged-in User Resumes
router.get(
    "/my-resumes",
    authMiddleware,
    getMyResumes
);

// Get Resume By ID
router.get(
    "/:id",
    authMiddleware,
    getResumeById
);

// Delete Resume
router.delete(
    "/:id",
    authMiddleware,
    deleteResume
);

module.exports = router;