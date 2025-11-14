// src/api/apiClient.js
import axios from "axios";

// ✅ Vite에서는 이렇게!
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:9999/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    // withCredentials: true, // 나중에 쿠키 인증 쓰면 켜기
});

export default api;
