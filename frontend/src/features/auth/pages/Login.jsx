import "../auth.form.scss"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useState } from "react"

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    // FIX: added error state to show feedback to user
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        const result = await handleLogin({ email, password })
        // FIX: result.success now actually works since handleLogin returns it
        if (result?.success) {
            navigate('/')
        } else {
            setError(result?.error || "Login failed. Please try again.")
        }
    }

    if (loading) {
        return (<main><h1>Loading.....</h1></main>)
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>

                {/* FIX: display error message */}
                {error && (
                    <p style={{ color: "#f87171", fontSize: "0.85rem" }}>{error}</p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" id="email" name="email"
                            placeholder="enter your email"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" id="password" name="password"
                            placeholder="enter your password"
                            required
                        />
                    </div>
                    <button className="button primary-button" type="submit">Login</button>
                </form>

                <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
        </main>
    )
}

export default Login