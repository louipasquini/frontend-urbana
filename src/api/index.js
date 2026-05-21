import { apiRequest } from "./client";

export const authApi = {
  login: (email, password) =>
    apiRequest("/login", { method: "POST", body: { email, password }, auth: false }),
  register: (data) =>
    apiRequest("/register", { method: "POST", body: data }),
};

export const usersApi = {
  list: () => apiRequest("/users"),
};

export const customersApi = {
  list: () => apiRequest("/customers"),
  create: (data) => apiRequest("/customers", { method: "POST", body: data }),
};

export const productsApi = {
  list: () => apiRequest("/products"),
  create: (data) => apiRequest("/products", { method: "POST", body: data }),
  update: (id, data) => apiRequest(`/products/${id}`, { method: "PUT", body: data }),
  remove: (id) => apiRequest(`/products/${id}`, { method: "DELETE" }),
};

export const drinksApi = {
  list: () => apiRequest("/drinks"),
  create: (data) => apiRequest("/drinks", { method: "POST", body: data }),
  update: (id, data) => apiRequest(`/drinks/${id}`, { method: "PUT", body: data }),
  remove: (id) => apiRequest(`/drinks/${id}`, { method: "DELETE" }),
};

export const menuApi = {
  list: () => apiRequest("/menu", { auth: false }),
};

export const ordersApi = {
  open: () => apiRequest("/orders/open"),
  history: () => apiRequest("/orders/history"),
  get: (id) => apiRequest(`/orders/${id}`),
  openOrder: (data) => apiRequest("/orders/open", { method: "POST", body: data }),
  addDrink: (id, drink_id, quantity = 1) =>
    apiRequest(`/orders/${id}/add-drink`, {
      method: "POST",
      body: { drink_id, quantity },
    }),
  close: (id) => apiRequest(`/orders/${id}/close`, { method: "POST" }),
};

export const analyticsApi = {
  topDrinks: (limit = 5) => apiRequest(`/analytics/top-drinks?limit=${limit}`),
  topBases: (limit = 5) => apiRequest(`/analytics/top-bases?limit=${limit}`),
  topProducts: (limit = 5) => apiRequest(`/analytics/top-products?limit=${limit}`),
  sales: (start_date, end_date) => {
    const params = new URLSearchParams();
    if (start_date) params.set("start_date", start_date);
    if (end_date) params.set("end_date", end_date);
    const qs = params.toString();
    return apiRequest(`/analytics/sales${qs ? `?${qs}` : ""}`);
  },
};
