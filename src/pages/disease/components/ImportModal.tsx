import { importDiseases, ImportResult } from "@/services/disease";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { ModalForm } from "@ant-design/pro-components";
import { Alert, Button, message, Space, Table, Typography, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import React, { useState } from "react";

const { Dragger } = Upload;
const { Text } = Typography;

interface ImportModalProps {
  onSuccess?: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onSuccess }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.error("Please select a file to import");
      return false;
    }

    const file = fileList[0].originFileObj as File;
    setImporting(true);

    try {
      const response = await importDiseases(file);
      setResult(response.data);

      if (response.data.error_count === 0) {
        message.success(
          `Successfully imported ${response.data.success_count} diseases!`
        );
        onSuccess?.();
        return true;
      } else {
        message.warning(
          `Imported ${response.data.success_count} diseases with ${response.data.error_count} errors`
        );
        return false; // Keep modal open to show errors
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error || error?.message || "Import failed";
      message.error(errorMsg);
      return false;
    } finally {
      setImporting(false);
    }
  };

  const errorColumns = [
    {
      title: "Row",
      dataIndex: "row",
      key: "row",
      width: 80,
    },
    {
      title: "Error",
      dataIndex: "error",
      key: "error",
    },
  ];

  return (
    <ModalForm
      title="Import Diseases from CSV/Excel"
      trigger={<Button icon={<UploadOutlined />}>Import</Button>}
      width={600}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setFileList([]);
          setResult(null);
        },
      }}
      submitter={{
        searchConfig: {
          submitText: "Import",
        },
        submitButtonProps: {
          loading: importing,
        },
      }}
      onFinish={handleImport}
    >
      <Alert
        message="CSV/Excel Format"
        description={
          <div>
            <Text>
              Required columns: <Text strong>name, class_name, type</Text>
            </Text>
            <br />
            <Text>
              Optional columns: description, solution, image_link
              (comma-separated URLs), plant_name
            </Text>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Dragger
        accept=".csv,.xlsx"
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
        <p className="ant-upload-text">Click or drag file to this area</p>
        <p className="ant-upload-hint">Support for .csv and .xlsx files</p>
      </Dragger>

      {result && (
        <div style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Alert
              message={
                <span>
                  Total: {result.total_rows} | Success:{" "}
                  <Text type="success">{result.success_count}</Text> | Errors:{" "}
                  <Text type="danger">{result.error_count}</Text>
                </span>
              }
              type={result.error_count > 0 ? "warning" : "success"}
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

export default ImportModal;
