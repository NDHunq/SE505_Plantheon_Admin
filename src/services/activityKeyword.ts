import { request } from "@umijs/max";
import type { Disease } from "./disease";

export interface ActivityKeyword {
  id: string;
  name: string;
  description: string;
  type: "TECHNIQUE" | "CLIMATE" | "DISEASE" | "OTHER" | "EXPENSE" | "INCOME";
  base_days_offset: number;
  is_free_time: boolean;
  hour_time: number;
  end_hour_time: number;
  time_duration: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityKeywordWithDiseases extends ActivityKeyword {
  diseases?: Disease[];
}

export interface CreateActivityKeywordParams {
  name: string;
  description?: string;
  type: "TECHNIQUE" | "CLIMATE" | "DISEASE" | "OTHER" | "EXPENSE" | "INCOME";
  base_days_offset?: number;
  is_free_time?: boolean;
  hour_time?: number;
  end_hour_time?: number;
  time_duration?: number;
  disease_ids?: string[];
}

export interface UpdateActivityKeywordParams {
  name?: string;
  description?: string;
  type?: "TECHNIQUE" | "CLIMATE" | "DISEASE" | "OTHER" | "EXPENSE" | "INCOME";
  base_days_offset?: number;
  is_free_time?: boolean;
  hour_time?: number;
  end_hour_time?: number;
  time_duration?: number;
  disease_ids?: string[];
}

export interface ImportCsvResult {
  message: string;
  success: number;
  total: number;
  errors: Array<{
    row: number;
    error: string;
    details?: string;
  }>;
}

// ============ ACTIVITY KEYWORDS CRUD ============

/**
 * Get all activity keywords
 * GET /activity-keywords
 */
export async function getActivityKeywords(): Promise<{
  data: ActivityKeyword[];
}> {
  return request<{ data: ActivityKeyword[] }>("/activity-keywords", {
    method: "GET",
  });
}

/**
 * Get activity keyword by ID
 * GET /activity-keywords/:id
 */
export async function getActivityKeywordById(
  id: string
): Promise<{ data: ActivityKeyword }> {
  return request<{ data: ActivityKeyword }>(`/activity-keywords/${id}`, {
    method: "GET",
  });
}

/**
 * Search activity keywords
 * GET /activity-keywords/search?q=
 */
export async function searchActivityKeywords(
  q: string
): Promise<{ data: ActivityKeyword[] }> {
  return request<{ data: ActivityKeyword[] }>("/activity-keywords/search", {
    method: "GET",
    params: { q },
  });
}

/**
 * Get keywords by disease
 * GET /activity-keywords/disease/:disease_id
 */
export async function getKeywordsByDisease(
  diseaseId: string
): Promise<{ data: ActivityKeyword[] }> {
  return request<{ data: ActivityKeyword[] }>(
    `/activity-keywords/disease/${diseaseId}`,
    {
      method: "GET",
    }
  );
}

/**
 * Create new activity keyword
 * POST /activity-keywords
 */
export async function createActivityKeyword(
  data: CreateActivityKeywordParams
): Promise<{ data: ActivityKeyword }> {
  return request<{ data: ActivityKeyword }>("/activity-keywords", {
    method: "POST",
    data,
  });
}

/**
 * Update activity keyword
 * PUT /activity-keywords/:id
 */
export async function updateActivityKeyword(
  id: string,
  data: UpdateActivityKeywordParams
): Promise<{ data: ActivityKeyword }> {
  return request<{ data: ActivityKeyword }>(`/activity-keywords/${id}`, {
    method: "PUT",
    data,
  });
}

/**
 * Delete activity keyword
 * DELETE /activity-keywords/:id
 */
export async function deleteActivityKeyword(
  id: string
): Promise<{ message: string }> {
  return request<{ message: string }>(`/activity-keywords/${id}`, {
    method: "DELETE",
  });
}

// ============ DISEASE-KEYWORD RELATIONSHIPS ============

/**
 * Add keyword to disease
 * POST /disease-activity-keywords/disease/:disease_id
 */
export async function addKeywordToDisease(
  diseaseId: string,
  keywordId: string
): Promise<{ message: string }> {
  return request<{ message: string }>(
    `/disease-activity-keywords/disease/${diseaseId}`,
    {
      method: "POST",
      data: { activity_keyword_id: keywordId },
    }
  );
}

/**
 * Remove keyword from disease
 * DELETE /disease-activity-keywords/disease/:disease_id/keyword/:keyword_id
 */
export async function removeKeywordFromDisease(
  diseaseId: string,
  keywordId: string
): Promise<{ message: string }> {
  return request<{ message: string }>(
    `/disease-activity-keywords/disease/${diseaseId}/keyword/${keywordId}`,
    {
      method: "DELETE",
    }
  );
}

/**
 * Set all keywords for disease
 * PUT /disease-activity-keywords/disease/:disease_id
 */
export async function setKeywordsForDisease(
  diseaseId: string,
  keywordIds: string[]
): Promise<{ message: string }> {
  return request<{ message: string }>(
    `/disease-activity-keywords/disease/${diseaseId}`,
    {
      method: "PUT",
      data: { activity_keyword_ids: keywordIds },
    }
  );
}

/**
 * Import keywords from CSV
 * POST /disease-activity-keywords/import-csv
 */
export async function importKeywordsCsv(file: File): Promise<ImportCsvResult> {
  const formData = new FormData();
  formData.append("file", file);

  return request<ImportCsvResult>("/disease-activity-keywords/import-csv", {
    method: "POST",
    data: formData,
    requestType: "form",
  });
}

/**
 * Get diseases linked to an activity keyword
 * GET /disease-activity-keywords/keyword/:keyword_id
 */
export async function getDiseasesForKeyword(
  keywordId: string
): Promise<{ data: Disease[] }> {
  return request<{ data: Disease[] }>(
    `/disease-activity-keywords/keyword/${keywordId}`,
    {
      method: "GET",
    }
  );
}
