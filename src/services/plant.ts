import { request } from "@umijs/max";

export interface Plant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface PlantListResponse {
  data: {
    plants: Plant[];
    count: number;
  };
}

export interface PlantResponse {
  data: Plant;
}

export interface CreatePlantParams {
  name: string;
  description?: string;
  image_url?: string;
}

export interface UpdatePlantParams {
  name?: string;
  description?: string;
  image_url?: string;
}

/**
 * Get all plants
 * GET /plants
 */
export async function getPlants(): Promise<PlantListResponse> {
  return request<PlantListResponse>("/plants", {
    method: "GET",
  });
}

/**
 * Get plant by ID
 * GET /plants/:id
 */
export async function getPlant(id: string): Promise<PlantResponse> {
  return request<PlantResponse>(`/plants/${id}`, {
    method: "GET",
  });
}

/**
 * Create new plant
 * POST /plants
 */
export async function createPlant(
  data: CreatePlantParams
): Promise<PlantResponse> {
  return request<PlantResponse>("/plants", {
    method: "POST",
    data,
  });
}

/**
 * Update plant
 * PUT /plants/:id
 */
export async function updatePlant(
  id: string,
  data: UpdatePlantParams
): Promise<PlantResponse> {
  return request<PlantResponse>(`/plants/${id}`, {
    method: "PUT",
    data,
  });
}

/**
 * Delete plant
 * DELETE /plants/:id
 */
export async function deletePlant(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/plants/${id}`, {
    method: "DELETE",
  });
}
