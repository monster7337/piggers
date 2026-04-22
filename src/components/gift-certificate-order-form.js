"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, CircleAlert, Gift, Mail, MessageCircle, Minus, Plus, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  formatCurrency,
  giftDeliveryOptions,
  saveGiftCertificatePurchase
} from "@/components/admin/admin-data";

const GIFT_GUEST_MIN = 1;
const GIFT_GUEST_MAX = 12;
const GIFT_SINGLE_PRICE = 1500;
const GIFT_GROUP_PRICE = 1200;

const giftSteps = ["Количество", "Контакты"];
const giftStepNotes = [
  "Выберите, на сколько человек оформить сертификат",
  "Заполните данные покупателя, получателя и способ отправки"
];

const phoneSchema = z
  .string()
  .min(10, "Введите телефон")
  .regex(/^\+?[0-9()\-\s]{10,18}$/, "Укажите телефон правильно");

const socialDeliveryMethods = new Set(["Telegram", "VK", "Instagram"]);

const giftSchema = z
  .object({
    purchaserName: z.string().min(2, "Введите имя покупателя"),
    purchaserPhone: phoneSchema,
    purchaserEmail: z.string().email("Укажите корректный email"),
    recipientName: z.string().min(2, "Введите имя получателя"),
    recipientPhone: phoneSchema,
    recipientEmail: z.string().email("Укажите корректный email получателя"),
    deliveryMethod: z.string().min(1, "Выберите способ отправки"),
    deliveryContact: z.string().max(120, "Контакт для отправки не должен превышать 120 символов").optional(),
    message: z.string().max(320, "Текст для получателя не должен превышать 320 символов").optional(),
    comment: z.string().max(320, "Комментарий администратору не должен превышать 320 символов").optional()
  })
  .superRefine((values, context) => {
    if (socialDeliveryMethods.has(values.deliveryMethod) && !values.deliveryContact?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryContact"],
        message: "Укажите аккаунт или ссылку для выбранного способа отправки"
      });
    }
  });

const deliveryMeta = {
  Email: {
    description: "Отправим сертификат на почту получателя.",
    tone: "email"
  },
  Telegram: {
    description: "Можно отправить по нику или ссылке на аккаунт.",
    tone: "telegram"
  },
  VK: {
    description: "Подойдет ссылка на профиль или сообщество.",
    tone: "vk"
  },
  Instagram: {
    description: "Укажите аккаунт или ссылку на профиль.",
    tone: "instagram"
  },
  WhatsApp: {
    description: "Отправим по номеру телефона получателя.",
    tone: "whatsapp"
  }
};

function getGuestWord(value) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "человек";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "человека";
  }

  return "человек";
}

function getGiftPricePerGuest(guestCount) {
  return guestCount >= 3 ? GIFT_GROUP_PRICE : GIFT_SINGLE_PRICE;
}

function getGiftTotal(guestCount) {
  return guestCount * getGiftPricePerGuest(guestCount);
}

function getGiftCertificateTitle(guestCount) {
  return `Подарочный сертификат на посещение · ${guestCount} ${getGuestWord(guestCount)}`;
}

function DeliveryIcon({ method }) {
  if (method === "Email") {
    return <Mail size={18} />;
  }

  if (method === "Telegram") {
    return <Send size={18} />;
  }

  if (method === "Instagram") {
    return <Camera size={18} />;
  }

  if (method === "WhatsApp") {
    return <MessageCircle size={18} />;
  }

  return <span className="gift-delivery-option-mark">VK</span>;
}

