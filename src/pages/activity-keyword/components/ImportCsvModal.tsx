import { ImportCsvResult, importKeywordsCsv } from "@/services/activityKeyword";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { ModalForm } from "@ant-design/pro-components";
import { Alert, Button, message, Space, Table, Typography, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import React, { useState } from "react";

const { Dragger } = Upload;
const { Text } = Typography;

interface ImportCsvModalProps {
  onSuccess?: () => void;
}

const ImportCsvModal: React.FC<ImportCsvModalProps> = ({ onSuccess }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportCsvResult | null>(null);

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.error("Vui lòng chọn tệp để nhập");
      return false;
    }

    const file = fileList[0].originFileObj as File;
    setImporting(true);

    try {
      const response = await importKeywordsCsv(file);
      setResult(response);

      // Check if errors array exists and has length
      const hasErrors = response.errors && response.errors.length > 0;

      if (!hasErrors) {
        message.success(
          `Nhập thành công ${response.success} trong tổng số ${response.total} dòng!`
        );
        onSuccess?.();
        return true;
      } else {
        message.warning(
          `Đã nhập ${response.success} trong tổng số ${response.total} dòng với ${response.errors.length} lỗi`
        );
        return false;
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error || error?.message || "Nhập thất bại";
      message.error(errorMsg);
      return false;
    } finally {
      setImporting(false);
    }
  };

  const errorColumns = [
    {
      title: "Dòng",
      dataIndex: "row",
      key: "row",
      width: 80,
    },
    {
      title: "Lỗi",
      dataIndex: "error",
      key: "error",
    },
    {
      title: "Chi Tiết",
      dataIndex: "details",
      key: "details",
    },
  ];

  return (
    <ModalForm
      title="Nhập Từ Khóa Từ CSV"
      trigger={<Button icon={<UploadOutlined />}>Nhập CSV</Button>}
      width={700}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setFileList([]);
          setResult(null);
        },
      }}
      submitter={{
        searchConfig: {
          submitText: "Nhập",
        },
        submitButtonProps: {
          loading: importing,
        },
      }}
      onFinish={handleImport}
    >
      <Alert
        message="Định Dạng CSV (8 cột)"
        description={
          <div>
            <Text strong>Các cột bắt buộc:</Text>
            <br />
            <Text code>ClassName, keywordName, keywordType</Text>
            <br />
            <br />
            <Text strong>Các cột tùy chọn:</Text>
            <br />
            <Text code>
              keywordDescription, keywordDayOffset, keywordIsFreeTime,
              keywordHourTime, timeDuration
            </Text>
            <br />
            <br />
            <Text type="secondary">
              Lưu ý: Quá trình nhập sẽ tìm bệnh theo ClassName và liên kết
              từ khóa với nó.
            </Text>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Dragger
        accept=".csv"
        maxCount={1}
        fileList={fileList}
        beforeUpload={() => false}
        onChange={({ fileList: newFileList }) => {
          setFileList(newFileList);
          setResult(null);
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Nhấp hoặc kéo thả tệp CSV vào đây</p>
        <p className="ant-upload-hint">Chỉ hỗ trợ tệp .csv</p>
      </Dragger>

      {result && (
        <div style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Alert
              message={
                <span>
                  Tổng: {result.total} | Thành công:{" "}
                  <Text type="success">{result.success}</Text> | Lỗi:{" "}
                  <Text type="danger">{result.errors?.length || 0}</Text>
                </span>
              }
              type={(result.errors?.length || 0) > 0 ? "warning" : "success"}
              showIcon
            />

            {result.errors && result.errors.length > 0 && (
              <Table
                columns={errorColumns}
                dataSource={result.errors.map((e, i) => ({ ...e, key: i }))}
                size="small"
                pagination={false}
                scroll={{ y: 200 }}
              />
            )}
          </Space>
        </div>
      )}
    </ModalForm>
  );
};

export default ImportCsvModal;
