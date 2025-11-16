// src/api/apiClient.js
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:9999/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

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
