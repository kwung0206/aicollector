// src/api/admin.js
import api from "./apiClient.js";

export const loginAdmin = async (credentials) => {
    const body = {
        username: credentials.username ?? "",
        password: credentials.password ?? "",
    };

    const { data } = await api.post("/admin/login", body, {
        withCredentials: true,
        // 혹시 모를 Authorization 덮어쓰기 방지용 (안 넣어도 되지만 안전하게)
        headers: {
            Authorization: "",
        },
    });

    if (data?.token) {
        localStorage.setItem("adminToken", data.token);
    }

    return data;
};

const authHeader = () => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAdminUsers = async () => {
    const { data } = await api.get("/admin/users", {
        headers: authHeader(),
    });
    return data;
};

export const fetchBlockedVideos = async () => {
    const { data } = await api.get("/admin/videos/blocked", {
        headers: authHeader(),
    });
    return data;
};
