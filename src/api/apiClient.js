// src/api/apiClient.js
import axios from "axios";

// ✅ Vite에서는 이렇게!
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:9999/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    // withCredentials: true, // 쿠키 인증 쓸 거면 켜도 됨
});

// ✅ 모든 요청에 JWT 자동 첨부
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("ai-collector-token");
        if (token) {
            // 헤더 객체 보장
            config.headers = config.headers || {};

            // 이미 Authorization 세팅돼 있으면 덮어쓰지 않음
            if (!config.headers["Authorization"]) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
