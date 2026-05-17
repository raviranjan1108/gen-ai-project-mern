const { Mistral } = require("@mistralai/mistralai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const PDFDocument = require("pdfkit");

const client = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY,
    timeout: 60000,
});

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100)
        .describe("A score indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("A technical question that can be asked in the interview"),
        intension: z.string().describe("The intension of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take"),
    })).describe("List of technical questions that can be asked in the interview"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("A behavioral question that can be asked in the interview"),
        intension: z.string().describe("The intension of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take"),
    })).describe("List of behavioral questions that can be asked in the interview"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill in which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap"),
    })).describe("List of skill gaps the candidate needs to work on"),
    preparationPlan: z.array(z.object({
        day: z.string().describe("The day of the preparation plan, e.g. Day 1"),
        focus: z.string().describe("The main focus for that day"),
        tasks: z.array(z.string()).describe("List of specific tasks the candidate should do that day"),
    })).describe("A day-wise preparation plan for the candidate"),
    title: z.string().describe("A concise title for the interview report, summarizing the candidate's overall fit for the job"),
});

async function generateInterviewReport({ resume, jobDescription, selfDescription }) {
    try {
        if (!resume || !jobDescription) {
            throw new Error("Resume and job description are required");
        }

        const prompt = `You are an interview preparation expert. Generate a concise interview report in JSON format.

Resume: ${resume}
Job: ${jobDescription}
Candidate Info: ${selfDescription}

Provide:
1. title: A concise title summarizing the candidate's fit for the job (e.g. "Senior React Developer - Strong Match")
2. matchScore (0-100): How well resume matches job
3. technicalQuestions (3-4 questions): Key technical questions. Format: [{question, intension, answer}]
4. behavioralQuestions (2-3 questions): Behavioral questions. Format: [{question, intension, answer}]
5. skillGaps (2-3 items): Missing skills. Format: [{skill, severity: 'low'|'medium'|'high'}]
6. preparationPlan (3-5 days): Prep schedule. Format: [{day: 'Day 1', focus: 'focus area', tasks: ['task1', 'task2', 'task3']}]

For tasks, provide an array of strings, not a single string. Be specific and practical.`;

        const jsonSchema = zodToJsonSchema(interviewReportSchema);

        const response = await client.chat.complete({
            model: "mistral-small-latest",
            messages: [{ role: "user", content: prompt }],
            responseFormat: {
                type: "json_schema",
                jsonSchema: {
                    name: "interviewReport",
                    schemaDefinition: jsonSchema,
                },
            },
        });

        const rawContent = response.choices?.[0]?.message?.content;

        if (!rawContent) {
            throw new Error("Empty response received from AI model");
        }

        return JSON.parse(rawContent);
    } catch (error) {
        console.error("Error generating interview report from AI:", error);
        throw new Error(`AI service error: ${error.message}`);
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    try {
        if (!resume) {
            throw new Error("Resume is required to generate PDF");
        }

        const prompt = `Generate a professional, well-formatted HTML resume.
Return ONLY a valid JSON object with a single key "html" containing complete self-contained HTML with inline CSS.
Do NOT add any explanation, markdown, or backticks. Just raw JSON.

Example format:
{"html": "<html>...</html>"}

Resume: ${resume}
Candidate Info: ${selfDescription || "Not provided"}
Job Description: ${jobDescription || "Not provided"}

Make the resume clean, professional, and ATS-friendly.`;

        const response = await client.chat.complete({
            model: "mistral-small-latest",
            messages: [{ role: "user", content: prompt }],
            responseFormat: {
                type: "json_object",
            },
        });

        const rawContent = response.choices?.[0]?.message?.content;

        if (!rawContent) {
            throw new Error("Empty response received from AI model");
        }

        const cleaned = rawContent.replace(/```json|```/g, "").trim();
        const jsonContent = JSON.parse(cleaned);

        const html = jsonContent.html || jsonContent.resume?.html;

        if (!html) {
            throw new Error("AI did not return valid HTML content");
        }

        const pdfBuffer = await generatePdfFromHtml(html);
        return pdfBuffer;

    } catch (error) {
        console.error("Error generating resume PDF from AI:", error);
        throw new Error(`AI service error: ${error.message}`);
    }
}

// FIX: replaced puppeteer/html-pdf-node with pdfkit
// pdfkit does not require Chrome — works perfectly on Render free tier
async function generatePdfFromHtml(htmlContent) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        // Strip HTML tags and get clean plain text
        const text = htmlContent
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<[^>]+>/g, "\n")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        doc.fontSize(11).text(text, { align: "left" });
        doc.end();
    });
}

module.exports = { generateInterviewReport, generateResumePdf, generatePdfFromHtml };