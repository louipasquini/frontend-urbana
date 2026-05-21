export const API_PRODUCAO = "https://backend-urbana-02588e976dd6.herokuapp.com";

const API_BASE = import.meta.env.VITE_API_URL ?? API_PRODUCAO;

export class ApiError extends Error {
  constructor(message, extras = {}, status = 0) {
    super(message);
    this.name = "ApiError";
    this.shortages = extras.shortages;
    this.status = status;
  }
}

export async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("Resposta inválida do servidor", {}, res.status);
  }

  if (!json.success) {
    throw new ApiError(json.message || "Erro na requisição", {
      shortages: json.shortages,
    }, res.status);
  }

  return json.data;
}

export { API_BASE };
