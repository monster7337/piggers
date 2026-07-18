"use client";

import { Suspense } from "react";
import { AdminProvider } from "@/components/admin/admin-provider";
import { AdminShell } from "@/components/admin/admin-shell";
import styles from "@/components/admin/admin.module.css";

function AdminPageFallback() {
  return (
    <div className={styles.guardScreen}>
      <div className={styles.loader} />
      <p>Открываем панель управления…</p>
    </div>
  );
}

export default function AdminProtectedLayout({ children }) {
  return (
    <AdminProvider>
      <AdminShell>
        <Suspense fallback={<AdminPageFallback />}>{children}</Suspense>
      </AdminShell>
    </AdminProvider>
  );
}
