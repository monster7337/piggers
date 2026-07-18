import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminCookieOptions,
  isAdminConfigured,
  verifyAdminCredentials
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map();

function getClientKey(request) {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const forwarded = request.headers.get("x-forwarded-for") || "unknown";
  return forwarded.split(",").at(-1).trim();
}

function json(body, status, headers = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers }
  });
}

export async function POST(request) {
  if (!isAdminConfigured()) {
    return json({ ok: false, message: "Вход временно недоступен." }, 503);
  }

  const key = getClientKey(request);
  const now = Date.now();
  const current = attempts.get(key);

  if (current && current.count >= MAX_ATTEMPTS && current.resetAt > now) {
    return json(
      { ok: false, message: "Слишком много попыток. Попробуйте позже." },
      429,
      { "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)) }
    );
  }

  let credentials;
  try {
    credentials = await request.json();
  } catch {
    return json({ ok: false, message: "Неверный запрос." }, 400);
  }

  await new Promise((resolve) => setTimeout(resolve, 450));

  if (!verifyAdminCredentials(credentials?.login, credentials?.password)) {
    const next = current && current.resetAt > now ? current : { count: 0, resetAt: now + ATTEMPT_WINDOW_MS };
    next.count += 1;
    attempts.set(key, next);

    return json(
      { ok: false, message: next.count >= MAX_ATTEMPTS ? "Слишком много попыток. Попробуйте позже." : "Неверный логин или пароль." },
      next.count >= MAX_ATTEMPTS ? 429 : 401,
      next.count >= MAX_ATTEMPTS ? { "Retry-After": String(Math.ceil((next.resetAt - now) / 1000)) } : {}
    );
  }

  attempts.delete(key);
  const response = json({ ok: true }, 200);
  response.cookies.set(ADMIN_SESSION_COOKIE, process.env.ADMIN_SESSION_TOKEN, getAdminCookieOptions());
  return response;
}
