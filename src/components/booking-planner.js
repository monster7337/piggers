"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { addDays, format } from "date-fns";
import { ru } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  BOOKING_PREPAYMENT_PER_GUEST,
  FIXED_SLOT_TIMES,
  calculateExpectedPrepayment,
  defaultSettings,
  formatCurrency,
  isHappyHourEnabled,
  getSlotCapacityState,
  readStoredAppointments,
  readStoredSettings,
  savePublicBooking
} from "@/components/admin/admin-data";
import { createPaykeeperInvoice } from "@/lib/paykeeper-client";
import { alternativeProject, rates } from "@/lib/site-data";
const BOOKING_DRAFT_STORAGE_KEY = "piggyland-booking-draft";

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
      tariff: siteRateToTariffMap[item.effectiveTariffId || item.id] ?? "Обычный билет"
    }))
  );
}

function getStorageSnapshot() {
  return {
    appointments: readStoredAppointments(),
    settings: readStoredSettings() ?? defaultSettings
  };
}

function getIntervalWord(count) {
  const normalizedCount = Math.abs(count);
  const lastTwoDigits = normalizedCount % 100;
  const lastDigit = normalizedCount % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "интервалов";
  }

  if (lastDigit === 1) {
    return "интервал";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "интервала";
  }

  return "интервалов";
}

function areRateQuantitiesEqual(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
}

function normalizeHappyHourRateSelection(rateQuantities, shouldUseHappyHourRate) {
  const standardCount = rateQuantities.standard || 0;
  const happyHourCount = rateQuantities["happy-hour"] || 0;

  if (standardCount === 0 && happyHourCount === 0) {
    return rateQuantities;
  }

  const targetRateId = shouldUseHappyHourRate ? "happy-hour" : "standard";
  const totalCount = standardCount + happyHourCount;
  const next = { ...rateQuantities };

  delete next.standard;
  delete next["happy-hour"];
  next[targetRateId] = totalCount;

  return next;
}

