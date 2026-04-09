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
  ArrowUpRight,
  ShoppingBag
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { alternativeProject, extras, rates } from "@/lib/site-data";

const bookingSteps = ["Билеты", "Дата", "Время", "Услуги", "Контакты", "Подтверждение"];

const contactSchema = z.object({
  name: z.string().min(2, "Введите имя"),
  phone: z
    .string()
    .min(10, "Введите телефон")
    .regex(/^\+?[0-9()\-\s]{10,18}$/, "Укажите телефон в корректном формате"),
  email: z.string().email("Укажите корректный email"),
  comment: z.string().max(240, "Комментарий не должен превышать 240 символов").optional()
});

function formatCurrency(value) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

export function BookingPlanner({ initialRate }) {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedRateQuantities, setSelectedRateQuantities] = useState(() =>
    initialRate && rates.some((rate) => rate.id === initialRate) ? { [initialRate]: 1 } : {}
  );
  const [selectedServiceQuantities, setSelectedServiceQuantities] = useState({});
  const [activeInfoRateId, setActiveInfoRateId] = useState(initialRate || null);
  const [stepError, setStepError] = useState("");

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

  const calendarDays = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const date = addDays(new Date(), index);

        return {
          date,
          soldOut: index === 4 || index === 9
        };
      }),
    []
  );

  const timeSlots = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const dayIndex = calendarDays.findIndex(
      (item) => format(item.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    );
    const baseSlots = ["11:00", "13:00", "15:00", "17:00", "18:00", "19:00"];

    return baseSlots.map((time, index) => ({
      time,
      disabled: calendarDays[dayIndex]?.soldOut || (dayIndex + index) % 5 === 0
    }));
  }, [calendarDays, selectedDate]);

  const hasSoldOutDates = calendarDays.some((item) => item.soldOut);
  const hasUnavailableTimeSlots = timeSlots.some((slot) => slot.disabled);
  const hasAvailableTimeSlots = timeSlots.some((slot) => !slot.disabled);

  const selectedTickets = rates
    .map((rate) => ({
      ...rate,
      quantity: selectedRateQuantities[rate.id] || 0
    }))
    .filter((rate) => rate.quantity > 0);

  const selectedServices = extras
    .filter((service) => selectedServiceQuantities[service.id])
    .map((service) => ({
      ...service,
      quantity: 1
    }));

  const ticketsTotal = selectedTickets.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const servicesTotal = selectedServices.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalTicketsCount = selectedTickets.reduce((sum, item) => sum + item.quantity, 0);
  const total = ticketsTotal + servicesTotal;
  const values = getValues();

  const updateRateQuantity = (id, delta) => {
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
  };

  const toggleServiceSelection = (id) => {
    setSelectedServiceQuantities((current) => {
      const next = { ...current };

      if (next[id]) {
        delete next[id];
      } else {
        next[id] = 1;
      }

      return next;
    });
  };

  const goToStep = async (nextStep) => {
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

    if (step === 4) {
      const isValid = await trigger();

      if (!isValid) {
        setStepError("Проверьте контактные данные перед продолжением.");
        return;
      }
    }

    setStep(nextStep);
  };

  const submitBooking = handleSubmit((formValues) => {
    const params = new URLSearchParams({
      items: selectedTickets.map((item) => `${item.name} x${item.quantity}`).join(", "),
      services: selectedServices.map((item) => item.title).join(", "),
      date: selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: ru }) : "",
      time: selectedTime,
      tickets: String(totalTicketsCount),
      total: formatCurrency(total),
      name: formValues.name,
      phone: formValues.phone
    });

    router.push(`/booking/success?${params.toString()}`);
  });

  return (
    <div className="booking-layout">
      <div className="booking-main">
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
                            <strong>{formatCurrency(rate.price)} / час</strong>
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
                            <button
                              type="button"
                              className="button button-primary"
                              onClick={() => updateRateQuantity(rate.id, 1)}
                            >
                              Выбрать
                            </button>
                          ) : (
                            <div className="selection-state">
                              <span className="selected-state-pill">Выбрано</span>
                              <div className="quantity-stepper">
                                <button
                                  type="button"
                                  className="counter-button"
                                  onClick={() => updateRateQuantity(rate.id, -1)}
                                >
                                  <Minus size={18} />
                                </button>
                                <strong>Сейчас выбран {quantity}</strong>
                                <button
                                  type="button"
                                  className="counter-button"
                                  onClick={() => updateRateQuantity(rate.id, 1)}
                                >
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
                        <small>{item.soldOut ? "Нет мест" : "Есть слоты"}</small>
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
                          <small>{slot.disabled ? "Недоступно" : "Свободный слот"}</small>
                        </button>
                      ))}
                    </div>

                    {hasUnavailableTimeSlots ? (
                      <div className={clsx("booking-detour-card", !hasAvailableTimeSlots && "sold-out")}>
                        <div className="booking-detour-copy">
                          <span className="booking-detour-badge">{hasAvailableTimeSlots ? "Если слот занят" : "Свободных слотов нет"}</span>
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
                    <span>Сначала выберите дату, чтобы увидеть доступные слоты.</span>
                  </div>
                )}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="panel-heading">
                  <span className="eyebrow">Шаг 4</span>
                  <h2>Добавьте услуги</h2>
                </div>

                <div className="service-grid">
                  {extras.map((item) => {
                    const quantity = selectedServiceQuantities[item.id] || 0;

                    return (
                      <article key={item.id} className={clsx("card service-card", quantity > 0 && "selected")}>
                        <div className="service-card-header">
                          <strong>{formatCurrency(item.price)}</strong>
                          <span className="views-pill">Посмотрели {item.views.toLocaleString("ru-RU")} человек</span>
                        </div>
                        <h3>{item.title}</h3>
                        <span className="ticket-description-label">Описание</span>
                        <p>{item.description}</p>
                        <div className="ticket-footer">
                          {quantity === 0 ? (
                            <button
                              type="button"
                              className="button button-primary"
                              onClick={() => toggleServiceSelection(item.id)}
                            >
                              Выбрать
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="button button-secondary button-block service-selected-button"
                              onClick={() => toggleServiceSelection(item.id)}
                            >
                              Выбрано
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <div className="panel-heading">
                  <span className="eyebrow">Шаг 5</span>
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

            {step === 5 ? (
              <>
                <div className="panel-heading">
                  <span className="eyebrow">Шаг 6</span>
                  <h2>Подтверждение и переход к оплате</h2>
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
                      <span>Услуги</span>
                      <strong>
                        {selectedServices.length
                          ? selectedServices.map((item) => item.title).join(", ")
                          : "Без дополнительных услуг"}
                      </strong>
                    </div>
                    <div>
                      <span>Имя</span>
                      <strong>{values.name || "Не указано"}</strong>
                    </div>
                    <div>
                      <span>Телефон</span>
                      <strong>{values.phone || "Не указан"}</strong>
                    </div>
                  </div>

                  <div className="status-inline success">
                    <CreditCard size={18} />
                    <span>
                      После подтверждения записи мы показываем итог заказа. Онлайн-оплата и финальная интеграция
                      платежного провайдера подключаются отдельным этапом.
                    </span>
                  </div>
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
                <button type="button" className="button button-primary" onClick={submitBooking}>
                  Перейти к оплате
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
              <span className="summary-group-title">Услуги</span>
              {selectedServices.length ? (
                selectedServices.map((item) => (
                  <div key={item.id} className="summary-row">
                    <span>{item.title}</span>
                    <strong>{formatCurrency(item.price)}</strong>
                  </div>
                ))
              ) : (
                <div className="summary-row">
                  <span>Без дополнительных услуг</span>
                  <strong>0 ₽</strong>
                </div>
              )}
            </div>
          </div>

          <div className="summary-total">
            <span>Итоговая сумма</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <p className="muted-text">
            На этом шаге можно собрать несколько билетов разных типов и добавить услуги поштучно в одном заказе.
          </p>
        </div>
      </aside>
    </div>
  );
}
