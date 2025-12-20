import MarkdownIt from "markdown-it";
import React from "react";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import "./style.css";

// Initialize markdown parser
const mdParser = new MarkdownIt();

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder,
  style,
}) => {
  return (
    <MdEditor
      value={value || ""}
      style={{ height: "300px", ...style }}
      renderHTML={(text) => mdParser.render(text)}
      onChange={({ text }) => onChange?.(text)}
      placeholder={placeholder}
      config={{
        view: {
          menu: true,
          md: true,
          html: true,
        },
      }}
    />
  );
};

export default MarkdownEditor;
