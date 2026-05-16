const mongoose = require("mongoose")


const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "technical question is required"]
    },
    intension: {
        type: String,
        required: [true, "intension is required"]
    },
    answer: {
        type: String,
        required: [true, "answer is required"]
    }
}, {
    _id: false
})




const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "behavioral question is required"]
    },
    intension: {
        type: String,
        required: [true, "intension is required"]
    },
    answer: {
        type: String,
        required: [true, "answer is required"]
    }
}, {
    _id: false
})


const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "skill is required"]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "severity is required"]
    }
}, {
    _id: false
})


const preparationSchema = new mongoose.Schema({
    day: {
        type: String,
        required: [true, "day is required"]
    },
    focus: {
        type: String,
        required: [true, "focus is required"]
    },
    tasks: {
        type: [String],
        required: [true, "tasks is required"]
    }
}, {
    _id: false
})


const interviewReportSchema = new mongoose.Schema({

    jobDescription: {
        type: String,
        required: [true, "job description is required"]
    },

    resume: {
        type: String,
    },

    selfDescription: {
        type: String,
    },

    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },

    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    title: {
        type: String,
        required: [true, "title is required"]
    }
}, {
    timestamps: true
});


const InterviewReportModel = mongoose.model("InterviewReport", interviewReportSchema)

module.exports = InterviewReportModel;