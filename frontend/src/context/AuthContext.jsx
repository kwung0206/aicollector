// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

/**
 * 백엔드 로그인 응답 형태를 통일해서
 * 항상 "유저 정보 객체"만 반환하도록 만드는 함수
 *
 * 기대하는 응답 예시:
 *   { token: "JWT...", user: { userId, nickname, email, profileImage, ... } }
 * 또는
 *   { userId, nickname, email, profileImage, token }
 */
const normalizeUser = (raw) => {
    if (!raw) return null;

    // 예전처럼 토큰 문자열만 저장돼 있던 값이면 "로그인 안 된 것"으로 취급
    if (typeof raw === "string") {
        return null;
    }

    // { token, user: {...} } 형태
    if (raw.user && typeof raw.user === "object") {
        return {
            ...raw.user,
            token: raw.token ?? raw.accessToken ?? null,
        };
    }

    // 이미 평평한 유저 객체라고 가정
    return raw;
};

// 로컬스토리지에서 초기 유저 읽기 (에러 처리 + normalize)
const readInitialUser = () => {
    if (typeof window === "undefined") return null;

    const saved = localStorage.getItem("aiCollectorUser");
    if (!saved) return null;

    try {
        const parsed = JSON.parse(saved);
        return normalizeUser(parsed);
    } catch (e) {
        console.error("파싱 오류, 저장된 로그인 정보를 초기화합니다.", e);
        localStorage.removeItem("aiCollectorUser");
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    // ✅ 마운트 시 한 번만 로컬스토리지에서 읽어옴
    const [user, setUser] = useState(readInitialUser);

    /**
     * loginResult 에는 "백엔드 로그인 응답 전체"를 넣어주면 됨
     * 예: { token, user: {...} } 또는 { userId, nickname, ... , token }
     */
    const login = (loginResult) => {
        const normalized = normalizeUser(loginResult);
        setUser(normalized);

        if (normalized) {
            localStorage.setItem("aiCollectorUser", JSON.stringify(normalized));
        } else {
            localStorage.removeItem("aiCollectorUser");
        }
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
