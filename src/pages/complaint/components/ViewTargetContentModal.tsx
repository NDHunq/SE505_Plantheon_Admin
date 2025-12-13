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
        "Failed to load content";
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
            ? "Post deleted successfully"
            : "Post restored successfully"
        );
      } else {
        await updateCommentIsDeleted(complaint.target_id, newDeletedState);
        message.success(
          newDeletedState
            ? "Comment deleted successfully"
            : "Comment restored successfully"
        );
      }

      // Refresh content
      await fetchContent();
      onSuccess?.();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update content";
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
          title: "Content",
          dataIndex: "content",
          valueType: "text",
        },
        {
          title: "Images",
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
          title: "Tags",
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
          title: "Likes",
          dataIndex: "like_num",
        },
        {
          title: "Comments",
          dataIndex: "comment_num",
        },
        {
          title: "Status",
          dataIndex: "is_deleted",
          render: (_, record) => (
            <Tag color={record.is_deleted ? "red" : "green"}>
              {record.is_deleted ? "Deleted" : "Active"}
            </Tag>
          ),
        },
        {
          title: "Created At",
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
          title: "Content",
          dataIndex: "content",
          valueType: "text",
        },
        {
          title: "Likes",
          dataIndex: "like_num",
        },
        {
          title: "Status",
          dataIndex: "is_deleted",
          render: (_, record) => (
            <Tag color={record.is_deleted ? "red" : "green"}>
              {record.is_deleted ? "Deleted" : "Active"}
            </Tag>
          ),
        },
        {
          title: "Created At",
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
        title={`View ${isPost ? "Post" : "Comment"} Content`}
        open={open}
        onCancel={() => setOpen(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>
            Close
          </Button>,
          content && (
            <Popconfirm
              key="toggle-delete"
              title={
                content.is_deleted
                  ? `Restore ${isPost ? "Post" : "Comment"}`
                  : `Delete ${isPost ? "Post" : "Comment"}`
              }
              description={
                content.is_deleted
                  ? `Are you sure you want to restore this ${
                      isPost ? "post" : "comment"
                    }?`
                  : `Are you sure you want to delete this ${
                      isPost ? "post" : "comment"
                    }?`
              }
              onConfirm={handleToggleDelete}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type={content.is_deleted ? "primary" : "primary"}
                danger={!content.is_deleted}
                loading={actionLoading}
              >
                {content.is_deleted
                  ? `Restore ${isPost ? "Post" : "Comment"}`
                  : `Delete ${isPost ? "Post" : "Comment"}`}
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
