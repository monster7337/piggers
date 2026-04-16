"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ADMIN_APPOINTMENTS_KEY,
  ADMIN_SETTINGS_KEY,
  createAppointmentTemplate,
  createMockAppointments,
  defaultSettings,
  formatDateKey,
  groupClients,
  normalizeAppointment,
  readAdminJson,
  sortAppointments,
  writeAdminJson
} from "@/components/admin/admin-data";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [editorState, setEditorState] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedAppointments = readAdminJson(ADMIN_APPOINTMENTS_KEY, null);
    const storedSettings = readAdminJson(ADMIN_SETTINGS_KEY, null);

    setAppointments(
      storedAppointments ? sortAppointments(storedAppointments.map((appointment) => normalizeAppointment(appointment))) : createMockAppointments()
    );
    setSettings(storedSettings ? { ...defaultSettings, ...storedSettings } : defaultSettings);
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

    writeAdminJson(ADMIN_SETTINGS_KEY, settings);
  }, [settings, hydrated]);

  function pushToast(message, tone = "success") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
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
      pushToast("Запись создана");
    }

    setSelectedDate(normalizedAppointment.date);
    closeEditor();
  }

  function updateAppointmentStatus(id, status, successMessage) {
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

    pushToast(successMessage);
  }

  function deleteAppointment(id) {
    setAppointments((current) => current.filter((appointment) => appointment.id !== id));
    setDetailId(null);
    pushToast("Запись удалена", "neutral");
  }

  function saveSettings(nextSettings) {
    setSettings((current) => ({
      ...current,
      ...nextSettings,
      slotDuration: Number(nextSettings.slotDuration)
    }));
    pushToast("Настройки сохранены");
  }

  function resetDemoData() {
    setAppointments(createMockAppointments());
    setSettings(defaultSettings);
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
    clients,
    closeDetails,
    closeEditor,
    deleteAppointment,
    detailId,
    editorState,
    hydrated,
    openCreateModal,
    openDetails,
    openEditModal,
    pushToast,
    resetDemoData,
    saveAppointment,
    saveSettings,
    searchQuery,
    selectedAppointment,
    selectedDate,
    setSearchQuery,
    setSelectedDate,
    settings,
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
