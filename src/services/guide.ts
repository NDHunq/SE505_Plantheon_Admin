import { request } from "@umijs/max";

export interface GuideStage {
  id: string;
  plant_id: string;
  stage_title: string;
  description?: string;
  start_day_offset?: number;
  end_day_offset?: number;
  image_url?: string;
  created_at?: string;
}

export interface SubGuideStage {
  id: string;
  guide_stages_id: string;
  title: string;
  start_day_offset?: number;
  end_day_offset?: number;
  blogs?: any[];
}

export interface GuideStageDetail extends GuideStage {
  sub_guide_stages?: SubGuideStage[];
}

export interface GuideStageListResponse {
  data: {
    guide_stages: GuideStage[];
    count: number;
  };
}

export interface GuideStageDetailResponse {
  data: GuideStageDetail;
}

const logApi = (...args: any[]) => {
  // eslint-disable-next-line no-console
  console.log("[GuideAPI]", ...args);
};

// Guide stages
export async function getGuideStagesByPlant(
  plantId: string
): Promise<GuideStageListResponse> {
  logApi("GET /guide-stages/plant/:plant_id", { plantId });
  const res = await request<GuideStageListResponse>(
    `/guide-stages/plant/${plantId}`,
    { method: "GET" }
  );
  logApi("GET /guide-stages/plant response", res);
  return res;
}

export async function getGuideStageDetail(
  id: string
): Promise<GuideStageDetailResponse> {
  logApi("GET /guide-stages/:id", { id });
  const res = await request<GuideStageDetailResponse>(`/guide-stages/${id}`, {
    method: "GET",
  });
  logApi("GET /guide-stages/:id response", res);
  return res;
}

export async function createGuideStage(
  data: Partial<GuideStage>
): Promise<{ message: string; data: GuideStage }> {
  logApi("POST /guide-stages", data);
  const res = await request<{ message: string; data: GuideStage }>(
    "/guide-stages",
    {
      method: "POST",
      data,
    }
  );
  logApi("POST /guide-stages response", res);
  return res;
}

export async function updateGuideStage(
  id: string,
  data: Partial<GuideStage>
): Promise<{ message: string; data: GuideStage }> {
  logApi("PUT /guide-stages/:id", { id, data });
  const res = await request<{ message: string; data: GuideStage }>(
    `/guide-stages/${id}`,
    {
      method: "PUT",
      data,
    }
  );
  logApi("PUT /guide-stages/:id response", res);
  return res;
}

export async function deleteGuideStage(
  id: string
): Promise<{ message: string }> {
  logApi("DELETE /guide-stages/:id", { id });
  const res = await request<{ message: string }>(`/guide-stages/${id}`, {
    method: "DELETE",
  });
  logApi("DELETE /guide-stages/:id response", res);
  return res;
}

// Sub guide stages
export async function getSubGuideStagesByStage(
  guideStageId: string
): Promise<{ data: { sub_guide_stages: SubGuideStage[]; count: number } }> {
  logApi("GET /sub-guide-stages/guide-stage/:id", { guideStageId });
  const res = await request<{
    data: { sub_guide_stages: SubGuideStage[]; count: number };
  }>(`/sub-guide-stages/guide-stage/${guideStageId}`, {
    method: "GET",
  });
  logApi("GET /sub-guide-stages/guide-stage response", res);
  return res;
}

export async function getSubGuideStage(
  id: string
): Promise<{ data: SubGuideStage }> {
  logApi("GET /sub-guide-stages/:id", { id });
  const res = await request<{ data: SubGuideStage }>(
    `/sub-guide-stages/${id}`,
    {
      method: "GET",
    }
  );
  logApi("GET /sub-guide-stages/:id response", res);
  return res;
}

export async function createSubGuideStage(
  data: Partial<SubGuideStage>
): Promise<{ message: string; data: SubGuideStage }> {
  logApi("POST /sub-guide-stages", data);
  const res = await request<{ message: string; data: SubGuideStage }>(
    "/sub-guide-stages",
    {
      method: "POST",
      data,
    }
  );
  logApi("POST /sub-guide-stages response", res);
  return res;
}

export async function updateSubGuideStage(
  id: string,
  data: Partial<SubGuideStage>
): Promise<{ message: string; data: SubGuideStage }> {
  logApi("PUT /sub-guide-stages/:id", { id, data });
  const res = await request<{ message: string; data: SubGuideStage }>(
    `/sub-guide-stages/${id}`,
    {
      method: "PUT",
      data,
    }
  );
  logApi("PUT /sub-guide-stages/:id response", res);
  return res;
}

export async function deleteSubGuideStage(
  id: string
): Promise<{ message: string }> {
  logApi("DELETE /sub-guide-stages/:id", { id });
  const res = await request<{ message: string }>(
    `/sub-guide-stages/${id}`,
    {
      method: "DELETE",
    }
  );
  logApi("DELETE /sub-guide-stages/:id response", res);
  return res;
}

