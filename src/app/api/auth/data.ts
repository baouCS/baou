import { db, auth } from "@/services/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { SignUpResponse, signupFormData } from "@/app/lib/definitions";

export const signup = async (data: signupFormData): Promise<SignUpResponse> => {
  const dateCreated = Timestamp.fromDate(new Date());

  try {
    // Check if the email is already taken
    const usersRef = collection(db, "users");
    const emailQuery = query(usersRef, where("email", "==", data.email));
    const emailQuerySnapshot = await getDocs(emailQuery);

    if (!emailQuerySnapshot.empty) {
      return {
        message:
          "This email is already registered. Please use a different email.",
        error: true,
        status: 409, // HTTP Conflict
      };
    }

    // Signup using createUserWithEmailAndPassword function of Firebase
    await createUserWithEmailAndPassword(auth, data.email, data.password);

    // Get the user object after signup
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not found after signup.");
    }

    // Use user.uid as the docId
    const userDocRef = doc(db, "users", user.uid);

    // Exclude the password and confirmPassword fields from the data
    const { password, confirmPassword, ...userData } = data;

    // Set the data in the document
    await setDoc(userDocRef, {
      ...userData,
      userId: user.uid,
      dateCreated,
    });

    return {
      message: "Account successfully created!",
      error: false,
      status: 201,
    };
  } catch (error: any) {
    return { error: true, message: error.message, status: error.code };
  }
};

export async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    return { error: false, user };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
      status: error.code,
    };
  }
}

export const logoutUser = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Error logging out:", error);

    // Throw a more descriptive error for debugging/logging
    throw new Error(
      error instanceof Error ? error.message : "Failed to log out user"
    );
  }
};
