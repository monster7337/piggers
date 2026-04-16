"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminProvider } from "@/components/admin/admin-provider";
import { AdminShell } from "@/components/admin/admin-shell";
import styles from "@/components/admin/admin.module.css";
import { ADMIN_AUTH_KEY, readAdminStorage } from "@/components/admin/admin-data";

export default function AdminProtectedLayout({ children }) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(null);

  useEffect(() => {
    const isAuthorized = readAdminStorage(ADMIN_AUTH_KEY) === "true";

    if (!isAuthorized) {
      router.replace("/admin");
      setIsAllowed(false);
      return;
    }

    setIsAllowed(true);
  }, [router]);

  if (isAllowed !== true) {
    return (
      <div className={styles.guardScreen}>
        <div className={styles.loader} />
        <p>Открываем CRM…</p>
      </div>
    );
  }

  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
