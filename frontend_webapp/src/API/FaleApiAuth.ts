
import { API_CONFIG, buildApiUrl } from '../config/api';

export type HashAlgo = "MD5" | "SHA256" | "BCRYPT";
export type VehicleStatus = "DISPONIBLE" | "VENDIDO" | "MANTENIMIENTO";

// Tipos para tu formato de API específico
export type AuthOk = { 
  success: true; 
  message: string;
  data: {
    loginTime: string;
    user: { 
      _id?: string;
      id?: number; 
      email: string; 
      username?: string;
      name?: string;
      role?: string;
    };
    token?: string;
  };
};

export type AuthFail = { 
  success: false; 
  message: string;
  data?: any;
};

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

  const url = buildApiUrl(path);
  const res = await fetch(url, { ...opts, headers });
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

// Función específica para el login usando tu endpoint
export function loginUser(params: { email: string; password: string; mfa: string }) {
  // Validar que todos los parámetros requeridos estén presentes
  if (!params.email || !params.password) {
    throw new Error('Email y contraseña son requeridos');
  }
  
  // Asegurar que mfa siempre tenga un valor
  const loginParams = {
    email: params.email.trim(),
    password: params.password,
    mfa: params.mfa || "S" // Default a "S" si no se especifica
  };
  
  
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(loginParams),
  });
}

export function beginGoogleLogin() {
  window.location.href = `${API_CONFIG.BASE_URL}/auth/google`;
}


export function getVehicles(authToken: string) {
  return apiFetch<VehiclesResponse>("/inventory", { method: "GET", authToken });
}

