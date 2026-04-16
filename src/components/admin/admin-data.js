export const ADMIN_AUTH_KEY = "piggyland-admin-auth";
export const ADMIN_APPOINTMENTS_KEY = "piggyland-admin-appointments";
export const ADMIN_SETTINGS_KEY = "piggyland-admin-settings";

export const SLOT_CAPACITY = 13;
export const FIXED_SLOT_TIMES = ["11:00", "13:00", "15:00", "17:00", "19:00"];

export const mockCredentials = {
  login: "user",
  password: "123"
};

export const statusOptions = [
  { value: "new", label: "Новая", tone: "info" },
  { value: "pending", label: "Ожидает подтверждения", tone: "warning" },
  { value: "confirmed", label: "Подтверждена", tone: "success" },
  { value: "completed", label: "Завершена", tone: "muted" },
  { value: "canceled", label: "Отменена", tone: "danger" }
];

export const serviceOptions = [
  "Обычный билет",
  "Семейный билет",
  "Льготный билет",
  "Счастливый час"
];

export const ticketCatalog = {
  "Обычный билет": {
    label: "Обычный билет",
    shortLabel: "Обычный",
    price: 1500
  },
  "Семейный билет": {
    label: "Семейный билет",
    shortLabel: "Семейный",
    price: 1200
  },
  "Льготный билет": {
    label: "Льготный билет",
    shortLabel: "Льготный",
    price: 1000
  },
  "Счастливый час": {
    label: "Счастливый час",
    shortLabel: "Счастливый час",
    price: 1000
  }
};

export const durationOptions = [60];
export const sourceOptions = ["Сайт", "Телефон", "Telegram", "Instagram", "Повторный визит"];
export const paymentMethodOptions = [
  { value: "card", label: "Безнал" },
  { value: "cash", label: "Наличные" }
];

export const accentThemes = {
  cyan: {
    label: "Неоновый циан",
    accent: "#50d2ff",
    accentSoft: "rgba(80, 210, 255, 0.18)",
    accentGlow: "rgba(80, 210, 255, 0.35)"
  },
  blue: {
    label: "Электрик-синий",
    accent: "#5c7cff",
    accentSoft: "rgba(92, 124, 255, 0.18)",
    accentGlow: "rgba(92, 124, 255, 0.34)"
  },
  mint: {
    label: "Холодный mint",
    accent: "#37e0c5",
    accentSoft: "rgba(55, 224, 197, 0.18)",
    accentGlow: "rgba(55, 224, 197, 0.34)"
  }
};

export const defaultSettings = {
  crmName: "Piggy Land CRM",
  businessName: "Piggy Land",
  workdayStart: "11:00",
  workdayEnd: "21:00",
  slotDuration: 60,
  accentTheme: "cyan",
  darkThemeByDefault: true,
  timeFormat: "24h",
  startRoute: "/admin/dashboard"
};

const memoryStorage = new Map();

function getSafeLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const testKey = "__piggyland_admin_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readAdminStorage(key) {
  const storage = getSafeLocalStorage();

  if (storage) {
    try {
      return storage.getItem(key);
    } catch {
      return memoryStorage.get(key) ?? null;
    }
  }

  return memoryStorage.get(key) ?? null;
}

export function writeAdminStorage(key, value) {
  const normalizedValue = String(value);
  const storage = getSafeLocalStorage();

  if (storage) {
    try {
      storage.setItem(key, normalizedValue);
      return;
    } catch {}
  }

  memoryStorage.set(key, normalizedValue);
}

export function removeAdminStorage(key) {
  const storage = getSafeLocalStorage();

  if (storage) {
    try {
      storage.removeItem(key);
    } catch {}
  }

  memoryStorage.delete(key);
}

export function readAdminJson(key, fallbackValue) {
  const rawValue = readAdminStorage(key);

  if (!rawValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

export function writeAdminJson(key, value) {
  writeAdminStorage(key, JSON.stringify(value));
}

const longDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const shortDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short"
});

const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short"
});

const monthFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric"
});

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

function cloneDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
}

function normalizeGuestCount(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return 1;
  }

  return Math.max(1, Math.round(normalized));
}

