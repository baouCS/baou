import { db } from "@/services/firebaseConfig"; // Your Firebase config
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { Post } from "@/app/lib/definitions";
import { getFormattedDate } from "@/app/utils/formatDate";

interface UpdatePostData {
  docId: string;
  updates: Partial<Omit<Post, "docId">>;
}

// Function to add a new post to Firebase Firestore
export const addPost = async (
  postData: Omit<Post, "date" | "likes" | "dislikes" | "docId" | "comments">
) => {
  try {
    const { image, ...restData } = postData;

    // Construct the local image URL
    const imageUrl = image ? `/uploads/${image}` : null;

    // Create the new post object
    const newPost = {
      ...restData,
      imageUrl,
      date: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      comments: [],
    };

    // Add post to Firestore and get the document reference
    const docRef = await addDoc(collection(db, "posts"), newPost);

    // Attach the document ID to the post data
    const postWithDocId = {
      ...newPost,
      docId: docRef.id,
    };

    return {
      success: true,
      post: postWithDocId,
    };
  } catch (error) {
    console.error("Error adding post: ", error);
    return {
      success: false,
      message: error || "An error occurred",
    };
  }
};

export const fetchPosts = async () => {
  try {
    const postsSnapshot = await getDocs(collection(db, "posts"));

    // Ensure each post includes the necessary fields and cast it to Post[]
    const postsList: Post[] = postsSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: data.id,
        text: data.text || "",
        status: data.status || "",
        bgColor: data.bgColor || "",
        date: getFormattedDate(),
        likes: data.likes || 0,
        dislikes: data.dislikes || 0,
        docId: doc.id,
        comments: data.comments,
        reactions: data.reactions,
      };
    });

    return {
      success: true,
      posts: postsList,
    };
  } catch (error) {
    console.error("Error fetching posts: ", error);
    return {
      success: false,
      message: error || "An error occurred",
    };
  }
};

export const updatePost = async ({ docId, updates }: UpdatePostData) => {
  try {
    const postRef = doc(db, "posts", docId);

    // Update the specified fields in the document
    await updateDoc(postRef, updates);

    return {
      success: true,
      message: "Post updated successfully",
    };
  } catch (error) {
    console.error("Error updating post: ", error);
    return {
      success: false,
      message: error || "An error occurred",
    };
  }
};

export const deletePost = async (docId: string) => {
  try {
    const postRef = doc(db, "posts", docId);

    // Delete the document
    await deleteDoc(postRef);

    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting post: ", error);
    return {
      success: false,
      message: error || "An error occurred",
    };
  }
};

export const createComment = async (
  postId: string, // The Firestore document ID of the post
  commentData: {
    text: string;
    author: string;
  }
) => {
  try {
    // Construct the comment object
    const newComment = {
      ...commentData,
      date: new Date().toISOString(),
    };

    // Update the comments array in the specified post document
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion(newComment),
    });

    return {
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    };
  } catch (error) {
    console.error("Error adding comment: ", error);
    return {
      success: false,
      message: error || "An error occurred while adding the comment",
    };
  }
};

export const updatePostReactions = async (
  post: Post,
  userId: string,
  reaction: "like" | "dislike"
): Promise<Post> => {
  const updatedPost = { ...post }; // Clone the post object
  updatedPost.reactions = updatedPost.reactions || {}; // Initialize reactions if undefined

  const currentReaction = updatedPost.reactions[userId];

  if (currentReaction === reaction) {
    // If the user clicks the same reaction, remove it
    delete updatedPost.reactions[userId];
    if (reaction === "like") {
      updatedPost.likes -= 1;
    } else if (reaction === "dislike") {
      updatedPost.dislikes -= 1;
    }
  } else {
    // Update the user's reaction
    if (currentReaction === "like") {
      updatedPost.likes -= 1;
    } else if (currentReaction === "dislike") {
      updatedPost.dislikes -= 1;
    }

    updatedPost.reactions[userId] = reaction;
    if (reaction === "like") {
      updatedPost.likes += 1;
    } else if (reaction === "dislike") {
      updatedPost.dislikes += 1;
    }
  }

  // Update in Firestore
  try {
    const postDocRef = doc(db, "posts", post.docId);
    await updateDoc(postDocRef, {
      likes: updatedPost.likes,
      dislikes: updatedPost.dislikes,
      reactions: updatedPost.reactions,
    });
  } catch (error) {
    console.error("Error updating reactions:", error);
    throw new Error("Failed to update post reactions.");
  }

  return updatedPost;
};
