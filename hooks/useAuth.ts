"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/verify", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [router]);

  return { user, loading };
}