function normalizeTime(time) {
  return FIXED_SLOT_TIMES.includes(time) ? time : FIXED_SLOT_TIMES[0];
}

function normalizeAmount(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized < 0) {
    return 0;
  }

  return Math.round(normalized);
}

function normalizeTariff(tariff) {
  return serviceOptions.includes(tariff) ? tariff : serviceOptions[0];
}

function normalizePaymentMethod(method) {
  return paymentMethodOptions.some((item) => item.value === method) ? method : "";
}

function createGuestTicket(tariff, index) {
  return {
    id: `guest-${index + 1}-${Math.random().toString(36).slice(2, 8)}`,
    tariff: normalizeTariff(tariff)
  };
}

function normalizeGuestTickets(guestTickets, guestCount, fallbackTariff = serviceOptions[0]) {
  if (Array.isArray(guestTickets) && guestTickets.length) {
    return guestTickets.map((ticket, index) => ({
      id: ticket.id || `guest-${index + 1}`,
      tariff: normalizeTariff(ticket.tariff ?? ticket.service ?? fallbackTariff)
    }));
  }

  return Array.from({ length: normalizeGuestCount(guestCount) }, (_, index) => createGuestTicket(fallbackTariff, index));
}

export function resizeGuestTickets(guestTickets, nextCount, fallbackTariff = serviceOptions[0]) {
  const normalizedTickets = normalizeGuestTickets(guestTickets, guestCountFromTickets(guestTickets), fallbackTariff);
  const targetCount = normalizeGuestCount(nextCount);

  if (normalizedTickets.length === targetCount) {
    return normalizedTickets;
  }

  if (normalizedTickets.length > targetCount) {
    return normalizedTickets.slice(0, targetCount);
  }

  return [
    ...normalizedTickets,
    ...Array.from({ length: targetCount - normalizedTickets.length }, (_, index) =>
      createGuestTicket(normalizedTickets[normalizedTickets.length - 1]?.tariff ?? fallbackTariff, normalizedTickets.length + index)
    )
  ];
}

function guestCountFromTickets(guestTickets) {
  return Array.isArray(guestTickets) && guestTickets.length ? guestTickets.length : 1;
}

export function formatCurrency(value) {
  return currencyFormatter.format(normalizeAmount(value));
}

export function getTariffPrice(tariff) {
  return ticketCatalog[normalizeTariff(tariff)].price;
}

export function calculateTotalAmount(guestTickets) {
  return normalizeGuestTickets(guestTickets, Array.isArray(guestTickets) ? guestTickets.length : 1).reduce(
    (sum, ticket) => sum + getTariffPrice(ticket.tariff),
    0
  );
}

export function calculateRemainingAmount(totalAmount, prepaymentAmount) {
  return Math.max(0, normalizeAmount(totalAmount) - normalizeAmount(prepaymentAmount));
}

export function getPaidAmount(appointment) {
  return Math.min(normalizeAmount(appointment.prepaymentAmount), normalizeAmount(appointment.totalAmount));
}

export function getPaymentMethodLabel(method) {
  return paymentMethodOptions.find((item) => item.value === method)?.label ?? "Не указан";
}

export function hasPrepayment(appointment) {
  return normalizeAmount(appointment.prepaymentAmount) > 0;
}

export function getTariffSummary(appointment, compact = false) {
  const guestTickets = normalizeGuestTickets(appointment.guestTickets, appointment.guestCount, appointment.service);
  const counts = new Map();

  guestTickets.forEach((ticket) => {
    counts.set(ticket.tariff, (counts.get(ticket.tariff) ?? 0) + 1);
  });

  const parts = [...counts.entries()].map(([tariff, count]) => {
    const meta = ticketCatalog[tariff];
    if (count === 1) {
      return compact ? meta.shortLabel : meta.label;
    }

    return compact ? `${count}× ${meta.shortLabel}` : `${count}× ${meta.label}`;
  });

  return parts.join(", ");
}

