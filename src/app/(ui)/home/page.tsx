"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { FaSmile, FaEllipsisV } from "react-icons/fa";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { toSentenceCase } from "@/app/utils/toSentenceCase";
import Header from "@/app/components/header";
import { auth } from "@/services/firebaseConfig";
import { getFormattedDate } from "@/app/utils/formatDate";
import Swal from "sweetalert2";

import {
  addPost,
  fetchPosts,
  updatePost,
  deletePost,
} from "@/app/api/post/data";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<
    {
      docId: string;
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
  const [docId, setDocId] = useState<string>("");
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const skeletonStyle = "animate-pulse bg-gray-300 rounded-md";

  const currentUser = auth.currentUser?.email;

  const fetchData = async () => {
    try {
      const result = await fetchPosts();
      if (result.posts) {
        // Add the new posts to the state only if they don't already exist
        setPosts((prevPosts) => {
          const newPosts = result.posts.filter(
            (newPost) =>
              !prevPosts.some((existingPost) => existingPost.id === newPost.id)
          );

          // Return the updated posts array with new posts added
          setLoading(false);
          return [...newPosts, ...prevPosts];
        });
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

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

  const handlePost = async () => {
    if (!text.trim()) return;

    // Prepare the new post object (without docId initially)
    const newPost = {
      id: posts.length + 1,
      text: text.replace(/(\r?\n\s*\n){3,}/g, "\n\n"),
      status,
      bgColor: statusColors[status],
      date: getFormattedDate(),
    };

    try {
      // Use the addPost function to add the new post
      const result = await addPost(newPost);

      if (result.success && result.post) {
        // Include the docId returned from the API into the post object
        const postWithDocId = {
          ...newPost,
          docId: result.post.docId ?? "",
          likes: result.post.likes ?? 0,
          dislikes: result.post.dislikes ?? 0,
        };

        // Update the state with the new post
        setPosts([postWithDocId, ...posts]);
        // Update the state with the new post
        setPosts([postWithDocId, ...posts]);
      } else {
        console.error("Failed to add post:", result.message);
      }
    } catch (error) {
      console.error("Error adding post:", error);
    }

    // Reset the input fields
    setText("");
    setStatus("Neutral");
  };

  const handleDelete = async (id: number, docId: string) => {
    try {
      // Call the delete API
      const result = await deletePost(docId);

      if (result.success) {
        // Remove the post from the local state
        setPosts((prev) => prev.filter((post) => post.docId !== docId));
      } else {
        console.error(result.message || "Failed to delete the post");
      }
    } catch (error) {
      console.error("Error during delete operation: ", error);
    }
  };

  const handleEdit = (id: number, docId: string) => {
    const postToEdit = posts.find((post) => post.id === id);
    if (postToEdit) {
      setDocId(docId);
      setEditPostId(id);
      setText(postToEdit.text);
      setStatus(postToEdit.status);
    }
    setActiveDropdownId(null); // Close dropdown
  };

  const handleUpdate = async () => {
    try {
      // Build the updated post data
      const updatedData = {
        text: text.replace(/(\r?\n\s*\n){3,}/g, "\n\n"),
        status,
        bgColor: statusColors[status],
      };

      // Call the update API
      const response = await updatePost({
        docId: docId, // Pass the document ID of the post to update
        updates: updatedData,
      });

      if (response.success) {
        // Update the local state only if the Firestore update is successful
        setPosts((prev) =>
          prev.map((post) =>
            post.id === editPostId ? { ...post, ...updatedData } : post
          )
        );

        // Clear edit state
        setEditPostId(null);
        setText("");
        setStatus("Low");

        // Show success notification
        Swal.fire({
          icon: "success",
          title: "Post Updated",
          text: "The post has been updated successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        console.error("Failed to update the post:", response.message);

        // Show error notification
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Failed to update the post. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error during post update:", error);

      // Show error notification
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "An error occurred while updating the post. Please try again later.",
      });
    }
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex  flex-col items-center  h-screen bg-gray-100 overflow-hidden">
      <Header />

      <div className="flex items-center w-full max-w-3xl flex-col lg:px-4 lg:bg-gray-200 h-full">
        {currentUser && currentUser.toLowerCase() == "admin@gmail.com" ? (
          <div className="relative  rounded-b-lg w-full flex flex-col items-center p-4 bg-white shadow-md">
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
              className="w-full text-gray-500  h-24 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        ) : (
          ""
        )}

        <div className=" flex-1 w-full overflow-y-auto  p-4 pb-20">
          {loading
            ? // Skeleton Loader
              Array(5)
                .fill(0) // Repeat the skeleton 5 times (adjust as needed)
                .map((_, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 rounded-lg shadow-lg bg-white"
                  >
                    <div className="flex justify-between gap-2">
                      <div className="w-full">
                        <div className={`h-10 ${skeletonStyle}`} />
                      </div>
                    </div>
                    <div className="flex gap-4 justify-between">
                      <div className={`w-32 h-4 mt-6 ${skeletonStyle}`} />
                      <div className="flex justify-end space-x-2 mt-2">
                        <div className={`w-8 h-8 ${skeletonStyle}`} />
                        <div className={`w-8 h-8 ${skeletonStyle}`} />
                      </div>
                    </div>
                  </div>
                ))
            : // Render posts
              posts.map((post) => (
                <div
                  key={post.id}
                  className="mb-4 p-4 rounded-lg shadow-lg"
                  style={{ backgroundColor: post.bgColor }}
                >
                  <div className="flex justify-between gap-2">
                    <div className="w-full">
                      <p className="text-gray-500 font-medium whitespace-pre-wrap p-2 bg-slate-100 shadow-inner bg-opacity-10 border-gray-500 border-b border-opacity-5 rounded-md py-4">
                        {toSentenceCase(post.text)}
                      </p>
                    </div>
                    {currentUser == "admin@gmail.com" && (
                      <div className="relative">
                        <button
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                          onClick={() => toggleDropdown(post.id)}
                        >
                          <FaEllipsisV />
                        </button>
                        {activeDropdownId === post.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
                            <button
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => handleEdit(post.id, post.docId)}
                            >
                              Edit
                            </button>
                            <button
                              className="block px-4 py-2 text-red-600 hover:bg-gray-100"
                              onClick={() => handleDelete(post.id, post.docId)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 justify-between">
                    <p className="text-xs text-gray-500 mt-4">{post.date}</p>
                  </div>
                </div>
              ))}

          {!loading
            ? currentUser && currentUser.toLowerCase() == "admin@gmail.com"
              ? posts.length === 0 && (
                  <p className="text-gray-500 text-center">
                    No posts yet. Be the first to share something !
                  </p>
                )
              : posts.length === 0 && (
                  <p className="text-gray-500 text-center">
                    No posts yet. Please check again later !
                  </p>
                )
            : ""}
        </div>
      </div>
    </div>
  );
};

export default Home;
