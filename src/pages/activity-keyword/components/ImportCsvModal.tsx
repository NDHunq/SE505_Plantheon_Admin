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
      message.error("Please select a file to import");
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
          `Successfully imported ${response.success} out of ${response.total} rows!`
        );
        onSuccess?.();
        return true;
      } else {
        message.warning(
          `Imported ${response.success} out of ${response.total} rows with ${response.errors.length} errors`
        );
        return false;
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
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
    },
  ];

  return (
    <ModalForm
      title="Import Keywords from CSV"
      trigger={<Button icon={<UploadOutlined />}>Import CSV</Button>}
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
          submitText: "Import",
        },
        submitButtonProps: {
          loading: importing,
        },
      }}
      onFinish={handleImport}
    >
      <Alert
        message="CSV Format (8 columns)"
        description={
          <div>
            <Text strong>Required columns:</Text>
            <br />
            <Text code>ClassName, keywordName, keywordType</Text>
            <br />
            <br />
            <Text strong>Optional columns:</Text>
            <br />
            <Text code>
              keywordDescription, keywordDayOffset, keywordIsFreeTime,
              keywordHourTime, timeDuration
            </Text>
            <br />
            <br />
            <Text type="secondary">
              Note: The import will find disease by ClassName and link the
              keyword to it.
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
        <p className="ant-upload-text">Click or drag CSV file to this area</p>
        <p className="ant-upload-hint">Support for .csv files only</p>
      </Dragger>

      {result && (
        <div style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Alert
              message={
                <span>
                  Total: {result.total} | Success:{" "}
                  <Text type="success">{result.success}</Text> | Errors:{" "}
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
