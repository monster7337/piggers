import "server-only";

import crypto from "node:crypto";

export const ADMIN_SESSION_COOKIE = "admin-session";

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left ?? ""));
  const rightBuffer = Buffer.from(String(right ?? ""));

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getCookieValue(request, name) {
  if (request.cookies?.get) {
    return request.cookies.get(name)?.value ?? "";
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const pair = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : "";
}

export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD?.length >= 16 &&
      process.env.ADMIN_SESSION_TOKEN?.length >= 32
  );
}

export function verifyAdminCredentials(username, password) {
  if (!isAdminConfigured()) {
    return false;
  }

  return safeEqual(username, process.env.ADMIN_USERNAME) && safeEqual(password, process.env.ADMIN_PASSWORD);
}

export function isAdminRequest(request) {
  const expectedToken = process.env.ADMIN_SESSION_TOKEN || "";
  return expectedToken.length >= 32 && safeEqual(getCookieValue(request, ADMIN_SESSION_COOKIE), expectedToken);
}

export function getAdminCookieOptions(maxAge = 12 * 60 * 60) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge
  };
}
