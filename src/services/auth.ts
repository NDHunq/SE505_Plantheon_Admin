import { request } from "@umijs/max";

export interface LoginParams {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}

/**
 * Login API
 * POST /auth/login
 */
export async function login(params: LoginParams): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    data: params,
  });
}

/**
 * Logout - clears local storage
 */
export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser(): User | null {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Get stored token from localStorage
 */
export function getStoredToken(): string | null {
  return localStorage.getItem("token");
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  const user = getStoredUser();
  return user?.role === "admin";
}
