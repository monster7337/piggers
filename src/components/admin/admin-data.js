import { extras as siteExtras, giftCertificates as siteGiftCertificates } from "@/lib/site-data";

export const ADMIN_AUTH_KEY = "piggyland-admin-auth";
export const ADMIN_APPOINTMENTS_KEY = "piggyland-admin-appointments";
export const ADMIN_SETTINGS_KEY = "piggyland-admin-settings";
export const ADMIN_ACTIVITY_KEY = "piggyland-admin-activity";
export const ADMIN_GIFT_CERTIFICATES_KEY = "piggyland-admin-gift-certificates";
export const ADMIN_FINANCE_RECORDS_KEY = "piggyland-admin-finance-records";

export const PUBLIC_SLOT_CAPACITY = 12;
export const SLOT_RESERVE_CAPACITY = 2;
export const MAX_SLOT_CAPACITY = PUBLIC_SLOT_CAPACITY + SLOT_RESERVE_CAPACITY;
export const BOOKING_PREPAYMENT_PER_GUEST = 500;
export const FIXED_SLOT_TIMES = ["11:00", "13:00", "15:00", "17:00", "19:00"];
export const HAPPY_HOUR_SLOT_TIMES = ["11:00", "13:00"];

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

export const serviceOptions = ["Обычный билет", "Семейный билет", "Льготный билет", "Счастливый час"];

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
  { value: "online", label: "Онлайн на сайте" },
  { value: "cash", label: "Наличные" },
  { value: "card", label: "Безнал" },
  { value: "qr", label: "QR-код" },
  { value: "transfer", label: "Перевод" }
];
export const onSitePaymentMethodOptions = paymentMethodOptions.filter((item) => item.value !== "online");
export const giftDeliveryOptions = ["Email", "Telegram", "VK", "Instagram", "WhatsApp"];
export const financeTypeOptions = [
  { value: "income", label: "Доход" },
  { value: "expense", label: "Расход" }
];
export const incomeCategoryOptions = ["Ручной доход", "Мероприятие", "Продажа на месте", "Доплата", "Прочее"];
export const expenseCategoryOptions = ["Зарплата", "Расходники", "Корм и уход", "Коммунальные", "Реклама", "Прочее"];
export const extraOptions = siteExtras.map((item) => ({
  id: item.id,
  title: item.title,
  price: item.price,
  description: item.description
}));

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
  startRoute: "/admin/dashboard",
  slotReserveMap: {},
  happyHourDisabledDates: {}
};

const extraCatalog = Object.fromEntries(siteExtras.map((item) => [item.id, item]));
const giftCertificateCatalog = Object.fromEntries(siteGiftCertificates.map((item) => [item.id, item]));
const memoryStorage = new Map();

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

function padTimePart(value) {
  return `${value}`.padStart(2, "0");
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeClockTime(value, fallback = "00:00") {
  if (typeof value !== "string") {
    return fallback;
  }

  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return fallback;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return fallback;
  }

  return `${padTimePart(hours)}:${padTimePart(minutes)}`;
}

function getCurrentClockTime() {
  const now = new Date();
  return `${padTimePart(now.getHours())}:${padTimePart(now.getMinutes())}`;
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

function normalizeOnSitePaymentMethod(method) {
  return onSitePaymentMethodOptions.some((item) => item.value === method) ? method : "";
}

function normalizeFinanceType(type) {
  return type === "expense" ? "expense" : "income";
}

function normalizeFinanceCategory(type, value) {
  const options = type === "expense" ? expenseCategoryOptions : incomeCategoryOptions;
  return options.includes(value) ? value : options[0];
}

function normalizeReserveSeatCount(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    return 0;
  }

  return Math.min(SLOT_RESERVE_CAPACITY, Math.max(0, Math.round(normalized)));
}

function normalizeBooleanDateMap(value) {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(([dateKey, isDisabled]) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && Boolean(isDisabled))
  );
}

function normalizeText(value) {
  return typeof value === "string" ? value : "";
}

function normalizeEmail(value) {
  return normalizeText(value).trim();
}

function compareDateTime(leftDate, leftTime, rightDate, rightTime) {
  return `${leftDate} ${normalizeClockTime(leftTime)}`.localeCompare(`${rightDate} ${normalizeClockTime(rightTime)}`);
}

function createGuestTicket(tariff, index) {
  return {
    id: `guest-${index + 1}-${Math.random().toString(36).slice(2, 8)}`,
    tariff: normalizeTariff(tariff)
  };
}

function guestCountFromTickets(guestTickets) {
  return Array.isArray(guestTickets) && guestTickets.length ? guestTickets.length : 1;
}

