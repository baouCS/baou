import { auth } from "@/services/firebaseConfig";

export const logoutUser = async (): Promise<void> => {
  try {
    await auth.signOut();
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Error logging out:", error);
    throw new Error("Failed to log out user");
  }
};
