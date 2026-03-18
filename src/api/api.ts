import axios from "axios";
import { getToken } from "../utils/auth";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5242/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
