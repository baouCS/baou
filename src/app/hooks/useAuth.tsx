import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/firebaseConfig";

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Check for the current user explicitly as a fallback
    if (auth.currentUser) {
      setUser(auth.currentUser);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  return user;
};

export default useAuth;
