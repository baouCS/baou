"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  FaHome,
  FaUser,
  FaSmile,
  FaEllipsisV,
  FaThumbsUp,
  FaThumbsDown,
} from "react-icons/fa";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { toSentenceCase } from "@/app/utils/toSentenceCase";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<
    {
      id: number;
      text: string;
      status: string;
      bgColor: string;
      date: string;
      likes: number;
      dislikes: number;
    }[]
  >([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Neutral");
  const [editPostId, setEditPostId] = useState<number | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    setText((prev) => `${prev}${emojiData.emoji}`);
  }, []);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target as Node)
    ) {
      setIsEmojiPickerOpen(false);
    }
  };

  const statusColors: Record<string, string> = {
    Neutral: "#ffffff",
    Low: "#e2f7e2",
    Medium: "#fff3cd",
    High: "#f8d7da",
  };

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
      text: text.replace(/(\r?\n\s*\n){3,}/g, "\n\n"),
      status,
      bgColor: statusColors[status],
      date: getFormattedDate(),
      likes: 0,
      dislikes: 0,
    };

    setPosts([newPost, ...posts]);
    setText("");
    setStatus("Neutral");
  };

  const handleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleDislike = (id: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, dislikes: post.dislikes + 1 } : post
      )
    );
  };

  const handleDelete = (id: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const handleEdit = (id: number) => {
    const postToEdit = posts.find((post) => post.id === id);
    if (postToEdit) {
      setEditPostId(id);
      setText(postToEdit.text);
      setStatus(postToEdit.status);
    }
    setActiveDropdownId(null); // Close dropdown
  };

  const handleUpdate = () => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === editPostId
          ? {
              ...post,
              text: text.replace(/(\r?\n\s*\n){3,}/g, "\n\n"),
              status,
              bgColor: statusColors[status],
            }
          : post
      )
    );
    setEditPostId(null);
    setText("");
    setStatus("Low");
  };

  const toggleDropdown = (id: number) => {
    setActiveDropdownId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (isEmojiPickerOpen) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isEmojiPickerOpen]);

  return (
    <div className="flex  flex-col items-center  h-screen bg-gray-100 overflow-hidden">
      <header className="flex justify-between w-full items-center p-4 bg-blue-500 text-white">
        <FaHome size={24} />
        <FaUser size={24} />
      </header>

      <div className="flex items-center w-full max-w-3xl flex-col lg:px-4 lg:bg-gray-200 h-full">
        <div className="relative rounded-b-lg w-full flex flex-col items-center p-4 bg-white shadow-md">
          {/* Emoji Picker */}
          {isEmojiPickerOpen && (
            <div
              ref={emojiPickerRef}
              className="absolute top-full mt-2 z-50 bg-white shadow-lg rounded-lg"
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <textarea
            className="w-full text-gray-500 h-24 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
          />
          <div className="flex items-center mt-2 space-x-4">
            <div className="">
              <button
                className="bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition"
                onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
              >
                <FaSmile />
              </button>
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500"
            >
              {Object.entries(statusColors).map(([key, color]) => (
                <option
                  key={key}
                  value={key}
                  style={{ backgroundColor: color }}
                >
                  {key}
                </option>
              ))}
            </select>
            <button
              className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition"
              onClick={editPostId === null ? handlePost : handleUpdate}
            >
              {editPostId === null ? "Post" : "Update"}
            </button>
          </div>
        </div>
        <div className=" flex-1 w-full overflow-y-auto  p-4 pb-20">
          {posts.map((post) => (
            <div
              key={post.id}
              className="mb-4 p-4 rounded-lg shadow-lg  "
              style={{ backgroundColor: post.bgColor }}
            >
              <div className="flex justify-between gap-2">
                <div className="w-full">
                  <p className="text-gray-600 font-medium whitespace-pre-wrap p-2 bg-slate-100 shadow-inner bg-opacity-10 border-gray-500 border-b border-opacity-5 rounded-md py-4 ">
                    {toSentenceCase(post.text)}
                  </p>
                </div>
                <div className="relative">
                  <button
                    className="text-gray-300 hover:text-gray-500 focus:outline-none"
                    onClick={() => toggleDropdown(post.id)}
                  >
                    <FaEllipsisV />
                  </button>
                  {activeDropdownId === post.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
                      <button
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => handleEdit(post.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="block px-4 py-2 text-red-600 hover:bg-gray-100"
                        onClick={() => handleDelete(post.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 justify-between">
                <p className="text-xs text-gray-500 mt-4">{post.date}</p>
                <div className="flex justify-end space-x-4 mt-2">
                  <button
                    className="flex items-center text-gray-500 hover:text-blue-600 transition"
                    onClick={() => handleLike(post.id)}
                  >
                    <FaThumbsUp className="mr-1" />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    className="flex items-center text-gray-500 hover:text-red-600 transition"
                    onClick={() => handleDislike(post.id)}
                  >
                    <FaThumbsDown className="mr-1" />
                    <span>{post.dislikes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-gray-500 text-center">
              No posts yet. Be the first to share something!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
