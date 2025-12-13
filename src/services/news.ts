import { request } from "@umijs/max";

export type NewsStatus = "draft" | "published";

export interface News {
  id: string;
  title: string;
  description?: string | null;
  content?: string;
  blog_tag_id?: string | null;
  blog_tag_name?: string | null;
  sub_guide_stages_id?: string | null;
  cover_image_url?: string | null;
  status: NewsStatus;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  full_name: string;
  avatar?: string | null;
}

export interface NewsDetail extends News {
  content: string;
}

export interface NewsListResponse {
  data: News[];
}

export interface NewsDetailResponse {
  data: NewsDetail;
}

export interface CreateNewsRequest {
  title: string;
  description?: string | null;
  content: string;
  cover_image_url?: string | null;
  blog_tag_id?: string | null;
  sub_guide_stages_id?: string | null;
  status?: NewsStatus;
}

const logApi = (...args: any[]) => {
  // eslint-disable-next-line no-console
  console.log("[NewsAPI]", ...args);
};

export async function getNews(size?: number): Promise<NewsListResponse> {
  logApi("GET /news", { size });
  const res = await request<NewsListResponse>("/news", {
    method: "GET",
    params: size ? { size } : undefined,
  });
  logApi("GET /news response", res);
  return res;
}

export async function getNewsDetail(id: string): Promise<NewsDetailResponse> {
  logApi("GET /news/:id", { id });
  const res = await request<NewsDetailResponse>(`/news/${id}`, {
    method: "GET",
  });
  logApi("GET /news/:id response", res);
  return res;
}

export async function createNews(
  data: CreateNewsRequest
): Promise<{ message: string; data: News }> {
  logApi("POST /news", { data });
  const res = await request<{ message: string; data: News }>("/news", {
    method: "POST",
    data,
  });
  logApi("POST /news response", res);
  return res;
}

export async function updateNews(
  id: string,
  data: CreateNewsRequest
): Promise<{ message: string; data: News }> {
  logApi("PUT /news/:id", { id, data });
  const res = await request<{ message: string; data: News }>(`/news/${id}`, {
    method: "PUT",
    data,
  });
  logApi("PUT /news/:id response", res);
  return res;
}

export async function deleteNews(
  id: string
): Promise<{ message: string }> {
  logApi("DELETE /news/:id", { id });
  const res = await request<{ message: string }>(`/news/${id}`, {
    method: "DELETE",
  });
  logApi("DELETE /news/:id response", res);
  return res;
}



