"use client";

import WeeklyTracker from "@/components/WeeklyTracker";
import Login from "@/components/Login";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <main>
      {isAuthenticated ? <WeeklyTracker /> : <Login />}
    </main>
  );
}
