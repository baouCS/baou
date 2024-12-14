import { db } from "@/services/firebaseConfig"; // Your Firebase config
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Post } from "@/app/lib/definitions";

// Function to add a new post to Firebase Firestore
export const addPost = async (
  postData: Omit<Post, "date" | "likes" | "dislikes">
) => {
  try {
    const newPost: Post = {
      ...postData,
      date: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
    };

    // Add post to Firestore and get the document reference
    await addDoc(collection(db, "posts"), newPost);

    // Return the document ID and the created post data
    return {
      success: true,
      post: { ...newPost },
    };
  } catch (error) {
    console.error("Error adding post: ", error);
    return {
      success: false,
      message: error || "An error occurred",
    };
  }
};
// Fetch posts from Firestore

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
        date: data.date || new Date().toISOString(),
        likes: data.likes || 0,
        dislikes: data.dislikes || 0,
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
