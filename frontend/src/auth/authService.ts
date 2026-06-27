import { 
  signInWithPopup, 
  signOut as fbSignOut
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, googleProvider, firebaseInitialized } from "./firebase";

export const loginWithGoogle = async (): Promise<User> => {
  if (!firebaseInitialized || !auth || !googleProvider) {
    logger_warn_simulation();
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Return mock user structure matching Firebase User
    return {
      uid: "mock-user-123",
      displayName: "Mock User",
      email: "mock@uxverse.ai",
      photoURL: "https://lh3.googleusercontent.com/a/mock-avatar",
    } as any;
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logoutUser = async (): Promise<void> => {
  if (!firebaseInitialized || !auth) {
    return;
  }
  await fbSignOut(auth);
};

export const getCurrentUser = (): User | null => {
  if (!firebaseInitialized || !auth) {
    return null;
  }
  return auth.currentUser;
};

function logger_warn_simulation() {
  console.warn("Auth Service is running in client simulation mode.");
}