export function getPaymentSummary(appointment) {
  const totalAmount = normalizeAmount(appointment.totalAmount);
  const prepaymentAmount = normalizeAmount(appointment.prepaymentAmount);
  const remainingAmount = normalizeAmount(appointment.remainingAmount);

  if (!prepaymentAmount) {
    return `Всего ${formatCurrency(totalAmount)} · без предоплаты · осталось ${formatCurrency(remainingAmount || totalAmount)}`;
  }

  return `Всего ${formatCurrency(totalAmount)} · внесено ${formatCurrency(prepaymentAmount)} · ${getPaymentMethodLabel(
    appointment.paymentMethod
  )} · осталось ${formatCurrency(remainingAmount)}`;
}

export function getDayIncome(appointments, dateKey) {
  return getDayAppointments(appointments, dateKey)
    .filter(isAppointmentActive)
    .reduce((sum, appointment) => sum + getPaidAmount(appointment), 0);
}

export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function shiftDate(dateKey, deltaDays) {
  const baseDate = typeof dateKey === "string" ? parseDateKey(dateKey) : cloneDate(dateKey);
  baseDate.setDate(baseDate.getDate() + deltaDays);
  return formatDateKey(baseDate);
}

export function getWeekStart(dateKey) {
  const date = parseDateKey(dateKey);
  const weekday = date.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  date.setDate(date.getDate() + diff);
  return formatDateKey(date);
}

export function getMonthStart(dateKey) {
  const date = parseDateKey(dateKey);
  date.setDate(1);
  return formatDateKey(date);
}

export function formatLongDate(dateKey) {
  return longDateFormatter.format(parseDateKey(dateKey));
}

export function formatShortDate(dateKey) {
  return shortDateFormatter.format(parseDateKey(dateKey));
}

export function formatWeekday(dateKey) {
  return weekdayFormatter.format(parseDateKey(dateKey));
}

