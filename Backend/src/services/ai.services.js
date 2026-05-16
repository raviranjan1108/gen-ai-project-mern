const { Mistral } = require("@mistralai/mistralai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

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
            // FIX: json_object use karo instead of json_schema
            // json_schema HTML jaisi badi content ko truncate kar deta tha
            responseFormat: {
                type: "json_object",
            },
        });

        const rawContent = response.choices?.[0]?.message?.content;

        if (!rawContent) {
            throw new Error("Empty response received from AI model");
        }

        // FIX: strip markdown backticks before parsing
        const cleaned = rawContent.replace(/```json|```/g, "").trim();
        const jsonContent = JSON.parse(cleaned);

        // FIX: AI kabhi {"html": "..."} deta hai, kabhi {"resume": {"html": "..."}}
        // dono cases handle karo
        const html = jsonContent.html || jsonContent.resume?.html

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

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
    });

    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20px",
                bottom: "20px",
                left: "20px",
                right: "20px",
            },
        });

        return pdf;
    } finally {
        await browser.close();
    }
}

module.exports = { generateInterviewReport, generateResumePdf, generatePdfFromHtml };