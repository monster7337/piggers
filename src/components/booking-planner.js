"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { addDays, format } from "date-fns";
import { ru } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  CreditCard,
  Info,
  Minus,
  Plus,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  BOOKING_PREPAYMENT_PER_GUEST,
  FIXED_SLOT_TIMES,
  calculateExpectedPrepayment,
  defaultSettings,
  formatCurrency,
  getSlotCapacityState,
  readStoredAppointments,
  readStoredSettings,
  savePublicBooking
} from "@/components/admin/admin-data";
import { offerSections } from "@/lib/offer-data";
import { alternativeProject, rates } from "@/lib/site-data";

const bookingSteps = ["Билеты", "Дата", "Время", "Контакты", "Подтверждение"];
const bookingStepNotes = [
  "Выберите билеты",
  "Найдите удобный день",
  "Выберите удобное время",
  "Оставьте контакты",
  "Проверьте предоплату, оферту и остаток"
];

const siteRateToTariffMap = {
  standard: "Обычный билет",
  family: "Семейный билет",
  social: "Льготный билет",
  "happy-hour": "Счастливый час"
};

const contactSchema = z.object({
  name: z.string().min(2, "Введите имя"),
  phone: z
    .string()
    .min(10, "Введите телефон")
    .regex(/^\+?[0-9()\-\s]{10,18}$/, "Укажите телефон правильно"),
  email: z.string().email("Укажите корректный email"),
  comment: z.string().max(240, "Комментарий не должен превышать 240 символов").optional()
});

function createGuestTickets(selectedTickets) {
  return selectedTickets.flatMap((item) =>
    Array.from({ length: item.quantity }, () => ({
      tariff: siteRateToTariffMap[item.id] ?? "Обычный билет"
    }))
  );
}

function getStorageSnapshot() {
  return {
    appointments: readStoredAppointments(),
    settings: readStoredSettings() ?? defaultSettings
  };
}

