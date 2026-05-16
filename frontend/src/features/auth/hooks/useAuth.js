import { useContext, useEffect } from "react";
import { AuthContext } from "../AuthContext";
import { login, register, logout, getMe } from "../../../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    // FIX: returns { success, error } so callers can react to result
    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return { success: true }
        } catch (error) {
            console.error("Login failed:", error)
            return { success: false, error: error?.message || "Login failed" }
        } finally {
            setLoading(false)
        }
    }

    // FIX: returns { success, error } so callers can react to result
    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return { success: true }
        } catch (error) {
            console.error("Register failed:", error)
            return { success: false, error: error?.message || "Registration failed" }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            return { success: true }
        } catch (error) {
            console.error("Logout failed:", error)
            return { success: false, error: error?.message || "Logout failed" }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (error) {
                // Not logged in — this is expected, not an error worth logging loudly
                setUser(null)
                console.log(error)
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()
    }, [setUser, setLoading])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}