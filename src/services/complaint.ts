import { request } from "@umijs/max";

// ============ TYPES & INTERFACES ============

export interface DiseaseInfo {
  id: string;
  name: string;
  class_name: string;
  type: string;
  plant_name: string;
}

export type ComplaintCategory =
  | "SPAM"
  | "HARASSMENT"
  | "HATE_SPEECH"
  | "VIOLENCE"
  | "MISINFORMATION"
  | "INAPPROPRIATE"
  | "WRONG_RESULT"
  | "OTHER";

export type ComplaintStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";

export type TargetType = "POST" | "COMMENT" | "SCAN";

export interface Complaint {
  id: string;
  user_id: string;
  target_id: string;
  target_type: TargetType;
  category: ComplaintCategory;
  content?: string;
  status: ComplaintStatus;
  admin_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
  
  // Scan-specific fields
  image_url?: string;
  predicted_disease_id?: string;
  user_suggested_disease_id?: string;
  verified_disease_id?: string;
  confidence_score?: number;
  is_verified?: boolean;
  verified_by?: string;
  verified_at?: string;
  
  // Nested disease objects (from API)
  predicted_disease?: DiseaseInfo | null;
  user_suggested_disease?: DiseaseInfo | null;
  verified_disease?: DiseaseInfo | null;
}

export interface ComplaintListParams {
  page?: number;
  limit?: number;
  status?: ComplaintStatus;
  target_type?: TargetType;
  is_verified?: boolean;
}

