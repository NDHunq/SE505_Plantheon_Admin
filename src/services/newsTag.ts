import { request } from "@umijs/max";

export interface BlogTag {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BlogTagListResponse {
  data: {
    blog_tags: BlogTag[];
    count: number;
  };
}

export interface BlogTagResponse {
  data: BlogTag;
}

export interface BlogTagRequest {
  name: string;
}

const logApi = (action: string, data?: any) => {
  console.log("[NewsTagAPI]", action, data);
};

/**
 * Get all news tags (public)
 * GET /news-tags
 */
export async function getNewsTags(): Promise<BlogTagListResponse> {
  logApi("GET /news-tags");
  const res = await request<BlogTagListResponse>("/news-tags", {
    method: "GET",
  });
  logApi("GET /news-tags response", res);
  return res;
}

/**
 * Create news tag (admin)
 * POST /news-tags
 */
export async function createNewsTag(
  data: BlogTagRequest
): Promise<{ message: string; data: BlogTag }> {
  logApi("POST /news-tags", data);
  const res = await request<{ message: string; data: BlogTag }>("/news-tags", {
    method: "POST",
    data,
  });
  logApi("POST /news-tags response", res);
  return res;
}

/**
 * Update news tag (admin)
 * PUT /news-tags/:id
 */
export async function updateNewsTag(
  id: string,
  data: BlogTagRequest
): Promise<{ message: string; data: BlogTag }> {
  logApi("PUT /news-tags/:id", { id, data });
  const res = await request<{ message: string; data: BlogTag }>(`/news-tags/${id}`, {
    method: "PUT",
    data,
  });
  logApi("PUT /news-tags/:id response", res);
  return res;
}

/**
 * Delete news tag (admin)
 * DELETE /news-tags/:id
 */
export async function deleteNewsTag(id: string): Promise<{ message: string }> {
  logApi("DELETE /news-tags/:id", { id });
  const res = await request<{ message: string }>(`/news-tags/${id}`, {
    method: "DELETE",
  });
  logApi("DELETE /news-tags/:id response", res);
  return res;
}
