"use client";

import React, { useState } from "react";
import { FaHome, FaUser, FaSmile } from "react-icons/fa";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<
    { id: number; text: string; bgColor: string; date: string }[]
  >([]);
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");

  // Helper to format current date and time
  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePost = () => {
    if (!text.trim()) return;

    const newPost = {
      id: posts.length + 1,
      text,
      bgColor,
      date: getFormattedDate(),
    };

    setPosts([newPost, ...posts]); // Add new post to the top of the list
    setText(""); // Clear input field

    // Add API call for saving post to the database here
    // Example: await fetch("/api/posts", { method: "POST", body: JSON.stringify(newPost) });
  };

  const handleEmoji = () => {
    setText((prev) => `${prev}😊`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-blue-500 text-white">
        <FaHome size={24} />
        <FaUser size={24} />
      </header>

      {/* Post Input Section */}
      <div className="flex flex-col items-center p-4 bg-white shadow-md">
        <textarea
          className="w-full h-24 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ backgroundColor: bgColor }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
        />
        <div className="flex items-center mt-2 space-x-4">
          <button
            className="bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition"
            onClick={handleEmoji}
            title="Add Emoji"
          >
            <FaSmile />
          </button>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-10 h-10 p-0 border-none "
            title="Background Color"
          />
          <button
            className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition"
            onClick={handlePost}
          >
            Post
          </button>
        </div>
      </div>

      {/* Posts Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="mb-4 p-4 rounded-lg shadow-lg"
            style={{ backgroundColor: post.bgColor }}
          >
            <p className="text-gray-800">{post.text}</p>
            <p className="text-sm text-gray-500 mt-2">{post.date}</p>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-gray-500 text-center">
            No posts yet. Be the first to share something!
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
