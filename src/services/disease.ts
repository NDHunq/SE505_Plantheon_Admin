import { request } from "@umijs/max";

export interface Disease {
  id: string;
  name: string;
  class_name: string;
  type: string;
  description: string;
  solution: string;
  image_link: string[];
  plant_name: string;
  created_at: string;
  updated_at: string;
}

export interface DiseaseListParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
}

export interface DiseaseListResponse {
  data: {
    diseases: Disease[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface DiseaseResponse {
  data: Disease;
}

export interface CreateDiseaseParams {
  name: string;
  class_name: string;
  type: string;
  description?: string;
  solution?: string;
  image_link?: string[];
  plant_name?: string;
}

export interface UpdateDiseaseParams {
  name?: string;
  class_name?: string;
  type?: string;
  description?: string;
  solution?: string;
  image_link?: string[];
  plant_name?: string;
}

export interface ImportResult {
  total_rows: number;
  success_count: number;
  error_count: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
  created_diseases: Disease[];
}

export interface ImportResponse {
  message: string;
  data: ImportResult;
}

/**
 * Get diseases list with pagination
 * GET /diseases
 */
export async function getDiseases(
  params: DiseaseListParams
): Promise<DiseaseListResponse> {
  return request<DiseaseListResponse>("/diseases", {
    method: "GET",
    params,
  });
}

/**
 * Get disease by class name
 * GET /diseases/:className
 */
export async function getDisease(className: string): Promise<DiseaseResponse> {
  return request<DiseaseResponse>(`/diseases/${className}`, {
    method: "GET",
  });
}

/**
 * Create new disease
 * POST /diseases
 */
export async function createDisease(
  data: CreateDiseaseParams
): Promise<{ message: string; data: Disease }> {
  return request<{ message: string; data: Disease }>("/diseases", {
    method: "POST",
    data,
  });
}

/**
 * Update disease
 * PUT /diseases/:id
 */
export async function updateDisease(
  id: string,
  data: UpdateDiseaseParams
): Promise<{ message: string; data: Disease }> {
  return request<{ message: string; data: Disease }>(`/diseases/${id}`, {
    method: "PUT",
    data,
  });
}

/**
 * Delete disease
 * DELETE /diseases/:className
 */
export async function deleteDisease(
  className: string
): Promise<{ message: string }> {
  return request<{ message: string }>(`/diseases/${className}`, {
    method: "DELETE",
  });
}

/**
 * Import diseases from CSV/Excel
 * POST /diseases/import-excel
 */
export async function importDiseases(file: File): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return request<ImportResponse>("/diseases/import-excel", {
    method: "POST",
    data: formData,
    requestType: "form",
  });
}
