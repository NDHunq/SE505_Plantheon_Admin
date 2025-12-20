import {
  Comment,
  Complaint,
  getAdminComment,
  getAdminPost,
  Post,
  updateCommentIsDeleted,
  updatePostIsDeleted,
} from "@/services/complaint";
import { ProDescriptions } from "@ant-design/pro-components";
import {
  Button,
  Image,
  message,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";

interface ViewTargetContentModalProps {
  complaint: Complaint;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

const ViewTargetContentModal: React.FC<ViewTargetContentModalProps> = ({
  complaint,
  trigger,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [content, setContent] = useState<Post | Comment | null>(null);

  const isPost = complaint.target_type === "POST";

  useEffect(() => {
    if (open) {
      fetchContent();
    }
  }, [open]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      if (isPost) {
        const response = await getAdminPost(complaint.target_id);
        setContent(response.data);
      } else {
        const response = await getAdminComment(complaint.target_id);
        setContent(response.data);
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Không thể tải nội dung";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDelete = async () => {
    if (!content) return;

    setActionLoading(true);
    try {
      const newDeletedState = !content.is_deleted;

      if (isPost) {
        await updatePostIsDeleted(complaint.target_id, newDeletedState);
        message.success(
          newDeletedState
            ? "Xóa bài viết thành công"
            : "Khôi phục bài viết thành công"
        );
      } else {
        await updateCommentIsDeleted(complaint.target_id, newDeletedState);
        message.success(
          newDeletedState
            ? "Xóa bình luận thành công"
            : "Khôi phục bình luận thành công"
        );
      }

      // Refresh content
      await fetchContent();
      onSuccess?.();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Không thể cập nhật nội dung";
      message.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const renderPostContent = (post: Post) => (
    <ProDescriptions<Post>
      column={1}
      dataSource={post}
      columns={[
        {
          title: "Nội Dung",
          dataIndex: "content",
          valueType: "text",
        },
        {
          title: "Hình Ảnh",
          dataIndex: "image_link",
          render: (_, record) => {
            const images = record.image_link || [];
            if (images.length === 0) return "-";
            return (
              <Image.PreviewGroup>
                <Space wrap>
                  {images.map((url, index) => (
                    <Image
                      key={index}
                      src={url}
                      width={100}
                      height={100}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesGxwYGQHFAAA=="
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            );
          },
        },
        {
          title: "Thẻ",
          dataIndex: "tags",
          render: (_, record) => {
            const tags = record.tags || [];
            if (tags.length === 0) return "-";
            return (
              <Space wrap>
                {tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </Space>
            );
          },
        },
        {
          title: "Lượt Thích",
          dataIndex: "like_num",
        },
        {
          title: "Bình Luận",
          dataIndex: "comment_num",
        },
        {
          title: "Trạng Thái",
          dataIndex: "is_deleted",
          render: (_, record) => (
            <Tag color={record.is_deleted ? "red" : "green"}>
              {record.is_deleted ? "Đã Xóa" : "Hoạt Động"}
            </Tag>
          ),
        },
        {
          title: "Ngày Tạo",
          dataIndex: "created_at",
          valueType: "dateTime",
        },
      ]}
    />
  );

  const renderCommentContent = (comment: Comment) => (
    <ProDescriptions<Comment>
      column={1}
      dataSource={comment}
      columns={[
        {
          title: "Nội Dung",
          dataIndex: "content",
          valueType: "text",
        },
        {
          title: "Lượt Thích",
          dataIndex: "like_num",
        },
        {
          title: "Trạng Thái",
          dataIndex: "is_deleted",
          render: (_, record) => (
            <Tag color={record.is_deleted ? "red" : "green"}>
              {record.is_deleted ? "Đã Xóa" : "Hoạt Động"}
            </Tag>
          ),
        },
        {
          title: "Ngày Tạo",
          dataIndex: "created_at",
          valueType: "dateTime",
        },
      ]}
    />
  );

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Modal
        title={`Xem Nội Dung ${isPost ? "Bài Viết" : "Bình Luận"}`}
        open={open}
        onCancel={() => setOpen(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>
            Đóng
          </Button>,
          content && (
            <Popconfirm
              key="toggle-delete"
              title={
                content.is_deleted
                  ? `Khôi Phục ${isPost ? "Bài Viết" : "Bình Luận"}`
                  : `Xóa ${isPost ? "Bài Viết" : "Bình Luận"}`
              }
              description={
                content.is_deleted
                  ? `Bạn có chắc chắn muốn khôi phục ${
                      isPost ? "bài viết" : "bình luận"
                    } này?`
                  : `Bạn có chắc chắn muốn xóa ${
                      isPost ? "bài viết" : "bình luận"
                    } này?`
              }
              onConfirm={handleToggleDelete}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type={content.is_deleted ? "primary" : "primary"}
                danger={!content.is_deleted}
                loading={actionLoading}
              >
                {content.is_deleted
                  ? `Khôi Phục ${isPost ? "Bài Viết" : "Bình Luận"}`
                  : `Xóa ${isPost ? "Bài Viết" : "Bình Luận"}`}
              </Button>
            </Popconfirm>
          ),
        ]}
      >
        <Spin spinning={loading}>
          {content && (
            <>
              {isPost
                ? renderPostContent(content as Post)
                : renderCommentContent(content as Comment)}
            </>
          )}
        </Spin>
      </Modal>
    </>
  );
};

export default ViewTargetContentModal;
