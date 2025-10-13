import axios from "axios";
import { getTokenBearer } from "./utility/Utility";

const http = axios.create({
    baseURL: "http://localhost:3008", 
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token to requests
http.interceptors.request.use(
    (config) => {
        const token = getTokenBearer();
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default http;