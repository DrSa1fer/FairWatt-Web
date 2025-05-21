// hocs/withAuth.tsx
"use client";

import { Spin } from "antd";
import { useAuthCheck } from "../hooks/useAuthCheck";

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuthCheck();

    if (loading || !isAuthenticated) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <Spin size="large" />
        </div>
      );
    }

    return <Component {...props} />;
  };
}