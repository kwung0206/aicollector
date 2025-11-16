// src/api/auth.js
import api from "./apiClient";

// 🔹 인증 관련 기본 경로
const AUTH_BASE = "/auth";  // apiClient의 baseURL이 이미 "/api"니까
// 🔹 프로필/유저 관련 기본 경로
const USER_BASE = "/user";

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

// ✅ 닉네임 변경
// 요청 바디 예: { nickname: "새닉" }
// 백엔드 매핑 예: @PutMapping("/user/nickname")
export const updateNickname = async (nickname) => {
    const payload = { nickname };
    const { data } = await api.put(`${USER_BASE}/nickname`, payload);
    return data; // { nickname: "...", ... } 형태라고 가정
};

// ✅ 비밀번호 변경
// 요청 바디 예: { currentPassword: "...", newPassword: "..." }
// 백엔드 매핑 예: @PostMapping("/user/change-password")
export const changePassword = async ({ currentPassword, newPassword }) => {
    const payload = { currentPassword, newPassword };
    const { data } = await api.post(`${USER_BASE}/change-password`, payload);
    return data;
};

// ✅ 프로필 이미지(아바타) 변경
// 요청 바디 예: { profileImage: "blue" }
export const updateProfileImage = async (profileImage) => {
    const payload = { profileImage };
    const { data } = await api.put(`${USER_BASE}/profile-image`, payload);
    return data; // 갱신된 UserResponse 반환 가정
};