export function formatMonthLabel(dateKey) {
  return monthFormatter.format(parseDateKey(dateKey));
}

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes) {
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = `${Math.floor(normalizedMinutes / 60)}`.padStart(2, "0");
  const minutes = `${normalizedMinutes % 60}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function getAppointmentEnd(appointment) {
  return minutesToTime(timeToMinutes(appointment.time) + 60);
}

export function getStatusMeta(status) {
  return statusOptions.find((item) => item.value === status) ?? statusOptions[0];
}

export function appointmentSort(a, b) {
  const left = `${a.date} ${a.time}`;
  const right = `${b.date} ${b.time}`;
  return left.localeCompare(right);
}

export function sortAppointments(appointments) {
  return [...appointments].sort(appointmentSort);
}

export function getDayAppointments(appointments, dateKey) {
  return sortAppointments(appointments.filter((appointment) => appointment.date === dateKey));
}

export function getWeekDays(dateKey) {
  const start = getWeekStart(dateKey);
  return Array.from({ length: 7 }, (_, index) => shiftDate(start, index));
}

export function getMonthGrid(dateKey) {
  const start = parseDateKey(getMonthStart(dateKey));
  const month = start.getMonth();
  const firstGridDay = parseDateKey(getWeekStart(formatDateKey(start)));

  return Array.from({ length: 42 }, (_, index) => {
    const date = cloneDate(firstGridDay);
    date.setDate(firstGridDay.getDate() + index);

    return {
      dateKey: formatDateKey(date),
      isCurrentMonth: date.getMonth() === month
    };
  });
}

export function matchesSearch(appointment, query) {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();
  const haystack = [
    appointment.clientName,
    appointment.phone,
    appointment.service,
    getTariffSummary(appointment),
    appointment.comment,
    appointment.status,
    appointment.source,
    `${appointment.guestCount}`,
    getPaymentSummary(appointment),
    getPaymentMethodLabel(appointment.paymentMethod),
    `${appointment.totalAmount}`,
    `${appointment.prepaymentAmount}`,
    `${appointment.remainingAmount}`
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export function isAppointmentActive(appointment) {
  return appointment.status !== "canceled";
}

export function getSlotBookedGuests(appointments, dateKey, time, excludeId = "") {
  return getDayAppointments(appointments, dateKey)
    .filter((appointment) => appointment.time === time && appointment.id !== excludeId && isAppointmentActive(appointment))
    .reduce((sum, appointment) => sum + normalizeGuestCount(appointment.guestCount), 0);
}

export function getSlotCapacityState(appointments, dateKey, time, excludeId = "") {
  const bookedGuests = getSlotBookedGuests(appointments, dateKey, time, excludeId);
  return {
    time,
    bookedGuests,
    remainingGuests: Math.max(0, SLOT_CAPACITY - bookedGuests),
    isFull: bookedGuests >= SLOT_CAPACITY
  };
}

export function getDaySlotGroups(appointments, dateKey) {
  const dayAppointments = getDayAppointments(appointments, dateKey);

  return FIXED_SLOT_TIMES.map((time) => {
    const slotAppointments = dayAppointments.filter((appointment) => appointment.time === time);
    const bookedGuests = slotAppointments
      .filter(isAppointmentActive)
      .reduce((sum, appointment) => sum + normalizeGuestCount(appointment.guestCount), 0);

    return {
      time,
      bookedGuests,
      remainingGuests: Math.max(0, SLOT_CAPACITY - bookedGuests),
      isFull: bookedGuests >= SLOT_CAPACITY,
      appointments: slotAppointments
    };
  });
}

export function canSaveInSlot(appointments, appointment) {
  const guestCount = normalizeGuestCount(appointment.guestCount);
  const bookedGuests = getSlotBookedGuests(appointments, appointment.date, appointment.time, appointment.id);
  return bookedGuests + guestCount <= SLOT_CAPACITY;
}

export function getFreeSlots(appointments, dateKey) {
  return getDaySlotGroups(appointments, dateKey)
    .filter((slot) => slot.remainingGuests > 0)
    .map((slot) => ({
      start: slot.time,
      end: getAppointmentEnd({ time: slot.time }),
      remainingGuests: slot.remainingGuests,
      bookedGuests: slot.bookedGuests
    }));
}

export function getUpcomingAppointments(appointments, limit = 5) {
  const now = new Date();
  const todayKey = formatDateKey(now);
  const currentTime = `${`${now.getHours()}`.padStart(2, "0")}:${`${now.getMinutes()}`.padStart(2, "0")}`;

  return sortAppointments(
    appointments.filter((appointment) => {
      if (!isAppointmentActive(appointment)) {
        return false;
      }

      if (appointment.date > todayKey) {
        return true;
      }

      return appointment.date === todayKey && appointment.time >= currentTime;
    })
  ).slice(0, limit);
}

export function getRecentActions(appointments, limit = 5) {
  return [...appointments]
    .sort((left, right) => new Date(right.updatedAt ?? right.createdAt) - new Date(left.updatedAt ?? left.createdAt))
    .slice(0, limit);
}

export function groupClients(appointments) {
  const clients = new Map();

  appointments.forEach((appointment) => {
    const key = appointment.phone || `${appointment.clientName}-${appointment.id}`;
    const existing = clients.get(key);

    if (!existing) {
      clients.set(key, {
        id: key,
        name: appointment.clientName,
        phone: appointment.phone,
        note: appointment.comment || "",
        lastAppointment: appointment,
        appointments: [appointment]
      });
      return;
    }

    existing.appointments.push(appointment);
    existing.note = existing.note || appointment.comment || "";

    if (appointmentSort(existing.lastAppointment, appointment) < 0) {
      existing.lastAppointment = appointment;
    }
  });

  return [...clients.values()]
    .map((client) => ({
      ...client,
      count: client.appointments.length,
      appointments: sortAppointments(client.appointments)
    }))
    .sort((left, right) => appointmentSort(right.lastAppointment, left.lastAppointment));
}

export function buildTimelineHours() {
  return [...FIXED_SLOT_TIMES];
}

export function normalizeAppointment(values) {
  const guestTickets = normalizeGuestTickets(values.guestTickets, values.guestCount, values.service);
  const guestCount = guestTickets.length;
  const totalAmount = calculateTotalAmount(guestTickets);
  const prepaymentAmount = Math.min(normalizeAmount(values.prepaymentAmount), totalAmount);
  const remainingAmount = calculateRemainingAmount(totalAmount, prepaymentAmount);
  const primaryTariff = guestTickets[0]?.tariff ?? serviceOptions[0];

  return {
    ...values,
    service: normalizeTariff(primaryTariff),
    source: sourceOptions.includes(values.source) ? values.source : sourceOptions[0],
    status: statusOptions.some((item) => item.value === values.status) ? values.status : statusOptions[0].value,
    time: normalizeTime(values.time),
    guestCount,
    guestTickets,
    totalAmount,
    prepaymentAmount,
    paymentMethod: prepaymentAmount ? normalizePaymentMethod(values.paymentMethod) : "",
    remainingAmount,
    durationMinutes: 60,
    createdAt: values.createdAt ?? new Date().toISOString(),
    updatedAt: values.updatedAt ?? values.createdAt ?? new Date().toISOString()
  };
}

export function createAppointmentTemplate(dateKey) {
  const guestTickets = resizeGuestTickets([], 2, serviceOptions[0]);
  const totalAmount = calculateTotalAmount(guestTickets);

  return {
    id: "",
    clientName: "",
    phone: "",
    date: dateKey,
    time: FIXED_SLOT_TIMES[0],
    durationMinutes: 60,
    guestCount: guestTickets.length,
    guestTickets,
    service: serviceOptions[0],
    comment: "",
    status: "new",
    source: sourceOptions[0],
    totalAmount,
    prepaymentAmount: 0,
    paymentMethod: "",
    remainingAmount: totalAmount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function buildAppointment({
  id,
  clientName,
  phone,
  date,
  time,
  guestCount,
  guestTickets,
  service,
  comment,
  status,
  createdAtOffsetDays,
  source,
  prepaymentAmount = 0,
  paymentMethod = ""
}) {
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() + createdAtOffsetDays);
  createdAt.setHours(9, 30, 0, 0);

  const normalizedGuestTickets = normalizeGuestTickets(guestTickets, guestCount, service);
  const totalAmount = calculateTotalAmount(normalizedGuestTickets);
  const normalizedPrepayment = Math.min(normalizeAmount(prepaymentAmount), totalAmount);

  return {
    id,
    clientName,
    phone,
    date,
    time: normalizeTime(time),
    durationMinutes: 60,
    guestCount: normalizedGuestTickets.length,
    guestTickets: normalizedGuestTickets,
    service: normalizeTariff(service ?? normalizedGuestTickets[0]?.tariff),
    comment,
    status,
    source,
    totalAmount,
    prepaymentAmount: normalizedPrepayment,
    paymentMethod: normalizedPrepayment ? normalizePaymentMethod(paymentMethod) : "",
    remainingAmount: calculateRemainingAmount(totalAmount, normalizedPrepayment),
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString()
  };
}

function makeTickets(...tariffs) {
  return tariffs.map((tariff, index) => createGuestTicket(tariff, index));
}

export function createMockAppointments() {
  const today = formatDateKey(new Date());

  return sortAppointments([
    buildAppointment({
      id: "apt-001",
      clientName: "Алина Смирнова",
      phone: "+7 921 555-10-10",
      date: today,
      time: "11:00",
      guestTickets: makeTickets("Семейный билет", "Обычный билет", "Льготный билет"),
      service: "Семейный билет",
      comment: "Мама, папа и ребёнок.",
      status: "confirmed",
      createdAtOffsetDays: -2,
      source: "Сайт",
      prepaymentAmount: 2200,
      paymentMethod: "card"
    }),
    buildAppointment({
      id: "apt-002",
      clientName: "Марк Белоусов",
      phone: "+7 981 731-08-33",
      date: today,
      time: "11:00",
      guestTickets: makeTickets("Обычный билет", "Обычный билет", "Льготный билет", "Льготный билет", "Семейный билет"),
      service: "Семейный билет",
      comment: "Компания друзей, хотят сидеть вместе.",
      status: "pending",
      createdAtOffsetDays: -3,
      source: "Telegram",
      prepaymentAmount: 3000,
      paymentMethod: "cash"
    }),
    buildAppointment({
      id: "apt-003",
      clientName: "Екатерина Орлова",
      phone: "+7 911 200-41-19",
      date: today,
      time: "13:00",
      guestTickets: makeTickets("Льготный билет", "Обычный билет"),
      service: "Льготный билет",
      comment: "Подтвердить утром.",
      status: "new",
      createdAtOffsetDays: -1,
      source: "Instagram",
      prepaymentAmount: 0,
      paymentMethod: ""
    }),
    buildAppointment({
      id: "apt-004",
      clientName: "Игорь Чернов",
      phone: "+7 921 333-12-21",
      date: today,
      time: "13:00",
      guestTickets: makeTickets("Обычный билет", "Обычный билет", "Семейный билет", "Семейный билет"),
      service: "Обычный билет",
      comment: "Первый визит.",
      status: "confirmed",
      createdAtOffsetDays: -4,
      source: "Телефон",
      prepaymentAmount: 5400,
      paymentMethod: "card"
    }),
    buildAppointment({
      id: "apt-005",
      clientName: "Дарья Климова",
      phone: "+7 911 700-33-49",
      date: today,
      time: "15:00",
      guestTickets: makeTickets("Счастливый час", "Счастливый час"),
      service: "Счастливый час",
      comment: "Мама с ребёнком.",
      status: "canceled",
      createdAtOffsetDays: -5,
      source: "Сайт",
      prepaymentAmount: 1000,
      paymentMethod: "cash"
    }),
    buildAppointment({
      id: "apt-006",
      clientName: "Никита Козлов",
      phone: "+7 905 110-42-17",
      date: shiftDate(today, 1),
      time: "11:00",
      guestTickets: makeTickets("Семейный билет", "Семейный билет", "Обычный билет"),
      service: "Семейный билет",
      comment: "Повторный визит.",
      status: "confirmed",
      createdAtOffsetDays: -2,
      source: "Повторный визит",
      prepaymentAmount: 1500,
      paymentMethod: "card"
    }),
    buildAppointment({
      id: "apt-007",
      clientName: "София Карпова",
      phone: "+7 931 450-60-18",
      date: shiftDate(today, 1),
      time: "13:00",
      guestTickets: makeTickets("Обычный билет"),
      service: "Обычный билет",
      comment: "Позвонить утром.",
      status: "new",
      createdAtOffsetDays: -1,
      source: "Телефон",
      prepaymentAmount: 0,
      paymentMethod: ""
    }),
    buildAppointment({
      id: "apt-008",
      clientName: "Ольга Воронова",
      phone: "+7 911 880-22-11",
      date: shiftDate(today, 2),
      time: "15:00",
      guestTickets: makeTickets(
        "Семейный билет",
        "Семейный билет",
        "Обычный билет",
        "Обычный билет",
        "Льготный билет",
        "Льготный билет"
      ),
      service: "Семейный билет",
      comment: "Большая компания.",
      status: "pending",
      createdAtOffsetDays: -6,
      source: "Telegram",
      prepaymentAmount: 4000,
      paymentMethod: "card"
    }),
    buildAppointment({
      id: "apt-009",
      clientName: "Лев Степанов",
      phone: "+7 921 456-78-01",
      date: shiftDate(today, -1),
      time: "17:00",
      guestTickets: makeTickets("Льготный билет", "Льготный билет"),
      service: "Льготный билет",
      comment: "Визит прошёл спокойно.",
      status: "completed",
      createdAtOffsetDays: -8,
      source: "Сайт",
      prepaymentAmount: 2000,
      paymentMethod: "cash"
    }),
    buildAppointment({
      id: "apt-010",
      clientName: "Полина Глебова",
      phone: "+7 999 123-44-78",
      date: shiftDate(today, 4),
      time: "19:00",
      guestTickets: makeTickets("Семейный билет", "Семейный билет", "Обычный билет", "Обычный билет"),
      service: "Семейный билет",
      comment: "Нужны места рядом.",
      status: "confirmed",
      createdAtOffsetDays: -10,
      source: "Instagram",
      prepaymentAmount: 2400,
      paymentMethod: "card"
    })
  ]);
}
