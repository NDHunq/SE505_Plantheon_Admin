import { request } from "@umijs/max";

// ============ TYPES & INTERFACES ============



export interface ProblematicDisease {
  disease: {
    id: string;
    name: string;
    class_name: string;
    image_link: string;
    plant_name: string;
  };
  complaint_count: number;
  verified_count: number;
  avg_confidence: number;
  error_rate: number;
}





export interface TrendData {
  date: string;
  complaint_count: number;
  verified_count: number;
  avg_confidence: number;
}

export interface OverallStats {
  total_complaints: number;
  verified_complaints: number;
  ai_correct_rate: number;
}

export interface TopContributor {
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar: string;
  };
  complaint_count: number;
  verified_count: number;
  correct_count: number;
}

// ============ API FUNCTIONS ============



/**
 * Get problematic diseases
 * GET /analytics/problematic-diseases
 */
export async function getProblematicDiseases(params: {
  limit?: number;
}): Promise<{
  message: string;
  count: number;
  data: ProblematicDisease[];
}> {
  console.log("🚨 [Analytics] Fetching problematic diseases");
  try {
    const response = await request<{
      message: string;
      count: number;
      data: ProblematicDisease[];
    }>("/analytics/problematic-diseases", {
      method: "GET",
      params,
    });
    console.log("✅ [Analytics] Problematic diseases success:", response);
    return response;
  } catch (error) {
    console.error("❌ [Analytics] Problematic diseases error:", error);
    throw error;
  }
}





/**
 * Get complaint trends
 * GET /analytics/trends
 */
export async function getComplaintTrends(params: {
  days?: number;
}): Promise<{
  message: string;
  days: number;
  count: number;
  data: TrendData[];
}> {
  console.log("📉 [Analytics] Fetching complaint trends");
  try {
    const response = await request<{
      message: string;
      days: number;
      count: number;
      data: TrendData[];
    }>("/analytics/trends", {
      method: "GET",
      params,
    });
    console.log("✅ [Analytics] Complaint trends success:", response);
    return response;
  } catch (error) {
    console.error("❌ [Analytics] Complaint trends error:", error);
    throw error;
  }
}

/**
 * Get overall statistics
 * GET /analytics/overall-stats
 */
export async function getOverallStats(): Promise<{
  message: string;
  data: OverallStats;
}> {
  console.log("📊 [Analytics] Fetching overall stats");
  try {
    const response = await request<{
      message: string;
      data: OverallStats;
    }>("/analytics/overall-stats", {
      method: "GET",
    });
    console.log("✅ [Analytics] Overall stats success:", response);
    return response;
  } catch (error) {
    console.error("❌ [Analytics] Overall stats error:", error);
    throw error;
  }
}

/**
 * Get top contributors
 * GET /analytics/top-contributors
 */
export async function getTopContributors(params: {
  limit?: number;
}): Promise<{
  message: string;
  count: number;
  data: TopContributor[];
}> {
  console.log("🏆 [Analytics] Fetching top contributors");
  try {
    const response = await request<{
      message: string;
      count: number;
      data: TopContributor[];
    }>("/analytics/top-contributors", {
      method: "GET",
      params,
    });
    console.log("✅ [Analytics] Top contributors success:", response);
    return response;
  } catch (error) {
    console.error("❌ [Analytics] Top contributors error:", error);
    throw error;
  }
}
