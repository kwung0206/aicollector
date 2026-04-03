// src/api/auth.js
import api from "./apiClient";

// 🔹 인증 관련 기본 경로
const AUTH_BASE = "/auth"; // apiClient의 baseURL이 이미 "/api"니까

// ✅ 회원가입
export const registerUser = async (payload) => {
    const { data } = await api.post(`${AUTH_BASE}/register`, payload);
    return data;
};

// ✅ 로그인
export const loginUser = async (payload) => {
    const { data } = await api.post(`${AUTH_BASE}/login`, payload);
    return data;
};

// ✅ 아이디 중복 체크
export const checkUserId = async (userId) => {
    const { data } = await api.get(`${AUTH_BASE}/check-userid`, {
        params: { userId },
    });
    return data;
};

// ✅ 닉네임 중복 체크
export const checkNickname = async (nickname) => {
    const { data } = await api.get(`${AUTH_BASE}/check-nickname`, {
        params: { nickname },
    });
    return data;
};

// ✅ 이메일 중복 체크 (필요 시 사용)
export const checkEmail = async (email) => {
    const { data } = await api.get(`${AUTH_BASE}/check-email`, {
        params: { email },
    });
    return data;
};

// ✅ 닉네임 변경
export const updateNickname = async (nickname) => {
    const payload = { nickname };
    const { data } = await api.patch(`${AUTH_BASE}/nickname`, payload);
    return data; // { ...UserResponse }
};

// ✅ 비밀번호 변경
export const changePassword = async ({ currentPassword, newPassword }) => {
    const payload = { currentPassword, newPassword };
    const { data } = await api.post(`${AUTH_BASE}/password`, payload);
    return data;
};

// ✅ 프로필 이미지(아바타) 변경
export const updateProfileImage = async (profileImage) => {
    const payload = { profileImage };
    const { data } = await api.patch(`${AUTH_BASE}/profile-image`, payload);
    return data; // UserResponse
};

// ✅ 이메일 인증번호 발송
export const sendEmailCode = async (email) => {
    const { data } = await api.post(`${AUTH_BASE}/email/send-code`, { email });
    return data; // { message }
};

// ✅ 이메일 인증번호 검증
export const verifyEmailCode = async (email, code) => {
    const { data } = await api.post(`${AUTH_BASE}/email/verify-code`, {
        email,
        code,
    });
    return data; // { message }
};
