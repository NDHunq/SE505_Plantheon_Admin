import { getDiseases, Disease } from "@/services/disease";
import { Select, Spin } from "antd";
import React, { useEffect, useState } from "react";

interface DiseaseSelectorProps {
  value?: string;
  onChange?: (diseaseId: string) => void;
  placeholder?: string;
}

const DiseaseSelector: React.FC<DiseaseSelectorProps> = ({
  value,
  onChange,
  placeholder = "Chọn bệnh cây...",
}) => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async (search?: string) => {
    setLoading(true);
    try {
      const response = await getDiseases({
        page: 1,
        limit: 100,
        search: search,
      });
      setDiseases(response.data.diseases);
    } catch (error) {
      console.error("Failed to fetch diseases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      fetchDiseases(value);
    } else {
      fetchDiseases();
    }
  };

  return (
    <Select
      showSearch
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      onSearch={handleSearch}
      filterOption={false}
      loading={loading}
      notFoundContent={loading ? <Spin size="small" /> : "Không tìm thấy"}
      style={{ width: "100%" }}
      optionLabelProp="label"
    >
      {diseases.map((disease) => (
        <Select.Option key={disease.id} value={disease.id} label={disease.name}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {disease.image_link && disease.image_link.length > 0 && (
              <img
                src={disease.image_link[0]}
                alt={disease.name}
                style={{
                  width: 24,
                  height: 24,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            )}
            <div>
              <div style={{ fontWeight: 500 }}>{disease.name}</div>
              <div style={{ fontSize: 12, color: "#999" }}>
                {disease.plant_name} - {disease.type}
              </div>
            </div>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};

export default DiseaseSelector;
