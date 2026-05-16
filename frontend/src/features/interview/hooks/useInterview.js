import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../../../services/interview.api.js"
import { useContext, useCallback } from "react"
import { InterviewContext } from "../interview.context.js"

export const useInterview = () => {
    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.data)
            return { success: true, data: response.data }
        } catch (error) {
            console.error("Generate report failed:", error)
            return { success: false, error: error?.message || "Failed to generate report" }
        } finally {
            setLoading(false)
        }
    }

    const getReportById = useCallback(async (id) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(id)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error("Get report failed:", error)
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReport])

    const getReports = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            console.error("Get reports failed:", error)
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReports])

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Get resume PDF failed:", error)
        } finally {
            setLoading(false)
        }
    }

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }
}