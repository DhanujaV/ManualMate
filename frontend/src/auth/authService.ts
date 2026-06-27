import { 
  signInWithPopup, 
  signOut as fbSignOut
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export const loginWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logoutUser = async (): Promise<void> => {
  await fbSignOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
