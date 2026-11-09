import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("srms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function showError(message) {
  window.dispatchEvent(new CustomEvent("srms:error", { detail: message }));
}

// Central error handling: expired sessions and a visible message for failed requests.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const status = error.response?.status;
    const isAuthCall = url.startsWith("/auth/");

    // Token expired or invalid in the middle of a session: log out and go to login.
    if (status === 401 && !isAuthCall && localStorage.getItem("srms_token")) {
      localStorage.removeItem("srms_token");
      window.location.assign("/login");
      return Promise.reject(error);
    }

    // Forms, login and the chatbot show their own errors, so skip the banner for them.
    const skip = error.config?.skipGlobalError || isAuthCall || url.startsWith("/chatbot");
    if (!skip) {
      const message = !error.response
        ? "Cannot reach the server. Please check your connection and try again."
        : status >= 500
        ? "Something went wrong on the server. Please try again."
        : error.response.data?.message || "Request failed.";
      showError(message);
    }
    return Promise.reject(error);
  }
);

export default api;