function normalizeSelectedExtras(selectedExtras) {
  if (!Array.isArray(selectedExtras) || !selectedExtras.length) {
    return [];
  }

  const mergedExtras = new Map();

  selectedExtras.forEach((item) => {
    const extraId = typeof item === "string" ? item : item?.id;
    if (!extraCatalog[extraId]) {
      return;
    }

    const quantity = Math.max(1, normalizeAmount(typeof item === "object" ? item.quantity : 1) || 1);
    const existing = mergedExtras.get(extraId);

    mergedExtras.set(extraId, {
      id: extraId,
      quantity: (existing?.quantity ?? 0) + quantity
    });
  });

  return [...mergedExtras.values()];
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

function normalizeGuestTickets(guestTickets, guestCount, fallbackTariff = serviceOptions[0]) {
  if (Array.isArray(guestTickets) && guestTickets.length) {
    return guestTickets.map((ticket, index) => ({
      id: ticket.id || `guest-${index + 1}`,
      tariff: normalizeTariff(ticket.tariff ?? ticket.service ?? fallbackTariff)
    }));
  }

  return Array.from({ length: normalizeGuestCount(guestCount) }, (_, index) => createGuestTicket(fallbackTariff, index));
}

export function formatCurrency(value) {
  return currencyFormatter.format(normalizeAmount(value));
}

export function getTariffPrice(tariff) {
  return ticketCatalog[normalizeTariff(tariff)].price;
}

export function getExtraPrice(extraId) {
  return extraCatalog[extraId]?.price ?? 0;
}

export function getExtraTitle(extraId) {
  return extraCatalog[extraId]?.title ?? "Дополнительная услуга";
}

export function calculateExtrasTotal(selectedExtras) {
  return normalizeSelectedExtras(selectedExtras).reduce((sum, item) => sum + getExtraPrice(item.id) * item.quantity, 0);
}

export function calculateTicketsTotal(guestTickets) {
  return normalizeGuestTickets(guestTickets, Array.isArray(guestTickets) ? guestTickets.length : 1).reduce(
    (sum, ticket) => sum + getTariffPrice(ticket.tariff),
    0
  );
}

export function calculateTotalAmount(guestTickets, selectedExtras = []) {
  return calculateTicketsTotal(guestTickets) + calculateExtrasTotal(selectedExtras);
}

export function calculateExpectedPrepayment(guestCount, totalAmount) {
  return Math.min(normalizeAmount(totalAmount), normalizeGuestCount(guestCount) * BOOKING_PREPAYMENT_PER_GUEST);
}

export function calculateRemainingAmount(totalAmount, prepaymentAmount, onSitePaymentAmount = 0) {
  return Math.max(0, normalizeAmount(totalAmount) - normalizeAmount(prepaymentAmount) - normalizeAmount(onSitePaymentAmount));
}

export function getOnSitePaidAmount(appointment) {
  return Math.min(
    normalizeAmount(appointment.onSitePaymentAmount),
    Math.max(0, normalizeAmount(appointment.totalAmount) - normalizeAmount(appointment.prepaymentAmount))
  );
}

export function getPaidAmount(appointment) {
  return Math.min(
    normalizeAmount(appointment.totalAmount),
    normalizeAmount(appointment.prepaymentAmount) + getOnSitePaidAmount(appointment)
  );
}

export function getPaymentMethodLabel(method) {
  return paymentMethodOptions.find((item) => item.value === method)?.label ?? "Не указан";
}

export function hasPrepayment(appointment) {
  return normalizeAmount(appointment.prepaymentAmount) > 0;
}

export function hasOnSitePayment(appointment) {
  return normalizeAmount(appointment.onSitePaymentAmount) > 0;
}

export function getExtrasSummary(appointment, compact = false) {
  const normalizedExtras = normalizeSelectedExtras(appointment.selectedExtras);
  if (!normalizedExtras.length) {
    return compact ? "Без допов" : "Без дополнительных услуг";
  }

  return normalizedExtras
    .map((item) => {
      const title = getExtraTitle(item.id);
      return item.quantity > 1 ? `${title} ×${item.quantity}` : title;
    })
    .join(compact ? ", " : " · ");
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
  const onSitePaymentAmount = normalizeAmount(appointment.onSitePaymentAmount);
  const remainingAmount = normalizeAmount(appointment.remainingAmount);

  const parts = [`Всего ${formatCurrency(totalAmount)}`];

  if (prepaymentAmount) {
    parts.push(`сайт ${formatCurrency(prepaymentAmount)}`);
  } else {
    parts.push("без предоплаты");
  }

  if (onSitePaymentAmount) {
    parts.push(`на месте ${formatCurrency(onSitePaymentAmount)}`);
    if (appointment.onSitePaymentMethod) {
      parts.push(getPaymentMethodLabel(appointment.onSitePaymentMethod));
    }
  }

  parts.push(`осталось ${formatCurrency(remainingAmount)}`);
  return parts.join(" · ");
}

export function getDayIncome(appointments, dateKey) {
  return getDayAppointments(appointments, dateKey)
    .filter(isAppointmentActive)
    .reduce((sum, appointment) => sum + getPaidAmount(appointment), 0);
}

export function getDayPrepaymentAmount(appointments, dateKey) {
  return getDayAppointments(appointments, dateKey)
    .filter(isAppointmentActive)
    .reduce((sum, appointment) => sum + normalizeAmount(appointment.prepaymentAmount), 0);
}

export function getDayOnSiteIncome(appointments, dateKey) {
  return getDayAppointments(appointments, dateKey)
    .filter(isAppointmentActive)
    .reduce((sum, appointment) => sum + getOnSitePaidAmount(appointment), 0);
}

export function getDayPaymentBreakdown(appointments, dateKey) {
  return getDayAppointments(appointments, dateKey)
    .filter(isAppointmentActive)
    .reduce(
      (summary, appointment) => {
        const prepaymentAmount = normalizeAmount(appointment.prepaymentAmount);
        const onSitePaymentAmount = getOnSitePaidAmount(appointment);

        if (prepaymentAmount) {
          summary.online += prepaymentAmount;
        }

        if (onSitePaymentAmount && appointment.onSitePaymentMethod) {
          summary.methods[appointment.onSitePaymentMethod] =
            (summary.methods[appointment.onSitePaymentMethod] ?? 0) + onSitePaymentAmount;
        }

        return summary;
      },
      { online: 0, methods: {} }
    );
}

export function getDaySourceBreakdown(appointments, dateKey) {
  return getDayAppointments(appointments, dateKey)
    .filter(isAppointmentActive)
    .reduce((summary, appointment) => {
      const current = summary[appointment.source] ?? { count: 0, revenue: 0 };
      summary[appointment.source] = {
        count: current.count + 1,
        revenue: current.revenue + getPaidAmount(appointment)
      };
      return summary;
    }, {});
}

function sortLedgerEntries(entries) {
  return [...entries].sort((left, right) => compareDateTime(right.date, right.time, left.date, left.time));
}

export function getDayFinanceRecords(financeRecords, dateKey) {
  return sortFinanceRecords(financeRecords.filter((record) => record.date === dateKey));
}

export function getDayIncomeEntries(appointments, giftOrders, financeRecords, dateKey) {
  const appointmentEntries = getDayAppointments(appointments, dateKey)
    .filter(isAppointmentActive)
    .flatMap((appointment) => {
      const entries = [];
      const prepaymentAmount = normalizeAmount(appointment.prepaymentAmount);
      const onSitePaidAmount = getOnSitePaidAmount(appointment);

      if (prepaymentAmount) {
        entries.push({
          id: `income-prepayment-${appointment.id}`,
          type: "income",
          stream: "Онлайн предоплата",
          origin: "Бронь",
          date: appointment.date,
          time: appointment.time,
          title: "Предоплата на сайте",
          person: appointment.clientName,
          amount: prepaymentAmount,
          note: `${appointment.guestCount} чел. · ${getTariffSummary(appointment, true)}`,
          isManual: false
        });
      }

      if (onSitePaidAmount) {
        entries.push({
          id: `income-onsite-${appointment.id}`,
          type: "income",
          stream: "Оплата на месте",
          origin: "CRM",
          date: appointment.date,
          time: appointment.time,
          title: "Оплата в пространстве",
          person: appointment.clientName,
          amount: onSitePaidAmount,
          note: appointment.onSitePaymentMethod ? getPaymentMethodLabel(appointment.onSitePaymentMethod) : "Способ не указан",
          isManual: false
        });
      }

      return entries;
    });

  const giftEntries = getDayGiftOrders(giftOrders, dateKey).map((order) => ({
    id: `income-gift-${order.id}`,
    type: "income",
    stream: "Сертификаты",
    origin: "Сайт",
    date: order.purchaseDate,
    time: order.purchaseTime,
    title: "Продажа сертификата",
    person: order.purchaserName,
    amount: normalizeAmount(order.amount),
    note: order.certificateTitle,
    isManual: false
  }));

  const manualIncomeEntries = getDayFinanceRecords(financeRecords, dateKey)
    .filter((record) => record.type === "income")
    .map((record) => ({
      id: record.id,
      type: "income",
      stream: record.category,
      origin: "Ручной",
      date: record.date,
      time: record.time,
      title: record.title,
      person: record.person,
      amount: normalizeAmount(record.amount),
      note: [record.category, record.note].filter(Boolean).join(" · "),
      isManual: true
    }));

  return sortLedgerEntries([...appointmentEntries, ...giftEntries, ...manualIncomeEntries]);
}

export function getDayExpenseEntries(financeRecords, dateKey) {
  return sortLedgerEntries(
    getDayFinanceRecords(financeRecords, dateKey)
      .filter((record) => record.type === "expense")
      .map((record) => ({
        id: record.id,
        type: "expense",
        stream: record.category,
        origin: "Расход",
        date: record.date,
        time: record.time,
        title: record.title,
        person: record.person,
        amount: normalizeAmount(record.amount),
        note: [record.category, record.note].filter(Boolean).join(" · "),
        isManual: true
      }))
  );
}

function summarizeLedgerBy(entries, keyBuilder) {
  return entries.reduce((summary, entry) => {
    const key = keyBuilder(entry);
    const current = summary[key] ?? { amount: 0, count: 0 };

    summary[key] = {
      amount: current.amount + normalizeAmount(entry.amount),
      count: current.count + 1
    };

    return summary;
  }, {});
}

export function getDayIncomeBreakdown(appointments, giftOrders, financeRecords, dateKey) {
  return summarizeLedgerBy(getDayIncomeEntries(appointments, giftOrders, financeRecords, dateKey), (entry) => entry.stream);
}

export function getDayExpenseBreakdown(financeRecords, dateKey) {
  return summarizeLedgerBy(getDayExpenseEntries(financeRecords, dateKey), (entry) => entry.stream);
}

export function getDayExpenseTotal(financeRecords, dateKey) {
  return getDayExpenseEntries(financeRecords, dateKey).reduce((sum, entry) => sum + normalizeAmount(entry.amount), 0);
}

export function getDayTotalIncome(appointments, giftOrders, financeRecords, dateKey) {
  return getDayIncomeEntries(appointments, giftOrders, financeRecords, dateKey).reduce(
    (sum, entry) => sum + normalizeAmount(entry.amount),
    0
  );
}

export function matchesFinanceSearch(entry, query) {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();
  const haystack = [
    entry.title,
    entry.person,
    entry.note,
    entry.stream,
    entry.origin,
    entry.date,
    entry.time,
    `${entry.amount}`
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
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
  const [hours, minutes] = normalizeClockTime(time).split(":").map(Number);
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
    appointment.email,
    appointment.service,
    getTariffSummary(appointment),
    getExtrasSummary(appointment),
    appointment.comment,
    appointment.status,
    appointment.source,
    `${appointment.guestCount}`,
    getPaymentSummary(appointment),
    getPaymentMethodLabel(appointment.paymentMethod),
    getPaymentMethodLabel(appointment.onSitePaymentMethod),
    `${appointment.totalAmount}`,
    `${appointment.prepaymentAmount}`,
    `${appointment.onSitePaymentAmount}`,
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

export function normalizeSettings(settings) {
  const nextSettings = { ...defaultSettings, ...(settings ?? {}) };
  const slotReserveMap = nextSettings.slotReserveMap && typeof nextSettings.slotReserveMap === "object" ? nextSettings.slotReserveMap : {};

  return {
    ...nextSettings,
    slotDuration: Number(nextSettings.slotDuration) || 60,
    slotReserveMap: Object.fromEntries(
      Object.entries(slotReserveMap).map(([slotKey, value]) => [slotKey, normalizeReserveSeatCount(value)]).filter(([, value]) => value > 0)
    ),
    happyHourDisabledDates: normalizeBooleanDateMap(nextSettings.happyHourDisabledDates)
  };
}

export function isHappyHourSlotTime(time) {
  return HAPPY_HOUR_SLOT_TIMES.includes(time);
}

export function isHappyHourDisabledForDate(settings, dateKey) {
  return Boolean(normalizeSettings(settings).happyHourDisabledDates?.[dateKey]);
}

export function isHappyHourEnabled(settings, dateKey, time) {
  if (!dateKey || !isHappyHourSlotTime(time) || isHappyHourDisabledForDate(settings, dateKey)) {
    return false;
  }

  const weekday = parseDateKey(dateKey).getDay();
  return weekday !== 0 && weekday !== 6;
}

export function getSlotReserveKey(dateKey, time) {
  return `${dateKey}__${time}`;
}

export function getEnabledReserveSeats(settings, dateKey, time) {
  const normalizedSettings = normalizeSettings(settings);
  return normalizeReserveSeatCount(normalizedSettings.slotReserveMap[getSlotReserveKey(dateKey, time)]);
}

export function getSlotCapacity(settings, dateKey, time) {
  return PUBLIC_SLOT_CAPACITY + getEnabledReserveSeats(settings, dateKey, time);
}

export function getSlotBookedGuests(appointments, dateKey, time, excludeId = "") {
  return getDayAppointments(appointments, dateKey)
    .filter((appointment) => appointment.time === time && appointment.id !== excludeId && isAppointmentActive(appointment))
    .reduce((sum, appointment) => sum + normalizeGuestCount(appointment.guestCount), 0);
}

export function getSlotCapacityState(appointments, settings, dateKey, time, excludeId = "") {
  const bookedGuests = getSlotBookedGuests(appointments, dateKey, time, excludeId);
  const enabledReserveSeats = getEnabledReserveSeats(settings, dateKey, time);
  const totalCapacity = getSlotCapacity(settings, dateKey, time);

  return {
    time,
    bookedGuests,
    baseCapacity: PUBLIC_SLOT_CAPACITY,
    enabledReserveSeats,
    remainingReserveSeats: SLOT_RESERVE_CAPACITY - enabledReserveSeats,
    totalCapacity,
    remainingGuests: Math.max(0, totalCapacity - bookedGuests),
    isFull: bookedGuests >= totalCapacity
  };
}

export function getDaySlotGroups(appointments, settings, dateKey) {
  const dayAppointments = getDayAppointments(appointments, dateKey);

  return FIXED_SLOT_TIMES.map((time) => {
    const slotAppointments = dayAppointments.filter((appointment) => appointment.time === time);
    const state = getSlotCapacityState(appointments, settings, dateKey, time);

    return {
      time,
      bookedGuests: state.bookedGuests,
      totalCapacity: state.totalCapacity,
      baseCapacity: state.baseCapacity,
      enabledReserveSeats: state.enabledReserveSeats,
      remainingReserveSeats: state.remainingReserveSeats,
      remainingGuests: state.remainingGuests,
      isFull: state.isFull,
      appointments: slotAppointments
    };
  });
}

export function canSaveInSlot(appointments, settings, appointment) {
  const guestCount = normalizeGuestCount(appointment.guestCount);
  const bookedGuests = getSlotBookedGuests(appointments, appointment.date, appointment.time, appointment.id);
  return bookedGuests + guestCount <= getSlotCapacity(settings, appointment.date, appointment.time);
}

export function getFreeSlots(appointments, settings, dateKey) {
  return getDaySlotGroups(appointments, settings, dateKey)
    .filter((slot) => slot.remainingGuests > 0)
    .map((slot) => ({
      start: slot.time,
      end: getAppointmentEnd({ time: slot.time }),
      remainingGuests: slot.remainingGuests,
      bookedGuests: slot.bookedGuests,
      totalCapacity: slot.totalCapacity,
      enabledReserveSeats: slot.enabledReserveSeats
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
        email: appointment.email,
        note: appointment.comment || "",
        lastAppointment: appointment,
        appointments: [appointment]
      });
      return;
    }

    existing.appointments.push(appointment);
    existing.note = existing.note || appointment.comment || "";
    existing.email = existing.email || appointment.email || "";

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

export function sortFinanceRecords(records) {
  return [...records].sort((left, right) => compareDateTime(right.date, right.time, left.date, left.time));
}

export function normalizeFinanceRecord(values) {
  const createdAt = values.createdAt ?? new Date().toISOString();
  const type = normalizeFinanceType(values.type);
  const date = values.date || formatDateKey(new Date(createdAt));
  const title = normalizeText(values.title).trim();

  return {
    ...values,
    id: values.id || createId("finance"),
    type,
    date,
    time: normalizeClockTime(values.time || getCurrentClockTime()),
    title: title || (type === "income" ? "Новый доход" : "Новый расход"),
    person: normalizeText(values.person).trim(),
    category: normalizeFinanceCategory(type, values.category),
    amount: normalizeAmount(values.amount),
    note: normalizeText(values.note).trim(),
    source: values.source === "system" ? "system" : "manual",
    createdAt,
    updatedAt: values.updatedAt ?? createdAt
  };
}

export function buildTimelineHours() {
  return [...FIXED_SLOT_TIMES];
}

export function normalizeAppointment(values) {
  const guestTickets = normalizeGuestTickets(values.guestTickets, values.guestCount, values.service);
  const guestCount = guestTickets.length;
  const selectedExtras = normalizeSelectedExtras(values.selectedExtras);
  const totalAmount = calculateTotalAmount(guestTickets, selectedExtras);
  const expectedPrepayment = calculateExpectedPrepayment(guestCount, totalAmount);
  const prepaymentAmount = Math.min(normalizeAmount(values.prepaymentAmount), expectedPrepayment);
  const onSitePaymentAmount = Math.min(normalizeAmount(values.onSitePaymentAmount), Math.max(0, totalAmount - prepaymentAmount));
  const remainingAmount = calculateRemainingAmount(totalAmount, prepaymentAmount, onSitePaymentAmount);
  const primaryTariff = guestTickets[0]?.tariff ?? serviceOptions[0];

  return {
    ...values,
    email: normalizeEmail(values.email),
    service: normalizeTariff(primaryTariff),
    source: sourceOptions.includes(values.source) ? values.source : sourceOptions[0],
    status: statusOptions.some((item) => item.value === values.status) ? values.status : statusOptions[0].value,
    time: normalizeTime(values.time),
    guestCount,
    guestTickets,
    selectedExtras,
    totalAmount,
    prepaymentAmount,
    paymentMethod: prepaymentAmount ? normalizePaymentMethod(values.paymentMethod || "online") : "",
    onSitePaymentAmount,
    onSitePaymentMethod: onSitePaymentAmount ? normalizeOnSitePaymentMethod(values.onSitePaymentMethod) : "",
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
    email: "",
    date: dateKey,
    time: FIXED_SLOT_TIMES[0],
    durationMinutes: 60,
    guestCount: guestTickets.length,
    guestTickets,
    selectedExtras: [],
    service: serviceOptions[0],
    comment: "",
    status: "new",
    source: sourceOptions[0],
    totalAmount,
    prepaymentAmount: 0,
    paymentMethod: "",
    onSitePaymentAmount: 0,
    onSitePaymentMethod: "",
    remainingAmount: totalAmount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function buildAppointment({
  id,
  clientName,
  phone,
  email = "",
  date,
  time,
  guestCount,
  guestTickets,
  service,
  selectedExtras = [],
  comment,
  status,
  createdAtOffsetDays,
  source,
  prepaymentAmount = 0,
  paymentMethod = "online",
  onSitePaymentAmount = 0,
  onSitePaymentMethod = ""
}) {
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() + createdAtOffsetDays);
  createdAt.setHours(9, 30, 0, 0);

  return normalizeAppointment({
    id,
    clientName,
    phone,
    email,
    date,
    time: normalizeTime(time),
    guestCount,
    guestTickets,
    service: normalizeTariff(service ?? guestTickets?.[0]?.tariff),
    selectedExtras,
    comment,
    status,
    source,
    prepaymentAmount,
    paymentMethod,
    onSitePaymentAmount,
    onSitePaymentMethod,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString()
  });
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
      email: "alina@example.com",
      date: today,
      time: "11:00",
      guestTickets: makeTickets("Семейный билет", "Обычный билет", "Льготный билет"),
      service: "Семейный билет",
      comment: "Мама, папа и ребёнок.",
      status: "confirmed",
      createdAtOffsetDays: -2,
      source: "Сайт",
      prepaymentAmount: 1500,
      paymentMethod: "online"
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
      prepaymentAmount: 2500,
      paymentMethod: "online"
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
      status: "completed",
      createdAtOffsetDays: -4,
      source: "Телефон",
      prepaymentAmount: 2000,
      paymentMethod: "online",
      onSitePaymentAmount: 3400,
      onSitePaymentMethod: "card"
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
      paymentMethod: "online"
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
      paymentMethod: "online"
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
      prepaymentAmount: 3000,
      paymentMethod: "online"
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
      prepaymentAmount: 1000,
      paymentMethod: "online",
      onSitePaymentAmount: 1000,
      onSitePaymentMethod: "cash"
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
      prepaymentAmount: 2000,
      paymentMethod: "online"
    })
  ]);
}

export function normalizeGiftCertificateOrder(values) {
  const fallbackCertificateId = siteGiftCertificates.find((item) => item.id === "gift-visit")?.id ?? siteGiftCertificates[0].id;
  const certificateId = giftCertificateCatalog[values.certificateId] ? values.certificateId : fallbackCertificateId;
  const presetPrice = giftCertificateCatalog[certificateId]?.price ?? 0;
  const guestCount = Math.max(1, Math.min(12, Number(values.guestCount) || 1));
  const defaultVisitPricePerGuest = guestCount >= 3 ? 1200 : 1500;
  const pricePerGuest =
    certificateId === "gift-visit" ? normalizeAmount(values.pricePerGuest || defaultVisitPricePerGuest) || defaultVisitPricePerGuest : 0;
  const amount =
    certificateId === "gift-visit"
      ? normalizeAmount(values.amount || guestCount * pricePerGuest)
      : certificateId === "gift-nominal"
        ? Math.max(1000, normalizeAmount(values.amount || presetPrice))
        : presetPrice;
  const createdAt = values.createdAt ?? new Date().toISOString();
  const purchaseDate = values.purchaseDate || formatDateKey(new Date(createdAt));

  return {
    ...values,
    id: values.id || createId("gift"),
    certificateId,
    certificateTitle: normalizeText(values.certificateTitle).trim() || giftCertificateCatalog[certificateId]?.title || "Подарочный сертификат",
    amount,
    guestCount,
    pricePerGuest,
    purchaserName: normalizeText(values.purchaserName).trim(),
    purchaserPhone: normalizeText(values.purchaserPhone).trim(),
    purchaserEmail: normalizeEmail(values.purchaserEmail),
    recipientName: normalizeText(values.recipientName).trim(),
    recipientPhone: normalizeText(values.recipientPhone).trim(),
    recipientEmail: normalizeEmail(values.recipientEmail),
    deliveryContact: normalizeText(values.deliveryContact).trim(),
    message: normalizeText(values.message).trim(),
    deliveryMethod: giftDeliveryOptions.includes(values.deliveryMethod) ? values.deliveryMethod : giftDeliveryOptions[0],
    comment: normalizeText(values.comment).trim(),
    source: values.source || "Сайт",
    status: values.status || "paid",
    paymentMethod: normalizePaymentMethod(values.paymentMethod || "online") || "online",
    purchaseDate,
    purchaseTime: normalizeClockTime(values.purchaseTime || getCurrentClockTime()),
    createdAt,
    updatedAt: values.updatedAt ?? createdAt
  };
}

export function getGiftCertificateSummary(order) {
  return `${order.certificateTitle} · ${formatCurrency(order.amount)}`;
}

export function matchesGiftSearch(order, query) {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();
  const haystack = [
    order.purchaserName,
    order.purchaserPhone,
    order.purchaserEmail,
    order.recipientName,
    order.recipientPhone,
    order.recipientEmail,
    order.deliveryContact,
    order.certificateTitle,
    order.message,
    order.comment,
    order.deliveryMethod,
    `${order.guestCount || ""}`,
    `${order.amount}`
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export function getDayGiftOrders(giftOrders, dateKey) {
  return [...giftOrders]
    .filter((order) => order.purchaseDate === dateKey)
    .sort((left, right) => `${left.purchaseDate} ${left.purchaseTime}`.localeCompare(`${right.purchaseDate} ${right.purchaseTime}`));
}

export function getDayGiftRevenue(giftOrders, dateKey) {
  return getDayGiftOrders(giftOrders, dateKey).reduce((sum, order) => sum + normalizeAmount(order.amount), 0);
}

export function normalizeActivityEntry(entry) {
  const timestamp = entry.timestamp ?? new Date().toISOString();

  return {
    id: entry.id || createId("activity"),
    entityId: entry.entityId || "",
    entityType: entry.entityType || "appointment",
    kind: entry.kind || "updated",
    relatedDate: entry.relatedDate || formatDateKey(new Date(timestamp)),
    relatedTime: entry.relatedTime ? normalizeClockTime(entry.relatedTime) : "",
    message: normalizeText(entry.message),
    tone: entry.tone || "info",
    timestamp
  };
}

export function createActivityEntry(entry) {
  return normalizeActivityEntry(entry);
}

export function getDayActivity(activityLog, dateKey) {
  return [...activityLog]
    .filter((entry) => entry.relatedDate === dateKey)
    .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
}

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

export function readStoredAppointments() {
  const storedAppointments = readAdminJson(ADMIN_APPOINTMENTS_KEY, null);
  return storedAppointments ? sortAppointments(storedAppointments.map((appointment) => normalizeAppointment(appointment))) : createMockAppointments();
}

export function readStoredSettings() {
  return normalizeSettings(readAdminJson(ADMIN_SETTINGS_KEY, null));
}

export function readStoredGiftOrders() {
  const storedOrders = readAdminJson(ADMIN_GIFT_CERTIFICATES_KEY, null);
  return storedOrders ? storedOrders.map((order) => normalizeGiftCertificateOrder(order)) : createMockGiftCertificateOrders();
}

export function readStoredFinanceRecords() {
  const storedRecords = readAdminJson(ADMIN_FINANCE_RECORDS_KEY, null);
  return storedRecords ? sortFinanceRecords(storedRecords.map((record) => normalizeFinanceRecord(record))) : createMockFinanceRecords();
}

export function readStoredActivityLog() {
  const storedActivity = readAdminJson(ADMIN_ACTIVITY_KEY, null);
  return storedActivity ? storedActivity.map((entry) => normalizeActivityEntry(entry)) : createMockActivityLog();
}

export function appendActivityEntry(entry) {
  const nextEntry = normalizeActivityEntry(entry);
  const activityLog = readStoredActivityLog();
  writeAdminJson(ADMIN_ACTIVITY_KEY, [nextEntry, ...activityLog].slice(0, 300));
  return nextEntry;
}

export function savePublicBooking(values) {
  const appointments = readStoredAppointments();
  const settings = readStoredSettings();
  const appointment = normalizeAppointment({
    id: createId("appointment"),
    clientName: values.clientName,
    phone: values.phone,
    email: values.email,
    date: values.date,
    time: values.time,
    guestTickets: values.guestTickets,
    selectedExtras: values.selectedExtras,
    service: values.guestTickets?.[0]?.tariff,
    comment: values.comment,
    status: "new",
    source: "Сайт",
    prepaymentAmount: calculateExpectedPrepayment(values.guestTickets?.length ?? 1, calculateTotalAmount(values.guestTickets, values.selectedExtras)),
    paymentMethod: "online",
    onSitePaymentAmount: 0,
    onSitePaymentMethod: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  if (!canSaveInSlot(appointments, settings, appointment)) {
    const slotState = getSlotCapacityState(appointments, settings, appointment.date, appointment.time, appointment.id);
    throw new Error(`На ${appointment.time} осталось только ${slotState.remainingGuests} мест.`);
  }

  writeAdminJson(ADMIN_APPOINTMENTS_KEY, sortAppointments([...appointments, appointment]));
  appendActivityEntry(
    createActivityEntry({
      entityId: appointment.id,
      entityType: "appointment",
      kind: "created",
      relatedDate: appointment.date,
      relatedTime: appointment.time,
      tone: "success",
      message: `Сайт: новая бронь ${appointment.clientName} · ${appointment.time} · ${appointment.guestCount} чел.`
    })
  );

  return appointment;
}

export function saveGiftCertificatePurchase(values) {
  const order = normalizeGiftCertificateOrder({
    ...values,
    id: createId("gift"),
    source: "Сайт",
    paymentMethod: "online",
    status: "paid",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const orders = readStoredGiftOrders();

  writeAdminJson(ADMIN_GIFT_CERTIFICATES_KEY, [order, ...orders]);
  appendActivityEntry(
    createActivityEntry({
      entityId: order.id,
      entityType: "gift-certificate",
      kind: "paid",
      relatedDate: order.purchaseDate,
      relatedTime: order.purchaseTime,
      tone: "success",
      message: `Сертификат оплачен: ${order.purchaserName} · ${order.certificateTitle} · ${formatCurrency(order.amount)}`
    })
  );

  return order;
}

export function createMockGiftCertificateOrders() {
  const today = formatDateKey(new Date());

  return [
    normalizeGiftCertificateOrder({
      id: "gift-001",
      certificateId: "gift-standard",
      purchaserName: "Мария Соколова",
      purchaserPhone: "+7 900 111-22-33",
      purchaserEmail: "maria@example.com",
      recipientName: "Анна",
      recipientEmail: "anna@example.com",
      message: "С днём рождения и тёплого визита!",
      deliveryMethod: "Email",
      purchaseDate: today,
      purchaseTime: "10:15",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    normalizeGiftCertificateOrder({
      id: "gift-002",
      certificateId: "gift-nominal",
      amount: 5000,
      purchaserName: "Денис Павлов",
      purchaserPhone: "+7 921 200-77-11",
      purchaserEmail: "denis@example.com",
      recipientName: "Ольга",
      deliveryMethod: "WhatsApp",
      purchaseDate: shiftDate(today, -1),
      purchaseTime: "18:40",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  ];
}

export function createMockFinanceRecords() {
  const today = formatDateKey(new Date());

  return sortFinanceRecords([
    normalizeFinanceRecord({
      id: "finance-001",
      type: "expense",
      date: today,
      time: "09:40",
      title: "Расходники для зала",
      person: "Хозмаркет",
      category: "Расходники",
      amount: 900,
      note: "Салфетки, перчатки и уборка",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    normalizeFinanceRecord({
      id: "finance-002",
      type: "income",
      date: today,
      time: "12:20",
      title: "Доплата за праздник",
      person: "Анастасия Волкова",
      category: "Мероприятие",
      amount: 7000,
      note: "День рождения вне сайта",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    normalizeFinanceRecord({
      id: "finance-003",
      type: "expense",
      date: today,
      time: "20:10",
      title: "Зарплата администратора",
      person: "Марина",
      category: "Зарплата",
      amount: 2500,
      note: "Смена за день",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    normalizeFinanceRecord({
      id: "finance-004",
      type: "expense",
      date: shiftDate(today, -1),
      time: "18:30",
      title: "Корм и уход",
      person: "Фермерский склад",
      category: "Корм и уход",
      amount: 1800,
      note: "Овощи и лакомства для свинок",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  ]);
}

export function createMockActivityLog() {
  const today = formatDateKey(new Date());

  return [
    createActivityEntry({
      id: "activity-001",
      entityId: "apt-005",
      entityType: "appointment",
      kind: "canceled",
      relatedDate: today,
      relatedTime: "15:00",
      tone: "danger",
      message: "Отмена: Дарья Климова освободила слот 15:00."
    }),
    createActivityEntry({
      id: "activity-002",
      entityId: "apt-001",
      entityType: "appointment",
      kind: "created",
      relatedDate: today,
      relatedTime: "11:00",
      tone: "success",
      message: "Сайт: новая бронь Алина Смирнова · 11:00 · 3 чел."
    }),
    createActivityEntry({
      id: "activity-003",
      entityId: "gift-001",
      entityType: "gift-certificate",
      kind: "paid",
      relatedDate: today,
      relatedTime: "10:15",
      tone: "success",
      message: "Сертификат оплачен: Мария Соколова · Сертификат на стандартный визит."
    }),
    createActivityEntry({
      id: "activity-004",
      entityId: "finance-002",
      entityType: "finance",
      kind: "income",
      relatedDate: today,
      relatedTime: "12:20",
      tone: "success",
      message: `Ручной доход: Доплата за праздник · ${formatCurrency(7000)}`
    }),
    createActivityEntry({
      id: "activity-005",
      entityId: "finance-003",
      entityType: "finance",
      kind: "expense",
      relatedDate: today,
      relatedTime: "20:10",
      tone: "danger",
      message: `Расход: Зарплата администратора · ${formatCurrency(2500)}`
    })
  ];
}
