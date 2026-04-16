"use client";

import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/components/admin/admin.module.css";
import {
  ADMIN_AUTH_KEY,
  ADMIN_SETTINGS_KEY,
  defaultSettings,
  mockCredentials,
  readAdminJson,
  readAdminStorage,
  writeAdminStorage
} from "@/components/admin/admin-data";

export function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const isAuthorized = readAdminStorage(ADMIN_AUTH_KEY) === "true";
      const storedSettings = readAdminJson(ADMIN_SETTINGS_KEY, defaultSettings);

      if (isAuthorized) {
        router.replace(storedSettings.startRoute ?? defaultSettings.startRoute);
        return;
      }
    } catch {}
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    await new Promise((resolve) => window.setTimeout(resolve, 650));

    if (login === mockCredentials.login && password === mockCredentials.password) {
      writeAdminStorage(ADMIN_AUTH_KEY, "true");
      const storedSettings = readAdminJson(ADMIN_SETTINGS_KEY, defaultSettings);
      const nextRoute = storedSettings.startRoute ?? defaultSettings.startRoute;
      router.push(nextRoute);
      return;
    }

    setError("Неверный логин или пароль");
    setIsSubmitting(false);
  }

  return (
    <div className={styles.authScreen}>
      <div className={styles.authBackdrop} />
      <div className={styles.authGlowLeft} />
      <div className={styles.authGlowRight} />

      <form className={styles.authCard} onSubmit={handleSubmit}>
        <div className={styles.authBrand}>
          <span className={styles.authBadge}>PL</span>
          <div>
            <strong>Piggy Land CRM</strong>
            <span>Тёмная админка для управления записями</span>
          </div>
        </div>

        <div className={styles.authHeading}>
          <p className={styles.kicker}>
            <ShieldCheck size={16} />
            Demo access
          </p>
          <h1>Вход в CRM</h1>
          <p>Быстрый mock-вход для демо-версии админки без серверной авторизации.</p>
        </div>

        <label className={styles.field}>
          <span>Логин</span>
          <input
            autoComplete="username"
            disabled={isSubmitting}
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            placeholder="Введите логин"
          />
        </label>

        <label className={styles.field}>
          <span>Пароль</span>
          <input
            autoComplete="current-password"
            disabled={isSubmitting}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите пароль"
          />
        </label>

        {error ? (
          <div className={styles.inlineAlert} data-tone="danger">
            <LockKeyhole size={16} />
            <span>{error}</span>
          </div>
        ) : null}

        <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
          <span>{isSubmitting ? "Входим…" : "Войти"}</span>
          <ArrowRight size={18} />
        </button>

        <div className={styles.demoCredentials}>
          <span>login: user</span>
          <span>password: 123</span>
        </div>
      </form>
    </div>
  );
}
