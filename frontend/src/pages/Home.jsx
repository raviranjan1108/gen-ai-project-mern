import { useAuth } from "../features/auth/hooks/useAuth"
import { useNavigate } from "react-router"
import { useEffect } from "react"

const Home = () => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate("/login")
        }
    }, [user, navigate])

    const handleLogoutClick = async () => {
        await handleLogout()
        navigate("/login")
    }

    return (
        <main>
            <div className="home-container">
                <h1>Welcome, {user?.username || "User"}!</h1>
                <p>Email: {user?.email}</p>
                <button onClick={handleLogoutClick} className="button primary-button">
                    Logout
                </button>
            </div>
        </main>
    )
}

export default Home
