import { useRouteError, useNavigate } from "react-router"

const ErrorPage = () => {
    const error = useRouteError()
    const navigate = useNavigate()

    return (
        <main>
            <div className="error-container" style={{ textAlign: "center", padding: "50px" }}>
                <h1>Oops! Something went wrong</h1>
                <p style={{ fontSize: "18px", color: "#666" }}>
                    {error?.status === 404 ? "Page not found" : "An unexpected error occurred"}
                </p>
                <p style={{ color: "#999" }}>
                    {error?.statusText || error?.message || "Please try again later"}
                </p>
                <button
                    onClick={() => navigate("/login")}
                    className="button primary-button"
                    style={{ marginTop: "20px" }}
                >
                    Go to Login
                </button>
            </div>
        </main>
    )
}

export default ErrorPage
