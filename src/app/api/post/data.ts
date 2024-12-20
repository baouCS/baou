import { db } from "@/services/firebaseConfig"; // Your Firebase config
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Post } from "@/app/lib/definitions";
import { getFormattedDate } from "@/app/utils/formatDate";

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

// export const addPost = async (
//   postData: Omit<
//     Post,
//     "date" | "likes" | "dislikes" | "docId" | "comments" | "image"
//   >
// ) => {
//   try {
//     // Create the new post object
//     const newPost = {
//       ...postData,
//       date: new Date().toISOString(),
//       likes: 0,
//       dislikes: 0,
//       comments: [],
//       image: "",
//     };

//     // Add post to Firestore and get the document reference
//     const docRef = await addDoc(collection(db, "posts"), newPost);

//     // Attach the document ID to the post data
//     const postWithDocId = {
//       ...newPost,
//       docId: docRef.id,
//     };

//     // Return the post data including docId
//     return {
//       success: true,
//       post: postWithDocId,
//     };
//   } catch (error) {
//     console.error("Error adding post: ", error);
//     return {
//       success: false,
//       message: error || "An error occurred",
//     };
//   }
// };

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

interface UpdatePostData {
  docId: string; // Document ID of the post to update
  updates: Partial<Omit<Post, "docId">>; // Fields to update (excluding docId)
}

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
