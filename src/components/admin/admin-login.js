"use client";

import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/components/admin/admin.module.css";

export function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password })
      });
      const payload = await response.json().catch(() => ({}));

      if (response.ok) {
        router.replace("/admin/dashboard");
        router.refresh();
        return;
      }

      setError(payload.message || "Неверный логин или пароль.");
    } catch {
      setError("Не удалось проверить данные. Попробуйте ещё раз.");
    }
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
            <strong>Piggy Land</strong>
            <span>Управление записями</span>
          </div>
        </div>

        <div className={styles.authHeading}>
          <p className={styles.kicker}>
            <ShieldCheck size={16} />
            Защищённый доступ
          </p>
          <h1>Вход в панель управления</h1>
          <p>Введите личный логин и пароль владельца.</p>
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
      </form>
    </div>
  );
}
