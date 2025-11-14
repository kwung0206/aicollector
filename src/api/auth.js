// src/api/auth.js
import axios from "axios";

const BASE = "/api/auth";

export const registerUser = async (payload) => {
    const { data } = await axios.post(`${BASE}/register`, payload, {
        withCredentials: true,
    });
    return data;
};

export const loginUser = async (payload) => {
    const { data } = await axios.post(`${BASE}/login`, payload, {
        withCredentials: true,
    });
    return data;
};

export const checkUserId = async (userId) => {
    const { data } = await axios.get(`${BASE}/check-userid`, {
        params: { userId },
        withCredentials: true,
    });
    return data; // { available, message }
};

export const checkNickname = async (nickname) => {
    const { data } = await axios.get(`${BASE}/check-nickname`, {
        params: { nickname },
        withCredentials: true,
    });
    return data; // { available, message }
};
