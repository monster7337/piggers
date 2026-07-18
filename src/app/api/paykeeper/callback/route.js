import crypto from "node:crypto";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEV_FALLBACK_SECRET = "paykeeper-test-secret";

function md5(value) {
  return crypto.createHash("md5").update(value, "utf8").digest("hex");
}

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeSum(value) {
  const normalizedValue = String(value ?? "").trim().replace(",", ".");
  const numericValue = Number(normalizedValue);

  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : "";
}

function getSecret() {
  return process.env.PAYKEEPER_SECRET || process.env.PAYKEEPER_CALLBACK_SECRET || (process.env.NODE_ENV === "development" ? DEV_FALLBACK_SECRET : "");
}

function getPaymentsFilePath() {
  return process.env.PAYKEEPER_PAYMENTS_FILE || path.join(process.cwd(), ".paykeeper", "payments.json");
}

function textResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function readCallbackParams(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const json = await request.json();

    return Object.fromEntries(Object.entries(json).map(([key, value]) => [key, String(value ?? "")]));
  }

  const formData = await request.formData();

  return Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, String(value ?? "")]));
}

async function readPaymentsFile(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed.payments) ? parsed : { payments: [] };
  } catch {
    return { payments: [] };
  }
}

async function savePayment(payment) {
  const filePath = getPaymentsFilePath();
  const now = new Date().toISOString();
  const storage = await readPaymentsFile(filePath);
  const existingIndex = storage.payments.findIndex((item) => item.id === payment.id);

  if (existingIndex >= 0) {
    storage.payments[existingIndex] = {
      ...storage.payments[existingIndex],
      ...payment,
      duplicateCallbacks: (storage.payments[existingIndex].duplicateCallbacks ?? 0) + 1,
      lastCallbackAt: now
    };
  } else {
    storage.payments.push({
      ...payment,
      duplicateCallbacks: 0,
      firstCallbackAt: now,
      lastCallbackAt: now
    });
  }

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(storage, null, 2)}\n`, "utf8");
}

export async function POST(request) {
  let params;

  try {
    params = await readCallbackParams(request);
  } catch {
    return textResponse("Error! Invalid request body", 400);
  }

  const id = params.id || "";
  const sum = normalizeSum(params.sum);
  const clientid = params.clientid || "";
  const orderid = params.orderid || "";
  const key = (params.key || "").toLowerCase();
  const secret = getSecret();

  if (!secret) {
    return textResponse("Error! Callback is not configured", 503);
  }

  if (!id || !sum || !key) {
    return textResponse("Error! Missing or invalid parameters", 400);
  }

  const expectedKey = md5(`${id}${sum}${clientid}${orderid}${secret}`);

  if (!timingSafeEqual(key, expectedKey)) {
    return textResponse("Invalid key", 400);
  }

  await savePayment({
    id,
    sum,
    clientid,
    orderid,
    site: orderid.startsWith("velkah-") ? "velkah" : orderid.startsWith("piggy-") ? "piggy-land" : params.site || "unknown",
    serviceName: params.service_name || "",
    clientEmail: params.client_email || "",
    clientPhone: params.client_phone || "",
    psId: params.ps_id || "",
    batchDate: params.batch_date || "",
    fopReceiptKey: params.fop_receipt_key || "",
    raw: params
  });

  return textResponse(`OK ${md5(`${id}${secret}`)}`);
}

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return Response.json({ ok: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const storage = await readPaymentsFile(getPaymentsFilePath());

  return Response.json(
    {
      ok: true,
      paymentsCount: storage.payments.length,
      payments: storage.payments.slice(-20).reverse()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
