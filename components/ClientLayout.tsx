"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className={isLoading ? "hidden" : ""}>
        {children}
      </div>
    </>
  );
}
