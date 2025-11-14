// src/api/auth.js
import axios from "axios";

const BASE = "/api/auth";

// ✅ JWT 헤더 헬퍼
const authHeader = () => {
    const token = localStorage.getItem("ai-collector-token");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
};

// ✅ 회원가입
export const registerUser = async (payload) => {
    const { data } = await axios.post(`${BASE}/register`, payload, {
        withCredentials: true,
    });
    return data;
};

// ✅ 로그인
export const loginUser = async (payload) => {
    const { data } = await axios.post(`${BASE}/login`, payload, {
        withCredentials: true,
    });
    return data;
};

// ✅ 아이디 중복 체크
export const checkUserId = async (userId) => {
    const { data } = await axios.get(`${BASE}/check-userid`, {
        params: { userId },
        withCredentials: true,
    });
    return data; // { available, message }
};

// ✅ 닉네임 중복 체크
export const checkNickname = async (nickname) => {
    const { data } = await axios.get(`${BASE}/check-nickname`, {
        params: { nickname },
        withCredentials: true,
    });
    return data; // { available, message }
};

/* =========================
   닉네임 수정 / 비밀번호 변경 / 프로필 이미지
   ========================= */

// 🔸 닉네임 변경 (PATCH /api/auth/nickname)
export const updateNickname = async (nickname) => {
    const { data } = await axios.patch(
        `${BASE}/nickname`,
        { nickname },
        {
            withCredentials: true,
            headers: {
                ...authHeader(),
            },
        }
    );
    return data; // UserResponse
};

// 🔸 비밀번호 변경 (POST /api/auth/password)
export const changePassword = async ({ currentPassword, newPassword }) => {
    const { data } = await axios.post(
        `${BASE}/password`,
        { currentPassword, newPassword },
        {
            withCredentials: true,
            headers: {
                ...authHeader(),
            },
        }
    );
    return data;
};

// 🔸 프로필 이미지 변경 (PATCH /api/auth/profile-image)
export const updateProfileImage = async (profileImage) => {
    const { data } = await axios.patch(
        `${BASE}/profile-image`,
        { profileImage }, // blue / purple / ...
        {
            withCredentials: true,
            headers: {
                ...authHeader(),
            },
        }
    );
    return data; // UserResponse
};