export function BookingPlanner({ initialRate }) {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedRateQuantities, setSelectedRateQuantities] = useState(() =>
    initialRate && rates.some((rate) => rate.id === initialRate) ? { [initialRate]: 1 } : {}
  );
  const [activeInfoRateId, setActiveInfoRateId] = useState(initialRate || null);
  const [stepError, setStepError] = useState("");
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [storageSnapshot, setStorageSnapshot] = useState(() => ({
    appointments: [],
    settings: defaultSettings
  }));

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      comment: ""
    },
    mode: "onBlur"
  });

  useEffect(() => {
    setStorageSnapshot(getStorageSnapshot());

    function handleStorage() {
      setStorageSnapshot(getStorageSnapshot());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const selectedTickets = useMemo(
    () =>
      rates
        .map((rate) => ({
          ...rate,
          quantity: selectedRateQuantities[rate.id] || 0
        }))
        .filter((rate) => rate.quantity > 0),
    [selectedRateQuantities]
  );

  const guestTickets = useMemo(() => createGuestTickets(selectedTickets), [selectedTickets]);

  const ticketsTotal = selectedTickets.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalTicketsCount = selectedTickets.reduce((sum, item) => sum + item.quantity, 0);
  const total = ticketsTotal;
  const prepaymentNow = totalTicketsCount ? calculateExpectedPrepayment(totalTicketsCount, total) : 0;
  const remainingOnSite = Math.max(0, total - prepaymentNow);
  const values = getValues();

  const calendarDays = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const date = addDays(new Date(), index);
        const dateKey = format(date, "yyyy-MM-dd");
        const availableSlots = FIXED_SLOT_TIMES.filter((time) => {
          const state = getSlotCapacityState(storageSnapshot.appointments, storageSnapshot.settings, dateKey, time);
          return state.remainingGuests >= Math.max(1, totalTicketsCount);
        }).length;

        return {
          date,
          soldOut: availableSlots === 0,
          availableSlots
        };
      }),
    [storageSnapshot.appointments, storageSnapshot.settings, totalTicketsCount]
  );

  const timeSlots = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return FIXED_SLOT_TIMES.map((time) => {
      const state = getSlotCapacityState(storageSnapshot.appointments, storageSnapshot.settings, dateKey, time);

      return {
        time,
        remainingGuests: state.remainingGuests,
        disabled: state.remainingGuests < Math.max(1, totalTicketsCount),
        totalCapacity: state.totalCapacity
      };
    });
  }, [selectedDate, storageSnapshot.appointments, storageSnapshot.settings, totalTicketsCount]);

  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const state = getSlotCapacityState(storageSnapshot.appointments, storageSnapshot.settings, dateKey, selectedTime);

    if (state.remainingGuests < Math.max(1, totalTicketsCount)) {
      setSelectedTime("");
    }
  }, [selectedDate, selectedTime, storageSnapshot.appointments, storageSnapshot.settings, totalTicketsCount]);

  const hasSoldOutDates = calendarDays.some((item) => item.soldOut);
  const hasUnavailableTimeSlots = timeSlots.some((slot) => slot.disabled);
  const hasAvailableTimeSlots = timeSlots.some((slot) => !slot.disabled);
  const selectedDateLabel = selectedDate ? format(selectedDate, "d MMM", { locale: ru }) : "Выберите";
  const selectedTimeLabel = selectedTime || "Выберите";
  const mobileSelectionNote =
    totalTicketsCount > 0
      ? `${totalTicketsCount} мест · предоплата ${formatCurrency(prepaymentNow)}`
      : "Соберите визит по шагам";

  function updateRateQuantity(id, delta) {
    setSelectedRateQuantities((current) => {
      const nextQuantity = Math.max(0, (current[id] || 0) + delta);
      const next = { ...current };

      if (nextQuantity === 0) {
        delete next[id];
      } else {
        next[id] = nextQuantity;
      }

      return next;
    });
  }

  async function goToStep(nextStep) {
    setStepError("");

    if (nextStep <= step) {
      setStep(nextStep);
      return;
    }

    if (step === 0 && totalTicketsCount === 0) {
      setStepError("Добавьте хотя бы один билет перед продолжением.");
      return;
    }

    if (step === 1 && !selectedDate) {
      setStepError("Выберите дату визита.");
      return;
    }

    if (step === 2 && !selectedTime) {
      setStepError("Выберите доступное время.");
      return;
    }

    if (step === 3) {
      const isValid = await trigger();

      if (!isValid) {
        setStepError("Проверьте контактные данные перед продолжением.");
        return;
      }
    }

    setStep(nextStep);
  }

  const submitBooking = handleSubmit(async (formValues) => {
    const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

    try {
      if (!offerAccepted) {
        setStepError("Перед оплатой нужно ознакомиться с офертой и принять ее условия.");
        return;
      }

      const appointment = savePublicBooking({
        clientName: formValues.name,
        phone: formValues.phone,
        email: formValues.email,
        date: dateKey,
        time: selectedTime,
        guestTickets,
        selectedExtras: [],
        comment: formValues.comment
      });

      setStorageSnapshot(getStorageSnapshot());

      const params = new URLSearchParams({
        type: "booking",
        bookingId: appointment.id,
        items: selectedTickets.map((item) => `${item.name} x${item.quantity}`).join(", "),
        date: selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: ru }) : "",
        time: selectedTime,
        tickets: String(totalTicketsCount),
        total: formatCurrency(total),
        prepayment: formatCurrency(appointment.prepaymentAmount),
        remaining: formatCurrency(appointment.remainingAmount),
        name: formValues.name,
        phone: formValues.phone
      });

      router.push(`/booking/success?${params.toString()}`);
    } catch (error) {
      setStorageSnapshot(getStorageSnapshot());
      setStep(2);
      setStepError(error instanceof Error ? error.message : "Не удалось завершить бронирование.");
    }
  });

  return (
    <div className="booking-layout">
      <div className="booking-main">
        <div className="card booking-mobile-overview">
          <div className="booking-mobile-overview-top">
            <span className="eyebrow">Бронирование</span>
            <span className="booking-mobile-step-pill">
              Шаг {step + 1} / {bookingSteps.length}
            </span>
          </div>

          <div className="booking-mobile-overview-copy">
            <strong>{bookingSteps[step]}</strong>
            <p>{bookingStepNotes[step]}</p>
          </div>

          <div className="booking-mobile-overview-grid">
            <div className="booking-mobile-overview-item">
              <span>Билеты</span>
              <strong>{totalTicketsCount || "0"}</strong>
            </div>
            <div className="booking-mobile-overview-item">
              <span>Дата</span>
              <strong>{selectedDateLabel}</strong>
            </div>
            <div className="booking-mobile-overview-item">
              <span>Время</span>
              <strong>{selectedTimeLabel}</strong>
            </div>
            <div className="booking-mobile-overview-item booking-mobile-overview-item-accent">
              <span>Сейчас</span>
              <strong>{formatCurrency(prepaymentNow)}</strong>
            </div>
          </div>
        </div>

        <div className="card booking-stepper">
          {bookingSteps.map((item, index) => (
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
            className="card booking-panel"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.28 }}
          >
            {step === 0 ? (
              <>
                <div className="panel-heading">
                  <span className="eyebrow">Шаг 1</span>
                  <h2>Выберите билеты</h2>
                </div>

                <div className="ticket-grid">
                  {rates.map((rate) => {
                    const quantity = selectedRateQuantities[rate.id] || 0;
                    const infoOpen = activeInfoRateId === rate.id;

                    return (
                      <article key={rate.id} className={clsx("card ticket-card", quantity > 0 && "selected")}>
                        <div className="ticket-card-header">
                          <div className="ticket-price-group">
                            <strong>{formatCurrency(rate.price)} / билет</strong>
                            {rate.oldPrice ? (
                              <div className="ticket-old-row">
                                <span className="old-price">{formatCurrency(rate.oldPrice)}</span>
                                {rate.discount ? <span className="discount-badge">{rate.discount}</span> : null}
                              </div>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            className={clsx("info-dot-button", infoOpen && "active")}
                            aria-label={`Информация о тарифе ${rate.name}`}
                            onClick={() => setActiveInfoRateId(infoOpen ? null : rate.id)}
                          >
                            <Info size={14} />
                          </button>
                        </div>

                        {rate.badge ? <span className="ticket-tag">{rate.badge}</span> : null}

                        <h3>{rate.name}</h3>
                        <span className="ticket-description-label">Описание</span>
                        <p>{rate.description}</p>

                        {infoOpen ? (
                          <div className="ticket-info-box">
                            <p>{rate.details}</p>
                          </div>
                        ) : null}

                        <div className="ticket-footer">
                          {quantity === 0 ? (
                            <button type="button" className="button button-primary" onClick={() => updateRateQuantity(rate.id, 1)}>
                              Выбрать
                            </button>
                          ) : (
                            <div className="selection-state">
                              <span className="selected-state-pill">Выбрано</span>
                              <div className="quantity-stepper">
                                <button type="button" className="counter-button" onClick={() => updateRateQuantity(rate.id, -1)}>
                                  <Minus size={18} />
                                </button>
                                <strong>Сейчас выбран {quantity}</strong>
                                <button type="button" className="counter-button" onClick={() => updateRateQuantity(rate.id, 1)}>
                                  <Plus size={18} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <div className="panel-heading">
                  <span className="eyebrow">Шаг 2</span>
                  <h2>Выберите дату</h2>
                </div>
                <div className="calendar-grid">
                  {calendarDays.map((item) => {
                    const isSelected =
                      selectedDate &&
                      format(item.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

                    return (
                      <button
                        key={format(item.date, "yyyy-MM-dd")}
                        type="button"
                        className={clsx("calendar-card", isSelected && "selected", item.soldOut && "disabled")}
                        disabled={item.soldOut}
                        onClick={() => setSelectedDate(item.date)}
                      >
                        <span>{format(item.date, "EEE", { locale: ru })}</span>
                        <strong>{format(item.date, "d MMM", { locale: ru })}</strong>
                        <small>{item.soldOut ? "Нет мест" : `${item.availableSlots} интервала доступно`}</small>
                      </button>
                    );
                  })}
                </div>

                {hasSoldOutDates ? (
                  <div className="booking-detour-card">
                    <div className="booking-detour-copy">
                      <span className="booking-detour-badge">Если мест нет</span>
                      <h3>{alternativeProject.dateTitle}</h3>
                      <p>{alternativeProject.dateDescription}</p>
                    </div>
                    <a
                      className="button button-secondary booking-detour-button"
                      href={alternativeProject.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {alternativeProject.label}
                      <ArrowUpRight size={18} />
                    </a>
                  </div>
                ) : null}
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="panel-heading">
                  <span className="eyebrow">Шаг 3</span>
                  <h2>Выберите время</h2>
                </div>
                {selectedDate ? (
                  <>
                    <div className="slots-grid">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          className={clsx("slot-card", selectedTime === slot.time && "selected")}
                          disabled={slot.disabled}
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          <Clock3 size={16} />
                          <span>{slot.time}</span>
                          <small>{slot.disabled ? "Недостаточно мест" : `Свободно ${slot.remainingGuests}`}</small>
                        </button>
                      ))}
                    </div>

                    {hasUnavailableTimeSlots ? (
                      <div className={clsx("booking-detour-card", !hasAvailableTimeSlots && "sold-out")}>
                        <div className="booking-detour-copy">
                          <span className="booking-detour-badge">
                            {hasAvailableTimeSlots ? "Если это время занято" : "Свободного времени нет"}
                          </span>
                          <h3>{alternativeProject.timeTitle}</h3>
                          <p>{alternativeProject.timeDescription}</p>
                        </div>
                        <a
                          className="button button-secondary booking-detour-button"
                          href={alternativeProject.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {alternativeProject.label}
                          <ArrowUpRight size={18} />
                        </a>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="status-inline">
                    <CircleAlert size={18} />
                    <span>Сначала выберите дату, чтобы увидеть свободное время.</span>
                  </div>
                )}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="panel-heading">
                  <span className="eyebrow">Шаг 4</span>
                  <h2>Контактные данные</h2>
                </div>
                <div className="form-grid">
                  <label className="field">
                    <span>Имя</span>
                    <input type="text" placeholder="Как к вам обращаться" {...register("name")} />
                    {errors.name ? <small className="field-error">{errors.name.message}</small> : null}
                  </label>
                  <label className="field">
                    <span>Телефон</span>
                    <input type="tel" placeholder="+7 (___) ___-__-__" {...register("phone")} />
                    {errors.phone ? <small className="field-error">{errors.phone.message}</small> : null}
                  </label>
                  <label className="field">
                    <span>Email</span>
                    <input type="email" placeholder="mail@example.com" {...register("email")} />
                    {errors.email ? <small className="field-error">{errors.email.message}</small> : null}
                  </label>
                  <label className="field field-full">
                    <span>Комментарий</span>
                    <textarea rows={4} placeholder="Пожелания к визиту" {...register("comment")} />
                    {errors.comment ? <small className="field-error">{errors.comment.message}</small> : null}
                  </label>
                </div>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <div className="panel-heading">
                  <span className="eyebrow">Шаг 5</span>
                  <h2>Проверьте вашу запись</h2>
                </div>

                <div className="confirmation-card">
                  <div className="confirmation-grid">
                    <div>
                      <span>Билеты</span>
                      <strong>{selectedTickets.map((item) => `${item.name} x${item.quantity}`).join(", ")}</strong>
                    </div>
                    <div>
                      <span>Дата</span>
                      <strong>
                        {selectedDate ? format(selectedDate, "d MMMM, EEEE", { locale: ru }) : "Не выбрана"}
                      </strong>
                    </div>
                    <div>
                      <span>Время</span>
                      <strong>{selectedTime || "Не выбрано"}</strong>
                    </div>
                    <div>
                      <span>Дополнительно</span>
                      <strong>Корм и бутылочка оформляются на месте</strong>
                    </div>
                    <div>
                      <span>Имя</span>
                      <strong>{values.name || "Не указано"}</strong>
                    </div>
                    <div>
                      <span>Телефон</span>
                      <strong>{values.phone || "Не указан"}</strong>
                    </div>
                    <div>
                      <span>Предоплата сейчас</span>
                      <strong>{formatCurrency(prepaymentNow)}</strong>
                    </div>
                    <div>
                      <span>Остаток на месте</span>
                      <strong>{formatCurrency(remainingOnSite)}</strong>
                    </div>
                  </div>

                  <div className="status-inline success">
                    <CreditCard size={18} />
                    <span>
                      На сайте оплачивается только предоплата: {formatCurrency(BOOKING_PREPAYMENT_PER_GUEST)} за каждое место.
                      Остаток {formatCurrency(remainingOnSite)} администратор отметит в CRM при оплате на месте.
                    </span>
                  </div>

                  <div className="offer-acceptance-shell">
                    <label className={clsx("offer-acceptance-toggle", offerAccepted && "is-checked")}>
                      <input
                        type="checkbox"
                        className="offer-acceptance-toggle-input"
                        checked={offerAccepted}
                        onChange={(event) => {
                          setOfferAccepted(event.target.checked);
                          if (event.target.checked) {
                            setStepError("");
                          }
                        }}
                      />
                      <span className="offer-acceptance-toggle-box" aria-hidden="true">
                        <Check size={14} strokeWidth={2.8} />
                      </span>
                      <span className="offer-acceptance-toggle-copy">
                        <strong>Принимаю условия договора оферты</strong>
                        <small>Галочку можно поставить сразу. Сам текст оферты открывается в блоке ниже.</small>
                      </span>
                    </label>

                    <details className="offer-acceptance-card">
                      <summary className="offer-acceptance-summary">
                        <span className="offer-acceptance-summary-copy">
                          <Info size={18} />
                          <span>
                            <strong>Договор оферты перед оплатой</strong>
                            <small>Откройте блок, если хотите ознакомиться с условиями прямо здесь.</small>
                          </span>
                        </span>
                        <span className="offer-acceptance-summary-action">Читать оферту</span>
                      </summary>

                      <div className="offer-acceptance-body">
                        <div className="offer-acceptance-sections">
                          {offerSections.map((section) => (
                            <section key={section.title} className="offer-acceptance-section">
                              <h3>{section.title}</h3>
                              {section.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                              ))}
                            </section>
                          ))}
                        </div>

                        <Link href="/offer" className="offer-acceptance-link" target="_blank" rel="noreferrer">
                          Открыть полную страницу оферты
                          <ArrowUpRight size={16} />
                        </Link>
                      </div>
                    </details>
                  </div>

                  {!offerAccepted ? (
                    <p className="offer-acceptance-note">
                      Кнопка оплаты станет активной после принятия условий оферты.
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}

            {stepError ? (
              <p className="status-inline error">
                <CircleAlert size={18} />
                {stepError}
              </p>
            ) : null}

            <div className="step-actions">
              <div className="booking-mobile-action-meta">
                <span>{mobileSelectionNote}</span>
                <strong>{formatCurrency(prepaymentNow)}</strong>
              </div>

              <button
                type="button"
                className="button button-secondary"
                onClick={() => goToStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                Назад
              </button>

              {step < bookingSteps.length - 1 ? (
                <button type="button" className="button button-primary" onClick={() => goToStep(step + 1)}>
                  Продолжить
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={submitBooking}
                  disabled={!offerAccepted}
                >
                  Оплатить
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <aside className="booking-summary">
        <div className="card summary-card">
          <div className="summary-header">
            <span className="eyebrow">Ваш визит</span>
            <h3>Ваш заказ</h3>
          </div>

          <div className="summary-list">
            <div className="summary-group">
              <span className="summary-group-title">
                <ShoppingBag size={16} />
                Билеты
              </span>
              {selectedTickets.length ? (
                selectedTickets.map((item) => (
                  <div key={item.id} className="summary-row">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                ))
              ) : (
                <div className="summary-row">
                  <span>Пока ничего не выбрано</span>
                  <strong>0 ₽</strong>
                </div>
              )}
            </div>

            <div className="summary-group">
              <span className="summary-group-title">
                <CalendarDays size={16} />
                Детали визита
              </span>
              <div className="summary-row">
                <span>Дата</span>
                <strong>{selectedDate ? format(selectedDate, "d MMM", { locale: ru }) : "Выберите"}</strong>
              </div>
              <div className="summary-row">
                <span>Время</span>
                <strong>{selectedTime || "Выберите"}</strong>
              </div>
              <div className="summary-row">
                <span>Билетов</span>
                <strong>{totalTicketsCount}</strong>
              </div>
            </div>

            <div className="summary-group">
              <span className="summary-group-title">
                <CreditCard size={16} />
                Оплата
              </span>
              <div className="summary-row">
                <span>Полная стоимость</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div className="summary-row">
                <span>Предоплата сейчас</span>
                <strong>{formatCurrency(prepaymentNow)}</strong>
              </div>
              <div className="summary-row">
                <span>Оплата на месте</span>
                <strong>{formatCurrency(remainingOnSite)}</strong>
              </div>
            </div>
          </div>

          <div className="status-inline success">
            <CreditCard size={18} />
            <span>
              Бронь фиксируется после предоплаты {formatCurrency(BOOKING_PREPAYMENT_PER_GUEST)} за каждого гостя.
              Корм и бутылочка оформляются уже на месте.
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
