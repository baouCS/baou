"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  FaSmile,
  FaEllipsisV,
  FaThumbsUp,
  FaThumbsDown,
  FaCommentAlt,
  FaEdit,
  FaImage,
} from "react-icons/fa";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { toSentenceCase } from "@/app/utils/toSentenceCase";
import Header from "@/app/components/header";
import { auth } from "@/services/firebaseConfig";
import { getFormattedDate } from "@/app/utils/formatDate";
import Swal from "sweetalert2";
import { Post } from "@/app/lib/definitions";
import Image from "next/image";

import {
  addPost,
  fetchPosts,
  updatePost,
  deletePost,
} from "@/app/api/post/data";
import { FaDeleteLeft } from "react-icons/fa6";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Neutral");
  const [editPostId, setEditPostId] = useState<number | null>(null);
  const [docId, setDocId] = useState<string>("");
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [showCommentsId, setShowCommentsId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [postComments, setPostComments] = useState<{ [key: number]: string[] }>(
    {}
  );

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
    Low: "#22c55e",
    Medium: "#eab308",
    High: "#ef4444",
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
      comments: [],
      image: image ? image : null,
    };

    try {
      // Use the addPost function to add the new post
      const result = await addPost(newPost);

      if (result.success && result.post) {
        setImage(null);
        // Include the docId returned from the API into the post object
        const postWithDocId = {
          ...newPost,
          docId: result.post.docId ?? "",
          likes: result.post.likes ?? 0,
          dislikes: result.post.dislikes ?? 0,
        };

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

  // const handlePost = async () => {
  //   if (!text.trim()) return;

  //   let imageUrl = "";

  //   // Upload image if available
  //   if (image) {
  //     try {
  //       const filePath = `images/posts/${image.name || `post-${Date.now()}`}`;
  //       imageUrl = await uploadImageToStorage(image, filePath);
  //     } catch (error) {
  //       console.error("Image upload failed:", error);
  //       return; // Stop if upload fails
  //     }
  //   }

  //   // Prepare the new post object
  //   const newPost: Omit<Post, "docId"> = {
  //     id: posts.length + 1,
  //     text: text.replace(/(\r?\n\s*\n){3,}/g, "\n\n"),
  //     status,
  //     bgColor: statusColors[status],
  //     date: getFormattedDate(),
  //     comments: [],
  //     image: imageUrl,
  //     likes: 0,
  //     dislikes: 0,
  //   };

  //   try {
  //     // Call addPost API function
  //     const result = await addPost(newPost);

  //     if (result.success && result.post) {
  //       setImage(null);

  //       // Update the state with the new post
  //       setPosts([result.post, ...posts]);
  //     } else {
  //       console.error("Failed to add post:", result.message);
  //     }
  //   } catch (error) {
  //     console.error("Error adding post:", error);
  //   }

  //   // Reset the input fields
  //   setText("");
  //   setStatus("Neutral");
  // };

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

  const handleAddComment = (postId: number) => {
    if (newComment.trim()) {
      setPostComments((prevComments) => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), newComment.trim()],
      }));
      setNewComment("");
    }
  };

  const toggleComments = (id: number) => {
    setShowCommentsId((prev) => (prev === id ? null : id));
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      // Optional: You can preview the image here or upload it immediately
      console.log("Selected image:", e.target.files[0]);
    }
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
    <div className="flex  flex-col items-center  h-screen bg-gray-100 overflow-clip">
      <Header />

      <div className="flex items-center w-full max-w-3xl flex-col lg:px-4 lg:bg-gray-200 h-full">
        {currentUser && currentUser.toLowerCase() == "admin@gmail.com" ? (
          <div className="relative rounded-b-lg w-full flex flex-col h-fit items-center p-4 bg-white shadow-md">
            {/* Emoji Picker */}
            {isEmojiPickerOpen && (
              <div
                ref={emojiPickerRef}
                className="absolute top-full mt-2 z-50 bg-white shadow-lg rounded-lg"
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

            <div className="flex w-full flex-col gap-2">
              {image && (
                <Image
                  src={URL.createObjectURL(image)}
                  alt="Uploaded Preview"
                  className="w-full  rounded-md"
                  width={100}
                  height={100}
                />
              )}

              <textarea
                className="w-full text-gray-500  h-24 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind?"
              />
            </div>
            <div className="flex items-center mt-2 space-x-4">
              <div className="">
                <button
                  className="bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition"
                  onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                >
                  <FaSmile />
                </button>
              </div>

              <div>
                <button
                  className="bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition"
                  onClick={() =>
                    document.getElementById("image-input")?.click()
                  }
                >
                  <FaImage />
                </button>
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500"
              >
                {Object.entries(statusColors).map(([key, color]) => (
                  <option key={key} value={key}>
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
                  className="mb-4 p-4 rounded-lg shadow-lg bg-white"
                >
                  <div className="flex justify-between gap-2">
                    <div className="w-full flex flex-col gap-2">
                      {post.image && (
                        <Image
                          src={URL.createObjectURL(post.image)}
                          alt="Uploaded Preview"
                          className="w-full rounded-md"
                          width={100}
                          height={100}
                        />
                      )}
                      <p className="text-gray-500 font-medium whitespace-pre-wrap p-4 bg-slate-50 shadow-inner bg-opacity-10 border-gray-300 border-b border-opacity-20 rounded-md py-4">
                        {toSentenceCase(post.text)}
                      </p>
                    </div>
                    {currentUser == "admin@gmail.com" && (
                      <div className="relative flex flex-col gap-2">
                        {/* //status mark */}
                        {post.bgColor !== "#ffffff" ? (
                          <div
                            className={`relative z-50 w-4 h-4 shadow-sm rounded-full`}
                            style={{ backgroundColor: post.bgColor }}
                            title={
                              post.bgColor === "#22c55e"
                                ? "Low Priority"
                                : post.bgColor === "#eab308"
                                ? "Medium Priority"
                                : post.bgColor === "#ef4444"
                                ? "High Priority"
                                : ""
                            }
                          ></div>
                        ) : (
                          ""
                        )}

                        <button
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                          onClick={() => toggleDropdown(post.id)}
                        >
                          <FaEllipsisV />
                        </button>
                        {activeDropdownId === post.id && (
                          <div className="absolute border right-6 w-fit bg-white rounded-md shadow-lg z-10">
                            <button
                              className="block px-4 py-2 text-gray-700 w-full hover:bg-gray-100"
                              onClick={() => handleEdit(post.id, post.docId)}
                            >
                              {/* Edit */}
                              <FaEdit />
                            </button>
                            <button
                              className="block px-4 py-2 text-red-600 hover:bg-gray-100"
                              onClick={() => handleDelete(post.id, post.docId)}
                            >
                              {/* Delete */}
                              <FaDeleteLeft />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="post">
                    <div className="flex gap-4 justify-between px-4">
                      <p className="text-xs text-gray-500 mt-4">{post.date}</p>
                      <div className="flex justify-end space-x-4 mt-2">
                        <button
                          className="flex items-center text-gray-500 hover:text-blue-600 transition"
                          onClick={() => toggleComments(post.id)}
                        >
                          <FaCommentAlt className="mr-1" />
                          <span>{postComments[post.id]?.length || 0}</span>
                        </button>
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

                    {/* Comment Section */}
                    {showCommentsId === post.id && (
                      <div className=" mt-4 p-4 border-t border-gray-300">
                        <div className="comments">
                          <ul>
                            {postComments[post.id]?.map((comment, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 mb-2 p-2 bg-slate-100 rounded-md"
                              >
                                {comment}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="add-comment">
                          <textarea
                            className="w-full p-2 border text-gray-500 rounded-lg mt-2"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Send a comment here..."
                          />
                          <button
                            className="bg-blue-500 text-white py-1 px-4 rounded-lg mt-2"
                            onClick={() => handleAddComment(post.id)}
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    )}
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
