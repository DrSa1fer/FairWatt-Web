"use client";

import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasTokenInCookies } from './services/user-access';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!hasTokenInCookies()) {
        router.push("/auth");
      } else {
        router.push("/meterList");
      }
    }
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
    </div>
  );
}
