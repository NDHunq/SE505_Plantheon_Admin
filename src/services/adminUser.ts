import { request } from "@umijs/max";

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar?: string;
  role: string;
  is_active?: boolean;
  is_disabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  username?: string;
  email?: string;
  full_name?: string;
  role?: string;
  is_disabled?: boolean;
  search?: string;
}

export interface AdminUserListResponse {
  data: AdminUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AdminUserResponse {
  data: AdminUser;
}

export interface UpdateProfilePayload {
  username?: string;
  full_name?: string;
  avatar?: string;
}

export interface UpdateAdminUserPayload {
  email?: string;
  username?: string;
  full_name?: string;
  avatar?: string;
}

const logApi = (...args: any[]) => {
  // Lightweight console log helper for admin user APIs
  // eslint-disable-next-line no-console
  console.log("[AdminUserAPI]", ...args);
};

/**
 * Get all users (admin)
 * GET /admin/users
 */
export async function getAdminUsers(
  params?: AdminUserListParams
): Promise<AdminUserListResponse> {
  logApi("GET /admin/users", { params });
  const res = await request<AdminUserListResponse>("/admin/users", {
    method: "GET",
    params,
  });
  logApi("GET /admin/users response", res);
  return res;
}

/**
 * Get user detail (admin)
 * GET /admin/users/:id
 */
export async function getAdminUser(id: string): Promise<AdminUserResponse> {
  logApi("GET /admin/users/:id", { id });
  const res = await request<AdminUserResponse>(`/admin/users/${id}`, {
    method: "GET",
  });
  logApi("GET /admin/users/:id response", res);
  return res;
}

/**
 * Disable user (admin)
 * PATCH /admin/users/:id/disable
 */
export async function disableAdminUser(
  id: string
): Promise<{ message: string }> {
  logApi("PATCH /admin/users/:id/disable", { id });
  const res = await request<{ message: string }>(
    `/admin/users/${id}/disable`,
    {
      method: "PATCH",
    }
  );
  logApi("PATCH /admin/users/:id/disable response", res);
  return res;
}

/**
 * Enable user (admin)
 * PATCH /admin/users/:id/enable
 */
export async function enableAdminUser(
  id: string
): Promise<{ message: string }> {
  logApi("PATCH /admin/users/:id/enable", { id });
  const res = await request<{ message: string }>(
    `/admin/users/${id}/enable`,
    {
      method: "PATCH",
    }
  );
  logApi("PATCH /admin/users/:id/enable response", res);
  return res;
}

/**
 * Update user (admin)
 * PUT /admin/users/:id
 */
export async function updateAdminUser(
  id: string,
  data: UpdateAdminUserPayload
): Promise<{ message: string; data: AdminUser }> {
  logApi("PUT /admin/users/:id", { id, data });
  const res = await request<{ message: string; data: AdminUser }>(
    `/admin/users/${id}`,
    {
      method: "PUT",
      data,
    }
  );
  logApi("PUT /admin/users/:id response", res);
  return res;
}

/**
 * Update profile (self)
 * PUT /users/profile
 */
export async function updateProfile(
  data: UpdateProfilePayload
): Promise<{ message: string }> {
  logApi("PUT /users/profile", { data });
  const res = await request<{ message: string }>("/users/profile", {
    method: "PUT",
    data,
  });
  logApi("PUT /users/profile response", res);
  return res;
}

