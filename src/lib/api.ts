const URLS = {
  auth: "https://functions.poehali.dev/5053d2c7-da69-4943-92c0-a685bfc86403",
  profile: "https://functions.poehali.dev/767aabc7-25fe-43a0-9e99-825edfdf8a08",
};

export interface UserData {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  company_name?: string;
  position?: string;
  avatar_url?: string;
  is_active?: boolean;
  created_at?: string;
}

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

function clearToken() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}

function getStoredUser(): UserData | null {
  const raw = localStorage.getItem("auth_user");
  return raw ? JSON.parse(raw) : null;
}

function setStoredUser(user: UserData) {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

async function request(fn: keyof typeof URLS, action: string, options: {
  method?: string;
  body?: Record<string, unknown>;
} = {}) {
  const { method = "GET", body } = options;
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${URLS[fn]}?action=${action}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export async function register(data: {
  email: string; password: string; full_name: string;
  phone?: string; company_name?: string; position?: string;
}) {
  const result = await request("auth", "register", { method: "POST", body: data });
  setToken(result.token);
  setStoredUser(result.user);
  return result;
}

export async function login(email: string, password: string) {
  const result = await request("auth", "login", { method: "POST", body: { email, password } });
  setToken(result.token);
  setStoredUser(result.user);
  return result;
}

export async function getMe() {
  const result = await request("auth", "me", { method: "GET" });
  setStoredUser(result.user);
  return result.user;
}

export async function logout() {
  try {
    await request("auth", "logout", { method: "POST" });
  } catch (e) {
    console.log("Logout cleanup", e);
  }
  clearToken();
}

export async function updateProfile(data: {
  full_name: string; phone?: string;
  company_name?: string; position?: string;
}) {
  const result = await request("profile", "update", { method: "PUT", body: data });
  setStoredUser(result.user);
  return result.user;
}

export async function changePassword(current_password: string, new_password: string) {
  return request("profile", "password", { method: "PUT", body: { current_password, new_password } });
}

export { getToken, getStoredUser, clearToken };
