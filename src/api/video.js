// src/api/video.js
import api from "./apiClient";

const VIDEO_BASE = "/videos";

// 🎥 영상 업로드
export const uploadVideo = async ({ title, description, tags, file }) => {
    const formData = new FormData();
    formData.append("title", title);
    if (description) {
        formData.append("description", description);
    }

    if (Array.isArray(tags)) {
        tags.forEach((tag) => formData.append("tags", tag));
    }

    formData.append("file", file);

    const { data } = await api.post(VIDEO_BASE, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            // ✅ Authorization은 apiClient 인터셉터에서 자동으로 붙음
        },
    });

    return data;
};
