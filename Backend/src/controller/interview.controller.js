const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.services")
const InterviewReportModel = require("../models/interviewReport.model")

async function generateInterViewReportController(req, res) {
    try {
        const resumeFile = req.file;

        if (!resumeFile) {
            return res.status(400).json({
                message: "Resume file is required"
            })
        }

        const { selfDescription, jobDescription } = req.body

        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required"
            })
        }

        const resumeContent = await pdfParse(req.file.buffer)

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        })

        const interViewReport = new InterviewReportModel({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        })

        await interViewReport.save();

        return res.status(200).json({
            message: "Interview report generated successfully.",
            data: interViewReport,
        });
    } catch (error) {
        console.error("Error generating interview report:", error);

        if (error.message === "Only PDF files are allowed") {
            return res.status(400).json({
                message: "Only PDF files are allowed",
                error: error.message,
            });
        }

        if (error.message.includes("File too large")) {
            return res.status(400).json({
                message: "File size exceeds 3MB limit",
                error: error.message,
            });
        }

        return res.status(500).json({
            message: "Failed to generate interview report.",
            error: error.message,
        });
    }
}

async function getInterviewReportByIdController(req, res) {
    // FIX: added try/catch to handle DB errors gracefully
    try {
        const { interviewId } = req.params

        const interviewReport = await InterviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully",
            interviewReport
        })
    } catch (error) {
        console.error("Error fetching interview report:", error);
        return res.status(500).json({
            message: "Failed to fetch interview report.",
            error: error.message,
        });
    }
}

async function getAllInterviewReportsController(req, res) {
    // FIX: added try/catch to handle DB errors gracefully
    try {
        const interviewReports = await InterviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            // FIX: was "-_v", correct Mongoose version key is "-__v"
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully",
            interviewReports
        })
    } catch (error) {
        console.error("Error fetching interview reports:", error);
        return res.status(500).json({
            message: "Failed to fetch interview reports.",
            error: error.message,
        });
    }
}

async function generateResumePdfController(req, res) {
    // FIX: added try/catch to handle AI/Puppeteer errors gracefully
    try {
        const { interViewReportId } = req.params

        const interviewReport = await InterviewReportModel.findOne({
            _id: interViewReportId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            })
        }

        const { resume, selfDescription, jobDescription } = interviewReport
        const pdfBuffer = await generateResumePdf({ resume, selfDescription, jobDescription })


        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interViewReportId}.pdf`,
        })

        res.send(pdfBuffer)
    } catch (error) {
        console.error("Error generating resume PDF:", error);
        return res.status(500).json({
            message: "Failed to generate resume PDF.",
            error: error.message,
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}