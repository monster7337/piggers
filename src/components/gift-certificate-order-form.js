"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  formatCurrency,
  giftDeliveryOptions,
  saveGiftCertificatePurchase
} from "@/components/admin/admin-data";
import { giftCertificates } from "@/lib/site-data";

const giftSchema = z.object({
  certificateId: z.string().min(1, "Выберите сертификат"),
  amount: z.coerce.number().min(1000, "Минимальный номинал 1000 ₽").optional(),
  purchaserName: z.string().min(2, "Введите имя покупателя"),
  purchaserPhone: z
    .string()
    .min(10, "Введите телефон")
    .regex(/^\+?[0-9()\-\s]{10,18}$/, "Укажите телефон правильно"),
  purchaserEmail: z.string().email("Укажите корректный email"),
  recipientName: z.string().min(2, "Введите имя получателя"),
  recipientPhone: z.string().optional(),
  recipientEmail: z.string().optional(),
  deliveryMethod: z.string().min(1, "Выберите способ отправки"),
  message: z.string().max(240, "Текст поздравления не должен превышать 240 символов").optional(),
  comment: z.string().max(240, "Комментарий не должен превышать 240 символов").optional()
});

export function GiftCertificateOrderForm() {
  const router = useRouter();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(giftSchema),
    defaultValues: {
      certificateId: giftCertificates[0]?.id ?? "",
      amount: giftCertificates[0]?.price ?? 0,
      purchaserName: "",
      purchaserPhone: "",
      purchaserEmail: "",
      recipientName: "",
      recipientPhone: "",
      recipientEmail: "",
      deliveryMethod: giftDeliveryOptions[0],
      message: "",
      comment: ""
    },
    mode: "onBlur"
  });

  const selectedCertificateId = watch("certificateId");
  const selectedCertificate = useMemo(
    () => giftCertificates.find((item) => item.id === selectedCertificateId) ?? giftCertificates[0],
    [selectedCertificateId]
  );
  const customAmount = watch("amount");
  const total = selectedCertificate?.id === "gift-nominal" ? Math.max(1000, Number(customAmount) || 0) : selectedCertificate?.price ?? 0;

  const onSubmit = handleSubmit(async (values) => {
    const order = saveGiftCertificatePurchase({
      ...values,
      amount: values.certificateId === "gift-nominal" ? values.amount : selectedCertificate?.price
    });

    const params = new URLSearchParams({
      type: "gift",
      bookingId: order.id,
      items: order.certificateTitle,
      date: order.purchaseDate,
      time: order.purchaseTime,
      total: formatCurrency(order.amount),
      prepayment: formatCurrency(order.amount),
      remaining: formatCurrency(0),
      name: order.purchaserName,
      phone: order.purchaserPhone,
      recipient: order.recipientName
    });

    router.push(`/booking/success?${params.toString()}`);
  });

  return (
    <section className="section" id="gift-order">
      <div className="container">
        <div className="booking-layout">
          <div className="booking-main">
            <div className="card booking-panel">
              <div className="panel-heading">
                <span className="eyebrow">Оформление сертификата</span>
                <h2>Полная оплата сразу на сайте</h2>
              </div>

              <form className="form-grid" onSubmit={onSubmit}>
                <label className="field">
                  <span>Сертификат</span>
                  <select {...register("certificateId")}>
                    {giftCertificates.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} · {formatCurrency(item.price)}
                      </option>
                    ))}
                  </select>
                  {errors.certificateId ? <small className="field-error">{errors.certificateId.message}</small> : null}
                </label>

                {selectedCertificate?.id === "gift-nominal" ? (
                  <label className="field">
                    <span>Номинал</span>
                    <input type="number" min="1000" step="500" {...register("amount")} />
                    {errors.amount ? <small className="field-error">{errors.amount.message}</small> : null}
                  </label>
                ) : (
                  <label className="field">
                    <span>Стоимость</span>
                    <input value={formatCurrency(total)} readOnly />
                  </label>
                )}

                <label className="field">
                  <span>Покупатель</span>
                  <input type="text" placeholder="Ваше имя" {...register("purchaserName")} />
                  {errors.purchaserName ? <small className="field-error">{errors.purchaserName.message}</small> : null}
                </label>

                <label className="field">
                  <span>Телефон покупателя</span>
                  <input type="tel" placeholder="+7 (___) ___-__-__" {...register("purchaserPhone")} />
                  {errors.purchaserPhone ? <small className="field-error">{errors.purchaserPhone.message}</small> : null}
                </label>

                <label className="field">
                  <span>Email покупателя</span>
                  <input type="email" placeholder="mail@example.com" {...register("purchaserEmail")} />
                  {errors.purchaserEmail ? <small className="field-error">{errors.purchaserEmail.message}</small> : null}
                </label>

                <label className="field">
                  <span>Имя получателя</span>
                  <input type="text" placeholder="Кому подготовить сертификат" {...register("recipientName")} />
                  {errors.recipientName ? <small className="field-error">{errors.recipientName.message}</small> : null}
                </label>

                <label className="field">
                  <span>Телефон получателя</span>
                  <input type="tel" placeholder="+7 (___) ___-__-__" {...register("recipientPhone")} />
                </label>

                <label className="field">
                  <span>Email получателя</span>
                  <input type="email" placeholder="Если нужен дубликат на почту" {...register("recipientEmail")} />
                </label>

                <label className="field">
                  <span>Куда отправить</span>
                  <select {...register("deliveryMethod")}>
                    {giftDeliveryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field field-full">
                  <span>Текст поздравления</span>
                  <textarea rows={4} placeholder="Например: С днём рождения, ждём на тёплый визит к минипигам" {...register("message")} />
                  {errors.message ? <small className="field-error">{errors.message.message}</small> : null}
                </label>

                <label className="field field-full">
                  <span>Комментарий для администратора</span>
                  <textarea rows={3} placeholder="Любые детали для оформления сертификата" {...register("comment")} />
                  {errors.comment ? <small className="field-error">{errors.comment.message}</small> : null}
                </label>

                <div className="field field-full">
                  <button type="submit" className="button button-primary" disabled={isSubmitting}>
                    Оплатить сертификат
                  </button>
                </div>
              </form>
            </div>
          </div>

          <aside className="booking-summary">
            <div className="card summary-card">
              <div className="summary-header">
                <span className="eyebrow">Итог по сертификату</span>
                <h3>Что оплатится сейчас</h3>
              </div>
              <div className="summary-list">
                <div className="summary-group">
                  <div className="summary-row">
                    <span>Сертификат</span>
                    <strong>{selectedCertificate?.title}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Формат</span>
                    <strong>Полная онлайн-оплата</strong>
                  </div>
                  <div className="summary-row">
                    <span>Итого</span>
                    <strong>{formatCurrency(total)}</strong>
                  </div>
                </div>
              </div>
              <div className="status-inline success">
                <span>Сертификаты оплачиваются полностью сразу. Заказ сразу попадёт в CRM отдельной строкой.</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