export interface ComplaintListResponse {
  data: {
    complaints: Complaint[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ComplaintResponse {
  data: Complaint;
}

export interface UpdateComplaintStatusParams {
  status: ComplaintStatus;
  admin_notes?: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_link: string[];
  disease_link?: string;
  tags: string[];
  like_num: number;
  comment_num: number;
  share_num: number;
  status: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  like_num: number;
  status: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostResponse {
  data: Post;
}

export interface CommentResponse {
  data: Comment;
}

export interface UpdateIsDeletedParams {
  is_deleted: boolean;
}

// ============ COMPLAINT API FUNCTIONS ============

/**
 * Get all complaints (admin only)
 * GET /complaints
 */
export async function getComplaints(
  params: ComplaintListParams
): Promise<ComplaintListResponse> {
  console.log("📋 [getComplaints] Calling API with params:", params);
  try {
    const response = await request<ComplaintListResponse>("/complaints", {
      method: "GET",
      params,
    });
    console.log("✅ [getComplaints] Success:", response);
    return response;
  } catch (error) {
    console.error("❌ [getComplaints] Error:", error);
    throw error;
  }
}

/**
 * Get complaint by ID
 * GET /complaints/:id
 */
export async function getComplaintById(id: string): Promise<ComplaintResponse> {
  return request<ComplaintResponse>(`/complaints/${id}`, {
    method: "GET",
  });
}

/**
 * Update complaint status (admin only)
 * PUT /complaints/:id/status
 */
export async function updateComplaintStatus(
  id: string,
  data: UpdateComplaintStatusParams
): Promise<{ message: string; data: Complaint }> {
  return request<{ message: string; data: Complaint }>(
    `/complaints/${id}/status`,
    {
      method: "PUT",
      data,
    }
  );
}

/**
 * Delete complaint (admin only)
 * DELETE /complaints/admin/:id
 */
export async function deleteComplaint(
  id: string
): Promise<{ message: string }> {
  return request<{ message: string }>(`/complaints/admin/${id}`, {
    method: "DELETE",
  });
}

/**
 * Get unverified scan complaints (admin only)
 * GET /complaints/unverified
 */
export async function getUnverifiedComplaints(params: {
  page?: number;
  limit?: number;
}): Promise<ComplaintListResponse> {
  console.log("📋 [getUnverifiedComplaints] Calling API with params:", params);
  try {
    const response = await request<ComplaintListResponse>(
      "/complaints/unverified",
      {
        method: "GET",
        params,
      }
    );
    console.log("✅ [getUnverifiedComplaints] Success:", response);
    return response;
  } catch (error) {
    console.error("❌ [getUnverifiedComplaints] Error:", error);
    throw error;
  }
}

/**
 * Verify scan complaint (admin only)
 * POST /complaints/:id/verify
 */
export async function verifyComplaint(
  id: string,
  data: {
    verified_disease_id: string;
    is_verified?: boolean;
    admin_notes?: string;
  }
): Promise<{ message: string; data: Complaint }> {
  console.log("✅ [verifyComplaint] Verifying complaint:", id, data);
  try {
    const response = await request<{ message: string; data: Complaint }>(
      `/complaints/${id}/verify`,
      {
        method: "POST",
        data,
      }
    );
    console.log("✅ [verifyComplaint] Success:", response);
    return response;
  } catch (error) {
    console.error("❌ [verifyComplaint] Error:", error);
    throw error;
  }
}

/**
 * Get complaints count
 * GET /complaints/count
 */
export async function getComplaintsCount(params: {
  status?: string;
  target_type?: string;
  is_verified?: boolean;
}): Promise<{ data: { count: number } }> {
  try {
    const response = await request<{ data: { count: number } }>(
      "/complaints/count",
      {
        method: "GET",
        params,
      }
    );
    return response;
  } catch (error) {
    console.error("❌ [getComplaintsCount] Error:", error);
    throw error;
  }
}

/**
 * Export training data for ML
 * GET /ml/export-training-data
 */
export async function exportTrainingData(): Promise<{
  message: string;
  count: number;
  data: Array<{
    image_url: string;
    predicted_disease_id: string;
    verified_disease_id: string;
    confidence_score: number;
    created_at: string;
  }>;
}> {
  console.log("📦 [exportTrainingData] Exporting ML training data");
  try {
    const response = await request<{
      message: string;
      count: number;
      data: Array<{
        image_url: string;
        predicted_disease_id: string;
        verified_disease_id: string;
        confidence_score: number;
        created_at: string;
      }>;
    }>("/ml/export-training-data", {
      method: "GET",
    });
    console.log("✅ [exportTrainingData] Success:", response);
    return response;
  } catch (error) {
    console.error("❌ [exportTrainingData] Error:", error);
    throw error;
  }
}

// ============ CONTENT MODERATION API FUNCTIONS ============

/**
 * Get post (admin - includes deleted posts)
 * GET /admin/posts/:id
 */
export async function getAdminPost(postId: string): Promise<PostResponse> {
  return request<PostResponse>(`/admin/posts/${postId}`, {
    method: "GET",
  });
}

/**
 * Update post is_deleted status (admin only)
 * PUT /admin/posts/:id/is-deleted
 */
export async function updatePostIsDeleted(
  postId: string,
  isDeleted: boolean
): Promise<{ message: string; data: { id: string; is_deleted: boolean } }> {
  return request<{
    message: string;
    data: { id: string; is_deleted: boolean };
  }>(`/admin/posts/${postId}/is-deleted`, {
    method: "PUT",
    data: { is_deleted: isDeleted },
  });
}

/**
 * Get comment (admin - includes deleted comments)
 * GET /admin/comments/:commentId
 */
export async function getAdminComment(
  commentId: string
): Promise<CommentResponse> {
  return request<CommentResponse>(`/admin/comments/${commentId}`, {
    method: "GET",
  });
}

/**
 * Update comment is_deleted status (admin only)
 * PUT /admin/comments/:commentId/is-deleted
 */
export async function updateCommentIsDeleted(
  commentId: string,
  isDeleted: boolean
): Promise<{
  message: string;
  data: { id: string; post_id: string; is_deleted: boolean };
}> {
  return request<{
    message: string;
    data: { id: string; post_id: string; is_deleted: boolean };
  }>(`/admin/comments/${commentId}/is-deleted`, {
    method: "PUT",
    data: { is_deleted: isDeleted },
  });
}

// ============ HELPER CONSTANTS ============

export const COMPLAINT_CATEGORIES = [
  { value: "SPAM", label: "Spam / Quảng cáo", color: "orange" },
  { value: "HARASSMENT", label: "Quấy rối / Bắt nạt", color: "red" },
  { value: "HATE_SPEECH", label: "Phát ngôn thù địch", color: "volcano" },
  { value: "VIOLENCE", label: "Nội dung bạo lực", color: "magenta" },
  { value: "MISINFORMATION", label: "Thông tin sai lệch", color: "purple" },
  {
    value: "INAPPROPRIATE",
    label: "Nội dung không phù hợp",
    color: "geekblue",
  },
  { value: "WRONG_RESULT", label: "Kết quả scan sai", color: "cyan" },
  { value: "OTHER", label: "Lý do khác", color: "default" },
];

export const COMPLAINT_STATUSES = [
  { value: "PENDING", label: "Chờ xử lý", color: "warning" },
  { value: "REVIEWED", label: "Đang xem xét", color: "processing" },
  { value: "RESOLVED", label: "Đã giải quyết", color: "success" },
  { value: "REJECTED", label: "Từ chối", color: "error" },
];

export const TARGET_TYPES = [
  { value: "POST", label: "Bài viết" },
  { value: "COMMENT", label: "Bình luận" },
  { value: "SCAN", label: "Kết quả scan" },
];