export function GiftCertificateOrderForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [guestCount, setGuestCount] = useState(1);
  const [stepError, setStepError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(giftSchema),
    defaultValues: {
      purchaserName: "",
      purchaserPhone: "",
      purchaserEmail: "",
      recipientName: "",
      recipientPhone: "",
      recipientEmail: "",
      deliveryMethod: giftDeliveryOptions[0],
      deliveryContact: "",
      message: "",
      comment: ""
    },
    mode: "onBlur"
  });

  const deliveryMethod = watch("deliveryMethod");
  const purchaserName = watch("purchaserName");
  const recipientName = watch("recipientName");
  const deliveryContact = watch("deliveryContact");

  const pricePerGuest = useMemo(() => getGiftPricePerGuest(guestCount), [guestCount]);
  const total = useMemo(() => getGiftTotal(guestCount), [guestCount]);
  const certificateTitle = useMemo(() => getGiftCertificateTitle(guestCount), [guestCount]);
  const selectedDeliveryMeta = deliveryMeta[deliveryMethod] ?? deliveryMeta.Email;
  const selectedDeliveryLabel = deliveryMethod || "Email";
  const mobileSelectionNote = `${guestCount} ${getGuestWord(guestCount)} · ${formatCurrency(pricePerGuest)} / чел.`;
  const needsDeliveryContact = socialDeliveryMethods.has(deliveryMethod);

  const deliveryContactLabel =
    deliveryMethod === "Telegram"
      ? "Ник или ссылка в Telegram"
      : deliveryMethod === "VK"
        ? "Ссылка на профиль VK"
        : "Аккаунт или ссылка в Instagram";

  const deliveryContactPlaceholder =
    deliveryMethod === "Telegram"
      ? "@nickname или t.me/..."
      : deliveryMethod === "VK"
        ? "vk.com/..."
        : "@instagram или instagram.com/...";

  function updateGuestCount(nextValue) {
    setGuestCount(Math.max(GIFT_GUEST_MIN, Math.min(GIFT_GUEST_MAX, nextValue)));
  }

  function goToStep(nextStep) {
    setStepError("");
    setStep(nextStep);
  }

  const submitGiftOrder = handleSubmit(
    async (values) => {
      setStepError("");

      const order = saveGiftCertificatePurchase({
        ...values,
        certificateId: "gift-visit",
        certificateTitle,
        guestCount,
        pricePerGuest,
        amount: total
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
    },
    () => {
      setStepError("Проверьте контакты получателя, покупателя и способ отправки перед оплатой.");
    }
  );

  return (
    <section className="section" id="gift-order">
      <div className="container">
        <div className="booking-layout gift-config-layout">
          <div className="booking-main">
            <div className="card booking-mobile-overview">
              <div className="booking-mobile-overview-top">
                <span className="eyebrow">Сертификат</span>
                <span className="booking-mobile-step-pill">
                  Шаг {step + 1} / {giftSteps.length}
                </span>
              </div>

              <div className="booking-mobile-overview-copy">
                <strong>{giftSteps[step]}</strong>
                <p>{giftStepNotes[step]}</p>
              </div>

              <div className="booking-mobile-overview-grid">
                <div className="booking-mobile-overview-item">
                  <span>Гостей</span>
                  <strong>{guestCount}</strong>
                </div>
                <div className="booking-mobile-overview-item">
                  <span>Отправка</span>
                  <strong>{selectedDeliveryLabel}</strong>
                </div>
                <div className="booking-mobile-overview-item">
                  <span>Цена за гостя</span>
                  <strong>{formatCurrency(pricePerGuest)}</strong>
                </div>
                <div className="booking-mobile-overview-item booking-mobile-overview-item-accent">
                  <span>Итого</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
              </div>
            </div>

            <div className="card booking-stepper">
              {giftSteps.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={clsx("step-chip", index === step && "active", index < step && "done")}
                  onClick={() => goToStep(index)}
                >
                  <span>{index < step ? <Check size={16} /> : index + 1}</span>
                  <small>{item}</small>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                className="card booking-panel gift-config-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.28 }}
              >
                {step === 0 ? (
                  <>
                    <div className="panel-heading">
                      <span className="eyebrow">Шаг 1</span>
                      <h2>Соберите сертификат по количеству гостей</h2>
                    </div>

                    <div className="gift-range-card">
                      <div className="gift-range-card-topline">
                        <span className="gift-range-chip">Сертификат на посещение</span>
                        <span className="gift-range-chip gift-range-chip-accent">До 12 человек</span>
                      </div>

                      <div className="gift-range-display">
                        <strong>{guestCount}</strong>
                        <span>
                          {guestCount} {getGuestWord(guestCount)} в сертификате
                        </span>
                      </div>

                      <div className="gift-range-counter">
                        <button
                          type="button"
                          className="counter-button"
                          onClick={() => updateGuestCount(guestCount - 1)}
                          disabled={guestCount <= GIFT_GUEST_MIN}
                          aria-label="Уменьшить количество гостей"
                        >
                          <Minus size={18} />
                        </button>

                        <input
                          type="range"
                          min={GIFT_GUEST_MIN}
                          max={GIFT_GUEST_MAX}
                          step="1"
                          value={guestCount}
                          onChange={(event) => updateGuestCount(Number(event.target.value))}
                          className="gift-range-slider"
                          aria-label="Количество гостей в сертификате"
                        />

                        <button
                          type="button"
                          className="counter-button"
                          onClick={() => updateGuestCount(guestCount + 1)}
                          disabled={guestCount >= GIFT_GUEST_MAX}
                          aria-label="Увеличить количество гостей"
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      <div className="gift-range-scale">
                        <span>{GIFT_GUEST_MIN}</span>
                        <span>{GIFT_GUEST_MAX}</span>
                      </div>

                      <div className="gift-price-highlight">
                        <span>Сейчас действует</span>
                        <strong>{formatCurrency(pricePerGuest)} за одного гостя</strong>
                        <small>Полная стоимость сертификата сразу: {formatCurrency(total)}</small>
                      </div>
                    </div>

                    <div className="gift-note-grid">
                      <article className="gift-note-card">
                        <div className="gift-note-icon">
                          <Gift size={18} />
                        </div>
                        <div>
                          <strong>Только на посещение</strong>
                          <p>Подарочные сертификаты у нас есть только на посещение.</p>
                        </div>
                      </article>

                      <article className="gift-note-card">
                        <div className="gift-note-icon">
                          <span>1-12</span>
                        </div>
                        <div>
                          <strong>Гибкое количество гостей</strong>
                          <p>Количество списанных человек в сертификате может меняться от 1 до 12.</p>
                        </div>
                      </article>

                      <article className="gift-note-card gift-note-card-accent">
                        <div className="gift-note-icon">
                          <span>₽</span>
                        </div>
                        <div>
                          <strong>Простая цена</strong>
                          <p>
                            Стоимость сертификата 1 500 ₽ на человека, а для группы от 3 до 12 человек цена снижается до
                            1 200 ₽ за одного гостя.
                          </p>
                        </div>
                      </article>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="panel-heading">
                      <span className="eyebrow">Шаг 2</span>
                      <h2>Укажите, кому и как отправить сертификат</h2>
                    </div>

                    <div className="gift-form-stack">
                      <section className="gift-form-group">
                        <div className="gift-form-group-head">
                          <span className="eyebrow">Покупатель</span>
                          <h3>Кто оплачивает сертификат</h3>
                        </div>

                        <div className="form-grid">
                          <label className="field">
                            <span>Имя покупателя</span>
                            <input type="text" placeholder="Ваше имя" {...register("purchaserName")} />
                            {errors.purchaserName ? <small className="field-error">{errors.purchaserName.message}</small> : null}
                          </label>

                          <label className="field">
                            <span>Телефон покупателя</span>
                            <input type="tel" placeholder="+7 (___) ___-__-__" {...register("purchaserPhone")} />
                            {errors.purchaserPhone ? <small className="field-error">{errors.purchaserPhone.message}</small> : null}
                          </label>

                          <label className="field field-full">
                            <span>Email покупателя</span>
                            <input type="email" placeholder="mail@example.com" {...register("purchaserEmail")} />
                            {errors.purchaserEmail ? <small className="field-error">{errors.purchaserEmail.message}</small> : null}
                          </label>
                        </div>
                      </section>

                      <section className="gift-form-group">
                        <div className="gift-form-group-head">
                          <span className="eyebrow">Получатель</span>
                          <h3>Для кого готовим подарок</h3>
                        </div>

                        <div className="form-grid">
                          <label className="field">
                            <span>Имя получателя</span>
                            <input type="text" placeholder="Имя получателя" {...register("recipientName")} />
                            {errors.recipientName ? <small className="field-error">{errors.recipientName.message}</small> : null}
                          </label>

                          <label className="field">
                            <span>Телефон получателя</span>
                            <input type="tel" placeholder="+7 (___) ___-__-__" {...register("recipientPhone")} />
                            {errors.recipientPhone ? <small className="field-error">{errors.recipientPhone.message}</small> : null}
                          </label>

                          <label className="field field-full">
                            <span>Email получателя</span>
                            <input type="email" placeholder="mail@example.com" {...register("recipientEmail")} />
                            {errors.recipientEmail ? <small className="field-error">{errors.recipientEmail.message}</small> : null}
                          </label>
                        </div>
                      </section>

                      <section className="gift-form-group">
                        <div className="gift-form-group-head">
                          <span className="eyebrow">Отправка</span>
                          <h3>Выберите удобный способ передачи</h3>
                        </div>

                        <div className="gift-delivery-grid">
                          {giftDeliveryOptions.map((option) => (
                            <label
                              key={option}
                              className={clsx("gift-delivery-option", deliveryMethod === option && "selected")}
                              data-tone={(deliveryMeta[option] ?? deliveryMeta.Email).tone}
                            >
                              <input
                                type="radio"
                                value={option}
                                className="gift-delivery-option-input"
                                {...register("deliveryMethod")}
                              />
                              <span className="gift-delivery-option-icon" aria-hidden="true">
                                <DeliveryIcon method={option} />
                              </span>
                              <span className="gift-delivery-option-copy">
                                <strong>{option}</strong>
                                <small>{(deliveryMeta[option] ?? deliveryMeta.Email).description}</small>
                              </span>
                            </label>
                          ))}
                        </div>

                        {needsDeliveryContact ? (
                          <label className="field field-full">
                            <span>{deliveryContactLabel}</span>
                            <input type="text" placeholder={deliveryContactPlaceholder} {...register("deliveryContact")} />
                            {errors.deliveryContact ? <small className="field-error">{errors.deliveryContact.message}</small> : null}
                          </label>
                        ) : null}
                      </section>

                      <section className="gift-form-group">
                        <div className="gift-form-group-head">
                          <span className="eyebrow">Тексты</span>
                          <h3>Добавьте сообщение получателю и заметку администратору</h3>
                        </div>

                        <div className="form-grid">
                          <label className="field field-full">
                            <span>Текст получателю</span>
                            <textarea
                              rows={4}
                              placeholder="Напишите поздравление или короткое сообщение для человека"
                              {...register("message")}
                            />
                            {errors.message ? <small className="field-error">{errors.message.message}</small> : null}
                          </label>

                          <label className="field field-full">
                            <span>Текст администратору</span>
                            <textarea
                              rows={3}
                              placeholder="Здесь можно указать детали оформления или пожелания по отправке"
                              {...register("comment")}
                            />
                            {errors.comment ? <small className="field-error">{errors.comment.message}</small> : null}
                          </label>
                        </div>
                      </section>
                    </div>
                  </>
                )}

                {stepError ? (
                  <p className="status-inline error">
                    <CircleAlert size={18} />
                    {stepError}
                  </p>
                ) : null}

                <div className="step-actions">
                  <div className="booking-mobile-action-meta">
                    <span>{mobileSelectionNote}</span>
                    <strong>{formatCurrency(total)}</strong>
                  </div>

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => goToStep(Math.max(0, step - 1))}
                    disabled={step === 0 || isSubmitting}
                  >
                    Назад
                  </button>

                  {step < giftSteps.length - 1 ? (
                    <button type="button" className="button button-primary" onClick={() => goToStep(step + 1)}>
                      Продолжить
                    </button>
                  ) : (
                    <button type="button" className="button button-primary" onClick={submitGiftOrder} disabled={isSubmitting}>
                      Оплатить сертификат
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className="booking-summary">
            <div className="card summary-card gift-summary-card">
              <div className="summary-header">
                <span className="eyebrow">Сводка по сертификату</span>
                <h3>Что оплатится сейчас</h3>
              </div>

              <div className="summary-list">
                <div className="summary-group">
                  <span className="summary-group-title">
                    <Gift size={16} />
                    Сертификат
                  </span>
                  <div className="summary-row">
                    <span>Формат</span>
                    <strong>На посещение</strong>
                  </div>
                  <div className="summary-row">
                    <span>Количество гостей</span>
                    <strong>
                      {guestCount} {getGuestWord(guestCount)}
                    </strong>
                  </div>
                  <div className="summary-row">
                    <span>Цена за человека</span>
                    <strong>{formatCurrency(pricePerGuest)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Способ отправки</span>
                    <strong>{selectedDeliveryLabel}</strong>
                  </div>
                </div>

                <div className="summary-group">
                  <span className="summary-group-title">
                    <Mail size={16} />
                    Контакты
                  </span>
                  <div className="summary-row">
                    <span>Покупатель</span>
                    <strong>{purchaserName || "Укажите на следующем шаге"}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Получатель</span>
                    <strong>{recipientName || "Укажите на следующем шаге"}</strong>
                  </div>
                  {deliveryContact ? (
                    <div className="summary-row">
                      <span>Контакт для отправки</span>
                      <strong>{deliveryContact}</strong>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="summary-total gift-summary-total">
                <span>Полная стоимость</span>
                <strong>{formatCurrency(total)}</strong>
              </div>

              <div className="status-inline success">
                <span>
                  Сертификат оплачивается полностью сразу. После оплаты заказ сразу попадет в CRM и администратор увидит,
                  кому и куда его нужно отправить.
                </span>
              </div>

              <div className="gift-summary-footnote">
                <strong>{certificateTitle}</strong>
                <p>{selectedDeliveryMeta.description}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
