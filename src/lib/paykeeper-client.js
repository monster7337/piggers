export async function createPaykeeperInvoice(payload) {
  const response = await fetch("/api/paykeeper/invoice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.paymentUrl) {
    throw new Error(data?.message || "PayKeeper не создал ссылку на оплату.");
  }

  return data;
}
