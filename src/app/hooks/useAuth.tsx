import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/firebaseConfig";

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log("useAuth: Setting up onAuthStateChanged listener");

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("useAuth: Auth state changed, user:", currentUser);
      setUser(currentUser);
    });

    // Check for the current user explicitly as a fallback
    if (auth.currentUser) {
      console.log(
        "useAuth: Fallback - Current user detected",
        auth.currentUser
      );
      setUser(auth.currentUser);
    }

    return () => {
      console.log("useAuth: Cleaning up onAuthStateChanged listener");
      unsubscribe();
    };
  }, []);

  console.log("useAuth: Current user state:", user);
  return user;
};

export default useAuth;
