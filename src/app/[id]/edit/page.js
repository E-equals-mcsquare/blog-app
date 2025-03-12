"use client";

import { uploadImageToS3 } from "@/lib/s3";
import { use, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./page.scss";
import Editor from "@/components/editor";
import { Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { useRouter, useParams } from "next/navigation";

const EditArticle = () => {
  const params = useParams();
  const router = useRouter();
  const editor = useRef();
  const [value, setValue] = useState("");

  const keywords = useRef();
  const description = useRef();
  const title = useRef();

  const [blogcontent, setBlogContent] = useState([{}]);

  const onSaveBlog = async () => {
    try {
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

      console.log(
        "Final Delta with S3 Filenames:",
        JSON.stringify(contents.ops)
      );

      setBlogContent(contents.ops);
      handleShow();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const blogId = title.current.value.toLowerCase().replace(/\s+/g, "");
      const response = await fetch("/api/blogs/new", {
        method: "POST",
        body: JSON.stringify({
          blogId: blogId,
          title: title.current.value,
          s3Filename: blogS3fileName,
          description: description.current.value,
          keywords: keywords.current.value,
          content: blogcontent,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      handleClose();
      toast.success("Article created successfully");
      router.replace("/");
    } catch (error) {
      toast.error("Error creating article");
      console.error(error);
    }
  };

  const [content, setContent] = useState("");

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const fetchBlogContent = async () => {
      const { id } = params;
      if (id) {
        try {
          const response = await fetch(`/api/blogs/${id}`);
          const data = await response.json();
          let contents = await data.content.content;
          console.log("Loaded Content:", JSON.stringify(contents));

          editor.current.getEditor().setContents(contents);

          title.current.value = data.title;
          description.current.value = data.description;
          keywords.current.value = data.keywords;
        } catch (error) {
          console.error("Error fetching blog content:", error);
        }
      }
    };

    fetchBlogContent();
  }, [router.query]);

  return (
    <>
      <Editor
        componentref={editor}
        value={value}
        setValue={setValue}
        setContent={setContent}
        onSaveBlog={onSaveBlog}
        adminMode
      />
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Enter Blog Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <label>Title:</label>
            <input ref={title} type="text" placeholder="Title" />
            <label>Description:</label>
            <textarea ref={description} type="text" placeholder="Description" />
            <label>Keywords:</label>
            <input ref={keywords} type="text" placeholder="Keywords" />
            <div className="footer">
              <button type="submit" className="save-button">
                Save
              </button>
              <button onClick={handleClose} className="cancel-button">
                Close
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditArticle;
