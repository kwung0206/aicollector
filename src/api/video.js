// src/api/video.js

import api from "./apiClient";

const VIDEO_BASE = "/videos";

/**
 * ✅ 영상 업로드
 */
export const uploadVideo = async (payload) => {
    let formData;

    if (payload instanceof FormData) {
        formData = payload;
    } else {
        const { title, description, file, tags } = payload || {};

        formData = new FormData();
        if (title != null) formData.append("title", title);
        if (description != null) formData.append("description", description);
        if (file != null) formData.append("file", file);

        if (Array.isArray(tags)) {
            tags.forEach((t) => {
                const trimmed = String(t ?? "").trim();
                if (trimmed) {
                    formData.append("tags", trimmed);
                }
            });
        }
    }

    const { data } = await api.post(VIDEO_BASE, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
};

// ✅ 내가 올린 영상 목록
export const getMyVideos = async () => {
    const { data } = await api.get(`${VIDEO_BASE}/my`);
    return data; // VideoSummaryDto[]
};

// ✅ 영상 메타데이터 수정 (제목, 태그 등)
export const updateVideoMeta = async (videoNo, payload) => {
    const { data } = await api.patch(`${VIDEO_BASE}/${videoNo}`, payload);
    return data;
};

// ✅ 영상 삭제
export const deleteVideo = async (videoNo) => {
    await api.delete(`${VIDEO_BASE}/${videoNo}`);
};

// ✅ 공개 갤러리용 영상 목록 조회
export const getPublicVideos = async ({
                                          page = 0,
                                          size = 36,
                                          keyword = "",
                                          tags = [],
                                      } = {}) => {
    const params = { page, size };

    if (keyword && keyword.trim()) {
        params.keyword = keyword.trim();
    }

    // '전체'는 제거하고, 나머지만 서버로 전송
    if (Array.isArray(tags)) {
        const effectiveTags = tags
            .filter((t) => t && t !== "all")
            .map((t) => t.trim());
        if (effectiveTags.length > 0) {
            params.tags = effectiveTags.join(",");
        }
    }

    const { data } = await api.get("/videos/public", { params });
    return data; // Spring Page 객체 그대로
};

export const toggleVideoReaction = async (videoNo, action) => {
    const { data } = await api.patch(
        `/videos/${videoNo}/reaction`,
        null,                 // ← body 없음
        {
            params: { action }, // ← ?action=LIKE 또는 ?action=DISLIKE
        }
    );
    return data;           // { likeCount, dislikeCount, myReaction }
};