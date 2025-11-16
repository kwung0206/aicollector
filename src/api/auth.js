// src/api/auth.js
import api from "./apiClient";

const BASE = "/auth";  // apiClient의 baseURL이 이미 "/api"니까

// ✅ 회원가입
export const registerUser = async (payload) => {
    const { data } = await api.post(`${BASE}/register`, payload);
    return data;
};

// ✅ 로그인
export const loginUser = async (payload) => {
    const { data } = await api.post(`${BASE}/login`, payload);
    return data;
};

// ✅ 아이디 중복 체크
export const checkUserId = async (userId) => {
    const { data } = await api.get(`${BASE}/check-userid`, {
        params: { userId },
    });
    return data;
};

// ✅ 닉네임 중복 체크
export const checkNickname = async (nickname) => {
    const { data } = await api.get(`${BASE}/check-nickname`, {
        params: { nickname },
    });
    return data;
};
