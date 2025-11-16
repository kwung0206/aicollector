// src/api/admin.js
import api from "./apiClient.js";

export const loginAdmin = async (credentials) => {
    const body = {
        username: credentials.username ?? "",
        password: credentials.password ?? "",
    };

    const { data } = await api.post("/admin/login", body, {
        withCredentials: true,
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

// ⭐ PATCH → POST 로 변경
export const approveBlockedVideo = async (videoNo) => {
    const { data } = await api.post(`/admin/videos/${videoNo}/approve`, null, {
        headers: authHeader(),
    });
    return data;
};

export const deleteBlockedVideo = async (videoNo) => {
    const { data } = await api.delete(`/admin/videos/${videoNo}`, {
        headers: authHeader(),
    });
    return data;
};
