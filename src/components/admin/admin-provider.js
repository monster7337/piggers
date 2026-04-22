"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ADMIN_ACTIVITY_KEY,
  ADMIN_APPOINTMENTS_KEY,
  ADMIN_FINANCE_RECORDS_KEY,
  ADMIN_GIFT_CERTIFICATES_KEY,
  ADMIN_SETTINGS_KEY,
  createActivityEntry,
  createAppointmentTemplate,
  createMockFinanceRecords,
  createMockActivityLog,
  createMockAppointments,
  createMockGiftCertificateOrders,
  defaultSettings,
  formatDateKey,
  formatCurrency,
  getSlotReserveKey,
  groupClients,
  normalizeActivityEntry,
  normalizeAppointment,
  normalizeFinanceRecord,
  normalizeSettings,
  readStoredActivityLog,
  readStoredAppointments,
  readStoredFinanceRecords,
  readStoredGiftOrders,
  readStoredSettings,
  sortFinanceRecords,
  sortAppointments,
  writeAdminJson
} from "@/components/admin/admin-data";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [giftOrders, setGiftOrders] = useState([]);
  const [financeRecords, setFinanceRecords] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const settingsRef = useRef(defaultSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [editorState, setEditorState] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAppointments(readStoredAppointments());
    setGiftOrders(readStoredGiftOrders());
    setFinanceRecords(readStoredFinanceRecords());
    setActivityLog(readStoredActivityLog());
    setSettings(readStoredSettings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeAdminJson(ADMIN_APPOINTMENTS_KEY, appointments);
  }, [appointments, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeAdminJson(ADMIN_GIFT_CERTIFICATES_KEY, giftOrders);
  }, [giftOrders, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeAdminJson(ADMIN_FINANCE_RECORDS_KEY, financeRecords);
  }, [financeRecords, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeAdminJson(ADMIN_ACTIVITY_KEY, activityLog);
  }, [activityLog, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeAdminJson(ADMIN_SETTINGS_KEY, settings);
  }, [settings, hydrated]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleStorage(event) {
      if (!event.key) {
        return;
      }

      if (event.key === ADMIN_APPOINTMENTS_KEY) {
        setAppointments(readStoredAppointments());
      }

      if (event.key === ADMIN_GIFT_CERTIFICATES_KEY) {
        setGiftOrders(readStoredGiftOrders());
      }

      if (event.key === ADMIN_FINANCE_RECORDS_KEY) {
        setFinanceRecords(readStoredFinanceRecords());
      }

      if (event.key === ADMIN_ACTIVITY_KEY) {
        setActivityLog(readStoredActivityLog());
      }

      if (event.key === ADMIN_SETTINGS_KEY) {
        setSettings(readStoredSettings());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function pushToast(message, tone = "success") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

  function appendActivity(entry) {
    const normalizedEntry = normalizeActivityEntry(entry);
    setActivityLog((current) => [normalizedEntry, ...current].slice(0, 300));
  }

  function openCreateModal(seed = {}) {
    setEditorState({
      mode: "create",
      appointment: {
        ...createAppointmentTemplate(selectedDate),
        ...seed
      }
    });
  }

  function openEditModal(appointment) {
    setEditorState({
      mode: "edit",
      appointment: {
        ...appointment
      }
    });
  }

  function closeEditor() {
    setEditorState(null);
  }

  function openDetails(id) {
    setDetailId(id);
  }

  function closeDetails() {
    setDetailId(null);
  }

  function saveAppointment(values) {
    const normalizedAppointment = {
      ...normalizeAppointment(values),
      updatedAt: new Date().toISOString()
    };
    const existingAppointment = normalizedAppointment.id
      ? appointments.find((appointment) => appointment.id === normalizedAppointment.id) ?? null
      : null;

    if (normalizedAppointment.id) {
      setAppointments((current) =>
        sortAppointments(
          current.map((appointment) =>
            appointment.id === normalizedAppointment.id
              ? { ...appointment, ...normalizedAppointment }
              : appointment
          )
        )
      );
      appendActivity(
        createActivityEntry({
          entityId: normalizedAppointment.id,
          entityType: "appointment",
          kind: existingAppointment?.onSitePaymentAmount !== normalizedAppointment.onSitePaymentAmount ? "payment" : "updated",
          relatedDate: normalizedAppointment.date,
          relatedTime: normalizedAppointment.time,
          tone: existingAppointment?.onSitePaymentAmount !== normalizedAppointment.onSitePaymentAmount ? "success" : "info",
          message:
            existingAppointment?.onSitePaymentAmount !== normalizedAppointment.onSitePaymentAmount
              ? `Оплата на месте обновлена: ${normalizedAppointment.clientName} · ${normalizedAppointment.onSitePaymentAmount} ₽`
              : `Запись обновлена: ${normalizedAppointment.clientName} · ${normalizedAppointment.time} · ${normalizedAppointment.guestCount} чел.`
        })
      );
      pushToast("Запись обновлена");
    } else {
      const appointment = {
        ...normalizedAppointment,
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `appointment-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      setAppointments((current) => sortAppointments([...current, appointment]));
      appendActivity(
        createActivityEntry({
          entityId: appointment.id,
          entityType: "appointment",
          kind: "created",
          relatedDate: appointment.date,
          relatedTime: appointment.time,
          tone: "success",
          message: `Новая запись: ${appointment.clientName} · ${appointment.time} · ${appointment.guestCount} чел.`
        })
      );
      pushToast("Запись создана");
    }

    setSelectedDate(normalizedAppointment.date);
    closeEditor();
  }

  function updateAppointmentStatus(id, status, successMessage) {
    const appointment = appointments.find((item) => item.id === id);
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              status,
              updatedAt: new Date().toISOString()
            }
          : appointment
      )
    );

    if (detailId === id && status === "canceled") {
      setDetailId(id);
    }

    if (appointment) {
      appendActivity(
        createActivityEntry({
          entityId: appointment.id,
          entityType: "appointment",
          kind: status,
          relatedDate: appointment.date,
          relatedTime: appointment.time,
          tone: status === "canceled" ? "danger" : "success",
          message: `${appointment.clientName}: статус изменён на «${successMessage.replace(/^Запись /, "").toLowerCase()}».`
        })
      );
    }

    pushToast(successMessage);
  }

  function deleteAppointment(id) {
    const appointment = appointments.find((item) => item.id === id);
    setAppointments((current) => current.filter((appointment) => appointment.id !== id));
    setDetailId(null);
    if (appointment) {
      appendActivity(
        createActivityEntry({
          entityId: appointment.id,
          entityType: "appointment",
          kind: "deleted",
          relatedDate: appointment.date,
          relatedTime: appointment.time,
          tone: "danger",
          message: `Запись удалена: ${appointment.clientName} · ${appointment.time}.`
        })
      );
    }
    pushToast("Запись удалена", "neutral");
  }

  function saveSettings(nextSettings) {
    setSettings((current) => normalizeSettings({ ...current, ...nextSettings, slotDuration: Number(nextSettings.slotDuration) }));
    pushToast("Настройки сохранены");
  }

  function saveFinanceRecord(values) {
    const normalizedRecord = {
      ...normalizeFinanceRecord(values),
      updatedAt: new Date().toISOString()
    };
    const existingRecord = normalizedRecord.id ? financeRecords.find((record) => record.id === normalizedRecord.id) ?? null : null;

    setFinanceRecords((current) => {
      if (existingRecord) {
        return sortFinanceRecords(
          current.map((record) => (record.id === normalizedRecord.id ? { ...record, ...normalizedRecord } : record))
        );
      }

      return sortFinanceRecords([...current, normalizedRecord]);
    });

    appendActivity(
      createActivityEntry({
        entityId: normalizedRecord.id,
        entityType: "finance",
        kind: normalizedRecord.type,
        relatedDate: normalizedRecord.date,
        relatedTime: normalizedRecord.time,
        tone: normalizedRecord.type === "expense" ? "danger" : "success",
        message: `${normalizedRecord.type === "expense" ? "Расход" : "Доход"}: ${normalizedRecord.title} · ${formatCurrency(
          normalizedRecord.amount
        )}`
      })
    );
    setSelectedDate(normalizedRecord.date);
    pushToast(
      existingRecord ? "Операция обновлена" : normalizedRecord.type === "expense" ? "Расход добавлен" : "Доход добавлен",
      normalizedRecord.type === "expense" ? "neutral" : "success"
    );
  }

  function deleteFinanceRecord(id) {
    const record = financeRecords.find((item) => item.id === id);

    if (!record) {
      return;
    }

    setFinanceRecords((current) => current.filter((item) => item.id !== id));
    appendActivity(
      createActivityEntry({
        entityId: record.id,
        entityType: "finance",
        kind: "deleted",
        relatedDate: record.date,
        relatedTime: record.time,
        tone: "danger",
        message: `Операция удалена: ${record.title} · ${formatCurrency(record.amount)}`
      })
    );
    pushToast("Операция удалена", "neutral");
  }

  function updateSlotReserve(dateKey, time, delta) {
    const reserveKey = getSlotReserveKey(dateKey, time);
    const currentSettings = settingsRef.current;
    const currentValue = currentSettings.slotReserveMap?.[reserveKey] ?? 0;
    const nextValue = Math.max(0, Math.min(2, currentValue + delta));

    if (nextValue === currentValue) {
      return;
    }

    const nextMap = { ...(currentSettings.slotReserveMap ?? {}) };

    if (nextValue > 0) {
      nextMap[reserveKey] = nextValue;
    } else {
      delete nextMap[reserveKey];
    }

    const nextSettings = normalizeSettings({
      ...currentSettings,
      slotReserveMap: nextMap
    });

    settingsRef.current = nextSettings;
    setSettings(nextSettings);

    appendActivity(
      createActivityEntry({
        entityId: reserveKey,
        entityType: "slot",
        kind: "reserve-updated",
        relatedDate: dateKey,
        relatedTime: time,
        tone: "info",
        message: `Резервные места ${time}: активировано ${nextValue} из 2.`
      })
    );
    pushToast(nextValue > currentValue ? "Добавлено резервное место" : "Резервное место скрыто", "neutral");
  }

  function resetDemoData() {
    setAppointments(createMockAppointments());
    setGiftOrders(createMockGiftCertificateOrders());
    setFinanceRecords(createMockFinanceRecords());
    setActivityLog(createMockActivityLog());
    setSettings(normalizeSettings(defaultSettings));
    setSelectedDate(formatDateKey(new Date()));
    pushToast("Демо-данные восстановлены", "neutral");
  }

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === detailId) ?? null,
    [appointments, detailId]
  );

  const clients = useMemo(() => groupClients(appointments), [appointments]);

  const value = {
    appointments,
    activityLog,
    clients,
    closeDetails,
    closeEditor,
    deleteFinanceRecord,
    deleteAppointment,
    detailId,
    editorState,
    financeRecords,
    giftOrders,
    hydrated,
    openCreateModal,
    openDetails,
    openEditModal,
    pushToast,
    resetDemoData,
    saveAppointment,
    saveFinanceRecord,
    saveSettings,
    searchQuery,
    selectedAppointment,
    selectedDate,
    setSearchQuery,
    setSelectedDate,
    settings,
    updateSlotReserve,
    toasts,
    updateAppointmentStatus
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }

  return context;
}
