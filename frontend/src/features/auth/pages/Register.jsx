import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from '../hooks/useAuth'
import "../auth.form.scss"

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")  // FIX: was undefined (no initial value)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    // FIX: added error state for user feedback
    const [error, setError] = useState("")

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        const result = await handleRegister({ username, email, password })
        // FIX: was navigating unconditionally — now only navigates on success
        if (result?.success) {
            navigate("/")
        } else {
            setError(result?.error || "Registration failed. Please try again.")
        }
    }

    if (loading) {
        return (<main><h1>Loading.....</h1></main>)
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>

                {/* FIX: display error message */}
                {error && (
                    <p style={{ color: "#f87171", fontSize: "0.85rem" }}>{error}</p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            type="text" id="username" name="username"
                            placeholder="enter your username"
                            required
                        />
                    </div>
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
                    <button className="button primary-button" type="submit">Register</button>
                </form>

                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </main>
    )
}

export default Register