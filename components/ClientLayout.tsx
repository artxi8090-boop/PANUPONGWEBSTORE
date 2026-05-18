"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const normalTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 1500);

    const failSafeTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(normalTimer);
      clearTimeout(failSafeTimer);
    };
  }, []);

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      <LoadingScreen />
      <div style={{ display: "none" }}>{children}</div>
    </>
  );
}
