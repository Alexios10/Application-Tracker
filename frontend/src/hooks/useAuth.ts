import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

// Hook for using auth in components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
