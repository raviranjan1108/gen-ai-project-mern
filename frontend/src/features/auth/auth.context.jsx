import { useState } from 'react';
import { AuthContext } from './AuthContext';

// FIX: AuthProvider only manages state.
// getMe is called inside useAuth's useEffect — no need to duplicate it here.
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}