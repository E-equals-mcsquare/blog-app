'use client';

import { useState } from "react";

const NewBlog = () => {
    const [keywords, setKeywords] = useState("");
    const [link, setLink] = useState("");
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/blogs/new", {
                method: "POST",
                body: JSON.stringify({ keywords, link, description, title }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                alert("Blog added successfully");
                setKeywords("");
                setLink("");
                setDescription("");
                setTitle("");
            } else {
                const errorData = await response.json();
                console.log(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
            />
            <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Keywords"
            />
            <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Link"
            />
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
            />
            <button type="submit">Create Blog</button>
        </form>
    );
}

export default NewBlog; 