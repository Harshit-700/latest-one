const BASE = import.meta.env.VITE_API_URL || "";

function getHeaders(json = true) {
  const token = localStorage.getItem("tf_token");
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: getHeaders(!!body),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({ error: "Invalid JSON response" }));

  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data   = data;
    throw err;
  }

  return data;
}

export const api = {
 
  register: (body) => request("POST", "/api/auth/register", body),
  login:    (body) => request("POST", "/api/auth/login",    body),
  me:       ()     => request("GET",  "/api/auth/me"),

  
  getTasks:   (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "all"))
    ).toString();
    return request("GET", `/api/tasks${qs ? `?${qs}` : ""}`);
  },
  createTask: (body) => request("POST",   "/api/tasks",       body),
  updateTask: (id, body) => request("PUT", `/api/tasks/${id}`, body),
  deleteTask: (id)   => request("DELETE", `/api/tasks/${id}`),

  
  createCheckout: (plan) => request("POST", "/api/stripe/checkout", { plan }),
  confirmSuccess: (sessionId) => request("GET", `/api/stripe/success?session_id=${sessionId}`),
};