export function BookingPlanner({ initialRate }) {

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedRateQuantities, setSelectedRateQuantities] = useState(() =>
    initialRate && rates.some((rate) => rate.id === initialRate) ? { [initialRate]: 1 } : {}
  );
  const [activeInfoRateId, setActiveInfoRateId] = useState(initialRate || null);
  const [stepError, setStepError] = useState("");
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [personalDataAccepted, setPersonalDataAccepted] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [storageSnapshot, setStorageSnapshot] = useState(() => ({
    appointments: [],
    settings: defaultSettings
  }));

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    getValues,
    watch,
    formState: { errors, isSubmitting }
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

  const watchedValues = watch();

  useEffect(() => {
    const raw = window.sessionStorage.getItem(BOOKING_DRAFT_STORAGE_KEY);
    if (!raw) {
      setIsDraftRestored(true);
      return;
    }

    try {
      const draft = JSON.parse(raw);
      if (typeof draft.step === "number") setStep(Math.max(0, Math.min(bookingSteps.length - 1, draft.step)));
      if (draft.selectedDate) setSelectedDate(new Date(draft.selectedDate));
      if (draft.selectedTime) setSelectedTime(draft.selectedTime);
      if (draft.selectedRateQuantities) setSelectedRateQuantities(draft.selectedRateQuantities);
      if (typeof draft.offerAccepted === "boolean") setOfferAccepted(draft.offerAccepted);
      if (typeof draft.personalDataAccepted === "boolean") setPersonalDataAccepted(draft.personalDataAccepted);
      if (draft.formValues) reset(draft.formValues);
    } catch {
      window.sessionStorage.removeItem(BOOKING_DRAFT_STORAGE_KEY);
    } finally {
      setIsDraftRestored(true);
    }
  }, [reset]);

  const saveDraft = useCallback(() => {
    const currentFormValues = getValues();

    window.sessionStorage.setItem(
      BOOKING_DRAFT_STORAGE_KEY,
      JSON.stringify({
        step,
        selectedDate: selectedDate ? selectedDate.toISOString() : "",
        selectedTime,
        selectedRateQuantities,
        offerAccepted,
        personalDataAccepted,
        formValues: currentFormValues
      })
    );
  }, [getValues, offerAccepted, personalDataAccepted, selectedDate, selectedRateQuantities, selectedTime, step]);

  const handleLegalLinkIntent = useCallback((event) => {
    event?.stopPropagation?.();
    saveDraft();
  }, [saveDraft]);

  useEffect(() => {
    if (!isDraftRestored) {
      return;
    }

    saveDraft();
  }, [isDraftRestored, saveDraft]);

  useEffect(() => {
    if (!isDraftRestored) {
      return undefined;
    }

    const persistDraft = () => saveDraft();
    const persistWhenHidden = () => {
      if (document.visibilityState === "hidden") {
        saveDraft();
      }
    };

    window.addEventListener("pagehide", persistDraft);
    window.addEventListener("beforeunload", persistDraft);
    window.addEventListener("popstate", persistDraft);
    document.addEventListener("visibilitychange", persistWhenHidden);

    return () => {
      window.removeEventListener("pagehide", persistDraft);
      window.removeEventListener("beforeunload", persistDraft);
      window.removeEventListener("popstate", persistDraft);
      document.removeEventListener("visibilitychange", persistWhenHidden);
    };
  }, [isDraftRestored, saveDraft]);

  const happyHourRate = rates.find((rate) => rate.id === "happy-hour");
  const standardRate = rates.find((rate) => rate.id === "standard");
  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const happyHourDiscountActive = Boolean(
    selectedDateKey && selectedTime && isHappyHourEnabled(storageSnapshot.settings, selectedDateKey, selectedTime)
  );

  useEffect(() => {
    if (!selectedTime) {
      return;
    }

    setSelectedRateQuantities((current) => {
      const next = normalizeHappyHourRateSelection(current, happyHourDiscountActive);
      return areRateQuantitiesEqual(current, next) ? current : next;
    });
  }, [happyHourDiscountActive, selectedTime]);

  const selectedTickets = useMemo(
    () =>
      rates
        .map((rate) => {
          const quantity = selectedRateQuantities[rate.id] || 0;

          return {
            ...rate,
            quantity,
            price: rate.price,
            originalPrice: rate.price,
            effectiveTariffId: rate.id,
            hasHappyHourDiscount: rate.id === "happy-hour"
          };
        })
        .filter((rate) => rate.quantity > 0),
    [selectedRateQuantities]
  );

  const guestTickets = useMemo(() => createGuestTickets(selectedTickets), [selectedTickets]);

  const ticketsTotal = selectedTickets.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalTicketsCount = selectedTickets.reduce((sum, item) => sum + item.quantity, 0);
  const happyHourDiscountedTicketsCount = selectedTickets.reduce(
    (sum, item) => sum + (item.id === "happy-hour" ? item.quantity : 0),
    0
  );
  const happyHourDiscountAmount = selectedTickets.reduce(
    (sum, item) =>
      sum +
      (item.id === "happy-hour" && standardRate ? (standardRate.price - item.price) * item.quantity : 0),
    0
  );
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
        isHappyHour: isHappyHourEnabled(storageSnapshot.settings, dateKey, time),
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
      if (!offerAccepted || !personalDataAccepted) {
        setStepError("Перед оплатой нужно принять условия оферты и согласие на обработку персональных данных.");
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
        prepayment: formatCurrency(prepaymentNow),
        remaining: formatCurrency(remainingOnSite),
        name: formValues.name,
        phone: formValues.phone
      });
      const invoice = await createPaykeeperInvoice({
        amount: prepaymentNow,
        orderId: appointment.id,
        clientName: formValues.name,
        clientEmail: formValues.email,
        clientPhone: formValues.phone,
        serviceName: `Piggy Land: бронь ${selectedTickets.map((item) => `${item.name} x${item.quantity}`).join(", ")}`,
        successPath: `/booking/success?${params.toString()}`
      });

      window.sessionStorage.removeItem(BOOKING_DRAFT_STORAGE_KEY);
      window.location.assign(invoice.paymentUrl);
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
            data-step={step}
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
                        <p>
                          <span className="mobile-ticket-description">{rate.mobileDescription || rate.description}</span>
                          <span className="desktop-ticket-description">{rate.description}</span>
                        </p>

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
                        <span>{format(item.date, "EEEEEE", { locale: ru })}</span>
                        <strong>{format(item.date, "d MMM", { locale: ru })}</strong>
                        <small>
                          {item.soldOut
                            ? "Нет мест"
                            : `${item.availableSlots} ${getIntervalWord(item.availableSlots)} доступно`}
                        </small>
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
                          {slot.isHappyHour ? <small className="slot-card-note">Счастливый час</small> : null}
                        </button>
                      ))}
                    </div>

                    {happyHourDiscountedTicketsCount > 0 && happyHourRate && standardRate ? (
                      <div className="status-inline success">
                        <CreditCard size={18} />
                        <span>
                          Вы выбрали будний слот {selectedTime}. Для входного билета действует "Счастливый час":
                          цена снижена с {formatCurrency(standardRate.price)} до {formatCurrency(happyHourRate.price)}
                          {happyHourDiscountedTicketsCount > 1 ? ` за каждый из ${happyHourDiscountedTicketsCount} билетов` : ""}.
                        </span>
                      </div>
                    ) : null}

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
                      Остаток {formatCurrency(remainingOnSite)} вы оплатите на месте перед началом визита.
                    </span>
                  </div>

                  <div className="offer-acceptance-shell">
                    <div className={clsx("offer-acceptance-toggle", offerAccepted && "is-checked")}>
                      <input
                        id="piggy-offer-accepted"
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
                      <label htmlFor="piggy-offer-accepted" className="offer-acceptance-toggle-control">
                        <span className="offer-acceptance-toggle-box" aria-hidden="true">
                          <Check size={14} strokeWidth={2.8} />
                        </span>
                      </label>
                      <span className="offer-acceptance-toggle-copy">
                        <strong>
                          Принимаю{" "}
                          <Link
                            href="/terms-of-use"
                            prefetch
                            className="offer-acceptance-link"
                            onMouseDown={handleLegalLinkIntent}
                            onTouchStart={handleLegalLinkIntent}
                            onClick={handleLegalLinkIntent}
                          >
                            условия использования
                          </Link>
                          ,{" "}
                          <Link
                            href="/privacy-policy"
                            prefetch
                            className="offer-acceptance-link"
                            onMouseDown={handleLegalLinkIntent}
                            onTouchStart={handleLegalLinkIntent}
                            onClick={handleLegalLinkIntent}
                          >
                            политику конфиденциальности
                          </Link>{" "}
                          и{" "}
                          <Link
                            href="/public-offer"
                            prefetch
                            className="offer-acceptance-link"
                            onMouseDown={handleLegalLinkIntent}
                            onTouchStart={handleLegalLinkIntent}
                            onClick={handleLegalLinkIntent}
                          >
                            публичную оферту
                          </Link>
                        </strong>
                        <small>Каждый документ открывается по отдельной ссылке.</small>
                      </span>
                    </div>

                    <div className={clsx("offer-acceptance-toggle", personalDataAccepted && "is-checked")}>
                      <input
                        id="piggy-personal-data-accepted"
                        type="checkbox"
                        className="offer-acceptance-toggle-input"
                        checked={personalDataAccepted}
                        onChange={(event) => {
                          setPersonalDataAccepted(event.target.checked);
                          if (event.target.checked) {
                            setStepError("");
                          }
                        }}
                      />
                      <label htmlFor="piggy-personal-data-accepted" className="offer-acceptance-toggle-control">
                        <span className="offer-acceptance-toggle-box" aria-hidden="true">
                          <Check size={14} strokeWidth={2.8} />
                        </span>
                      </label>
                      <span className="offer-acceptance-toggle-copy">
                        <strong>
                          Даю согласие на{" "}
                          <Link
                            href="/personal-data-consent"
                            prefetch
                            className="offer-acceptance-link"
                            onMouseDown={handleLegalLinkIntent}
                            onTouchStart={handleLegalLinkIntent}
                            onClick={handleLegalLinkIntent}
                          >
                            обработку моих персональных данных
                          </Link>
                        </strong>
                        <small>Согласие открывается на отдельной странице.</small>
                      </span>
                    </div>
                  </div>

                  {!offerAccepted || !personalDataAccepted ? (
                    <p className="offer-acceptance-note">
                      Кнопка оплаты станет активной после принятия условий оферты и согласия на обработку персональных данных.
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

            <div className="step-actions booking-desktop-actions">
              <div className="booking-mobile-action-meta">
                <div>
                  <span>{selectedDateLabel} · {selectedTimeLabel} · {totalTicketsCount || 0} бил.</span>
                  <small>Всего {formatCurrency(total)} · на месте {formatCurrency(remainingOnSite)}</small>
                </div>
                <div>
                  <span>Предоплата</span>
                  <strong>{formatCurrency(prepaymentNow)}</strong>
                </div>
              </div>

              <button
                type="button"
                className="button button-secondary"
                onClick={() => goToStep(Math.max(0, step - 1))}
                disabled={step === 0 || isSubmitting}
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
                  disabled={isSubmitting || !offerAccepted || !personalDataAccepted}
                >
                  Оплатить
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="step-actions booking-mobile-fixed-actions">
          <div className="booking-mobile-action-meta">
            <div>
              <span>{selectedDateLabel} · {selectedTimeLabel} · {totalTicketsCount || 0} бил.</span>
              <small>Всего {formatCurrency(total)} · на месте {formatCurrency(remainingOnSite)}</small>
            </div>
            <div>
              <span>Предоплата</span>
              <strong>{formatCurrency(prepaymentNow)}</strong>
            </div>
          </div>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => goToStep(Math.max(0, step - 1))}
            disabled={step === 0 || isSubmitting}
          >
            Назад
          </button>
          {step < bookingSteps.length - 1 ? (
            <button type="button" className="button button-primary" onClick={() => goToStep(step + 1)} disabled={isSubmitting}>
              Продолжить
            </button>
          ) : (
            <button
              type="button"
              className="button button-primary"
              onClick={submitBooking}
              disabled={isSubmitting || !offerAccepted || !personalDataAccepted}
            >
              Оплатить
            </button>
          )}
        </div>
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
                      {item.hasHappyHourDiscount ? " · цена счастливого часа" : ""}
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
              {happyHourDiscountAmount > 0 ? (
                <div className="summary-row">
                  <span>Скидка счастливого часа</span>
                  <strong>-{formatCurrency(happyHourDiscountAmount)}</strong>
                </div>
              ) : null}
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
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
