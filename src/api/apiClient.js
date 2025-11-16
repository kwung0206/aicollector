// src/api/apiClient.js
import axios from "axios";

// Vite에서 제공하는 플래그 (npm run dev일 때만 true)
const isDev = import.meta.env.DEV;

// 개발/운영에 따라 baseURL 분기
const API_BASE_URL = (() => {
    // 🔹 개발 환경: 기본값을 localhost:9999/api 로
    if (isDev) {
        return import.meta.env.VITE_API_BASE_URL || "http://localhost:9999/api";
    }
    // 🔹 배포 환경: Nginx 가 /api → 스프링으로 프록시하니까 상대 경로 사용
    return import.meta.env.VITE_API_BASE_URL || "/api";
})();

const api = axios.create({
    baseURL: API_BASE_URL,
    // 필요하면 쿠키도 쓰고 싶을 때:
    // withCredentials: true,
});

// 요청마다 토큰 붙이는 인터셉터
api.interceptors.request.use(
    (config) => {
        // 🔹 /admin 로 시작하는 엔드포인트는 일반 유저 토큰 안 붙이기
        if (config.url && config.url.startsWith("/admin")) {
            return config;
        }

        const token = localStorage.getItem("ai-collector-token");
        if (token) {
            config.headers = config.headers || {};
            if (!config.headers["Authorization"]) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
