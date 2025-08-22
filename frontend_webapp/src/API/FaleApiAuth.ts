
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type HashAlgo = "MD5" | "SHA256" | "BCRYPT";
export type VehicleStatus = "DISPONIBLE" | "VENDIDO" | "MANTENIMIENTO";

export type AuthOk = { ok: true; token: string; user?: { id: number; email: string; name?: string } };
export type AuthFail = { ok: false; msg: string };
export type AuthResponse = AuthOk | AuthFail;

export type VehiclesResponse =
  | { ok: true; vehicles: Array<{
      id: number; brand: string; model: string; year: number;
      price: number; status: VehicleStatus; mileage: number;
      color: string; createdAt: string;
    }>}
  | { ok: false; msg: string };

// Helper genérico para fetch con JSON
async function apiFetch<T>(
  path: string,
  opts: RequestInit & { authToken?: string } = {}
): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!headers.has("Content-Type") && opts.body) headers.set("Content-Type", "application/json");
  if (opts.authToken) headers.set("Authorization", `Bearer ${opts.authToken}`);

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const data = (await res.json()) as T;

  if (!res.ok) return data;
  return data;
}



export function registerInsecure(params: { email: string; password: string; name?: string }) {
  return apiFetch<AuthResponse>("/auth/register-insecure", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function registerHashed(params: {
  email: string;
  password: string;
  name?: string;
  algo: HashAlgo;
}) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function loginBasic(params: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/basic-login", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function loginHashed(params: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/hashed-login", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function beginGoogleLogin() {
  window.location.href = `${API_URL}/auth/google`;
}


export function getVehicles(authToken: string) {
  return apiFetch<VehiclesResponse>("/inventory", { method: "GET", authToken });
}

