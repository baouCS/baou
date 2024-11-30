import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebaseConfig";

export async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Here you can set cookies or session if needed
    // ...

    // revalidatePath("/home"); // Optionally revalidate cache for certain paths

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
