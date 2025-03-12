import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./index.scss";

const Editor = ({
  componentref,
  value,
  setValue,
  setContent,
  onSaveBlog,
  onCancel,
  adminMode = false,
}) => {
  const modules = {
    toolbar: [
      [{ align: [] }],
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
      //   [{ align: "left" }, { align: "center" }, { align: "right" }],
      ["clean"],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  };
  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "indent",
    "link",
    "image",
    "video",
    "align",
  ];

  return (
    <>
      <ReactQuill
        ref={componentref}
        theme="snow"
        value={value}
        modules={modules}
        formats={formats}
        onChange={() => {
          setValue();
          setContent();
        }}
      />
      {adminMode && (
        <button className="save-button" onClick={onSaveBlog}>
          Save Blog
        </button>
      )}
      {adminMode && (
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </>
  );
};

export default Editor;
