"use client";

import {uploadImageToS3, createPresignedUrlWithClient} from "@/lib/s3";
import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./MyEditor.scss";

const MyEditor = ({ blogid }) => {
  const editor = useRef();
  const [value, setValue] = useState("");

  const [sampleContent, setSampleContent] = useState([]);

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
    "align"
  ];

  const onSaveBlog = async () => {
    const contents = editor.current.getEditor().getContents();
    
    const imageOps = await contents.ops.filter((op) =>
      op.insert?.image?.startsWith("data:image")
    ); // Find base64 images

    let uploadedImages = {};

    // Upload all images to S3
    for (let op of imageOps) {
      const base64Image = op.insert.image;
      const fileName = await uploadImageToS3(base64Image); // Function to upload and return Filename in S3
      uploadedImages[base64Image] = fileName; // Map base64 to Filename in S3
    }

    // Replace base64 images with their respective S3 URLs
    contents.ops = await contents.ops.map((op) => {
      if (op.insert?.image && uploadedImages[op.insert.image]) {
        return { ...op, insert: { image: uploadedImages[op.insert.image] } };
      }
      return op;
    });

    console.log("Final Delta with S3 Filenames:", JSON.stringify(contents.ops));

    // [{"insert":"My first blog"},{"attributes":{"header":1},"insert":"\n"},{"insert":"This is just a test blog\n"},{"insert":{"image":"screenshots/1741535406094-image-1741535406094.png"}},{"insert":"\n\nHow my journey started?"},{"attributes":{"header":2},"insert":"\n"},{"insert":"\nasdasdassada\n\n"},{"insert":{"image":"screenshots/1741535407361-image-1741535407361.png"}},{"insert":"\n"}]

    // Save the content to DynamoDB
    const response = await fetch(`/api/blogs/${blogid}`, {
      method: "PUT",
      body: { contents: contents.ops },
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const fetchImages = async (deltaOps) => {
    for (let op of deltaOps) {
      if (op.insert && op.insert.image) {
        op.insert.image = await createPresignedUrlWithClient(op.insert.image); // Replace with signed URL
      }
    }
    return deltaOps;
  };
  
  const onLoadBlog = async () => {

    // Load the content from DynamoDB
    const response = await fetch(`/api/blogs/${blogid}`);
    const data = await response.json();
    const contents = data.content;

    console.log("Loaded Contents:", JSON.stringify(contents));

    const modifiedOps = contents.L.map((content) => {
      let op = {};
      if (content.M.type.S === "heading" || content.M.level) {
        op.insert = content.M.text.S;
        op.attributes = { header: parseInt(content.M.level.N) };
      } else if (content.M.type.S === "image") {
        op.insert = { image: content.M.src.S };
      } else {
        op.insert = content.M.text.S;
      }
      return op;
    });
    console.log("Loaded Delta:", JSON.stringify(modifiedOps));

    contents.ops = await fetchImages(modifiedOps); // Fetch signed URLs for images
    console.log("Loaded Delta with Signed URLs:", JSON.stringify(contents.ops));
    
    editor.current.getEditor().setContents(contents);
  };

  const [content, setContent] = useState("");

  return (
    <>
      <ReactQuill
        ref={editor}
        theme="snow"
        value={value}
        modules={modules}
        formats={formats}
        onChange={() => {
          setValue();
          setContent();
        }}
      />
      <button onClick={onSaveBlog}>Save Blog</button>
      <button onClick={onLoadBlog}>Load Blog</button>
      <br />
      <br />
      <br />
    </>
  );
};
export default MyEditor;
