// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // 새로고침해도 유지용 (로컬스토리지에서 불러오기)
    useEffect(() => {
        const saved = localStorage.getItem("aiCollectorUser");
        if (saved) {
            try {
                setUser(JSON.parse(saved));
            } catch (e) {
                console.error("파싱 오류, 저장된 로그인 정보를 초기화합니다.", e);
                localStorage.removeItem("aiCollectorUser");
            }
        }
    }, []);

    const login = (userInfo) => {
        setUser(userInfo);
        localStorage.setItem("aiCollectorUser", JSON.stringify(userInfo));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("aiCollectorUser");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
