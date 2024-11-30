import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebaseConfig"; // Ensure `db` is exported from your Firebase config
import { NextResponse } from "next/server";
import { setCookie } from "cookies-next";

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();

    // Create a new user using Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Generate a Firebase ID token
    const idToken = await user.getIdToken();

    // Save user data in Firestore
    const userData = {
      username,
      email,
      dateCreated: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", user.uid), userData); // Save data under `users` collection

    // Set the cookie with the token
    setCookie("authToken", idToken, {
      httpOnly: true, // Accessible only by the server
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Prevent cross-site requests
      maxAge: 60 * 60 * 24 * 7, // 1 week expiration
    });

    // Return a success response
    return NextResponse.json(
      {
        user: { uid: user.uid, email: user.email, username: userData.username },
      },
      { status: 201 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Handle errors and return a response
    return NextResponse.json(
      { error: true, message: error.message, status: error.code },
      { status: 400 }
    );
  }
}
