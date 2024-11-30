import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebaseConfig";
import { NextResponse } from "next/server";
import { setCookie } from "cookies-next"; // or any other package you're using for cookies

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Authenticate the user using Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Set a session cookie here
    // Example: Store the Firebase ID token or some session identifier
    const idToken = await user.getIdToken(); // Get the Firebase ID token for the logged-in user

    // Set the cookie with the token
    setCookie("authToken", idToken, {
      httpOnly: true, // Make it accessible only to the server (for security)
      secure: process.env.NODE_ENV === "production", // Only set secure cookies in production
      sameSite: "strict", // Prevent the cookie from being sent with cross-site requests
      maxAge: 60 * 60 * 24 * 7, // Optional: Set an expiration time (e.g., 1 week)
    });

    // Return a response with user data (without sending the password)
    return NextResponse.json({ user }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message, status: error.code },
      { status: 400 }
    );
  }
}
