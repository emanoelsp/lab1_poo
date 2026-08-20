"use client";

import { useEffect } from "react";
import { onAuth } from "@/lib/auth";
import { getUserById, ensureUserDocument } from "@/services/users.service";
import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const { user, loading, setUser, setLoading, clearUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuth(async (firebaseUser) => {
      if (!firebaseUser) {
        clearUser();
        return;
      }

      try {
        await ensureUserDocument(
          firebaseUser.uid,
          firebaseUser.email ?? "",
          firebaseUser.displayName ?? ""
        );
        const appUser = await getUserById(firebaseUser.uid);
        setUser(appUser);
      } catch {
        clearUser();
      }
    });

    return unsubscribe;
  }, [setUser, setLoading, clearUser]);

  return { user, loading, role: user?.role ?? null };
}
