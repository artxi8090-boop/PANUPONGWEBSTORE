"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    const failSafe = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(failSafe);
    };
  }, []);

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      <LoadingScreen />
      <div className="hidden">{children}</div>
    </>
  );
}
