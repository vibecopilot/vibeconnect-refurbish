import axios from "axios";
import { getItemInLocalStorage } from "../utils/localStorage";

const axiosInstance = axios.create({
  // baseURL: "http://13.215.74.38",
  baseURL: "https://admin.vibecopilot.ai",
  // baseURL: "http://localhost:3000",
});

axiosInstance.interceptors.request.use(
  (authenticate) => {
    const token = getItemInLocalStorage<string>("TOKEN");
    if (token) {
      authenticate.headers["Authorization"] = `${token}`;
    }
    return authenticate;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: detect non-JSON (HTML) responses and provide clearer errors
axiosInstance.interceptors.response.use(
  (response) => {
    const contentType = (response.headers && response.headers['content-type']) || '';
    if (typeof contentType === 'string' && contentType.indexOf('text/html') !== -1) {
      console.error('Received HTML from API when JSON expected:', response);
      return Promise.reject(new Error('API returned HTML instead of JSON. This may be caused by an auth redirect or incorrect baseURL.'));
    }
    return response;
  },
  (error) => {
    // If server returned HTML in error responses, make message clearer for debugging
    const res = error && error.response;
    if (res && res.data && typeof res.data === 'string' && res.data.trim().startsWith('<')) {
      console.error('HTML response body detected for error response:', res.status, res.data.slice(0, 300));
      error.message = 'API returned HTML instead of JSON (possible auth redirect or wrong endpoint). Check network and credentials.';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
