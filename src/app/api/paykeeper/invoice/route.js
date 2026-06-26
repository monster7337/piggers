export const runtime = "nodejs";
export const dynamic = "force-static";

const DEFAULT_PAYKEEPER_SERVER = "https://monster7337-github.server.paykeeper.ru";

function getPaykeeperServer() {
  return (process.env.PAYKEEPER_SERVER || DEFAULT_PAYKEEPER_SERVER).replace(/\/+$/, "");
}

function getBasicAuthHeader() {
  const user = process.env.PAYKEEPER_USER || "admin";
  const password = process.env.PAYKEEPER_PASSWORD || "";

  if (!password) {
    throw new Error("Не задан PAYKEEPER_PASSWORD.");
  }

  return `Basic ${Buffer.from(`${user}:${password}`, "utf8").toString("base64")}`;
}

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function normalizeAmount(value) {
  const numericValue = Number(String(value ?? "").replace(",", "."));

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue.toFixed(2) : "";
}

async function readJsonResponse(response) {
  const raw = await response.text();

  try {
    return { raw, json: raw ? JSON.parse(raw) : {} };
  } catch {
    return { raw, json: {} };
  }
}

function buildAbsoluteUrl(request, path) {
  if (!path) {
    return "";
  }

  try {
    return new URL(path).toString();
  } catch {
    const origin = request.headers.get("origin") || `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host")}`;
    return new URL(path, origin).toString();
  }
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, message: "Некорректное тело запроса." }, 400);
  }

  const payAmount = normalizeAmount(payload.amount);
  const orderid = String(payload.orderId || "").trim();

  if (!payAmount || !orderid) {
    return jsonResponse({ ok: false, message: "Для счёта нужны сумма и номер заказа." }, 400);
  }

  let authorization;

  try {
    authorization = getBasicAuthHeader();
  } catch (error) {
    return jsonResponse({ ok: false, message: error instanceof Error ? error.message : "Не задан доступ к PayKeeper." }, 500);
  }

  const server = getPaykeeperServer();
  const headers = {
    Authorization: authorization,
    "Content-Type": "application/x-www-form-urlencoded"
  };

  const tokenResponse = await fetch(`${server}/info/settings/token/`, {
    method: "GET",
    headers,
    cache: "no-store"
  });
  const tokenPayload = await readJsonResponse(tokenResponse);
  const token = tokenPayload.json?.token;

  if (!tokenResponse.ok || !token) {
    return jsonResponse(
      {
        ok: false,
        message: tokenPayload.json?.msg || tokenPayload.json?.message || "PayKeeper не выдал токен.",
        status: tokenResponse.status
      },
      502
    );
  }

  const successUrl = buildAbsoluteUrl(request, payload.successPath);
  const invoiceBody = new URLSearchParams({
    token,
    pay_amount: payAmount,
    clientid: String(payload.clientName || payload.clientPhone || orderid),
    orderid,
    service_name: String(payload.serviceName || "Оплата заказа"),
    client_email: String(payload.clientEmail || ""),
    client_phone: String(payload.clientPhone || "")
  });

  if (successUrl) {
    invoiceBody.set("user_result_callback", successUrl);
  }

  const invoiceResponse = await fetch(`${server}/change/invoice/preview/`, {
    method: "POST",
    headers,
    body: invoiceBody,
    cache: "no-store"
  });
  const invoicePayload = await readJsonResponse(invoiceResponse);
  const invoiceId = invoicePayload.json?.invoice_id;

  if (!invoiceResponse.ok || !invoiceId || invoicePayload.json?.result === "fail") {
    return jsonResponse(
      {
        ok: false,
        message: invoicePayload.json?.msg || invoicePayload.json?.message || "PayKeeper не создал счёт.",
        status: invoiceResponse.status
      },
      502
    );
  }

  return jsonResponse({
    ok: true,
    invoiceId,
    paymentUrl: `${server}/bill/${invoiceId}/`
  });
}
