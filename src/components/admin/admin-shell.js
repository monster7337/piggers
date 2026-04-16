"use client";

import clsx from "clsx";
import {
  CalendarClock,
  CalendarRange,
  ChevronRight,
  Clock3,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  Pencil,
  Phone,
  Plus,
  Rows3,
  Search,
  Settings,
  Trash2,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { stripBasePath } from "@/lib/base-path";
import styles from "@/components/admin/admin.module.css";
import {
  ADMIN_AUTH_KEY,
  FIXED_SLOT_TIMES,
  SLOT_CAPACITY,
  accentThemes,
  canSaveInSlot,
  formatCurrency,
  formatLongDate,
  formatShortDate,
  formatWeekday,
  getAppointmentEnd,
  getPaymentMethodLabel,
  getSlotCapacityState,
  getStatusMeta,
  getTariffPrice,
  getTariffSummary,
  hasPrepayment,
  normalizeAppointment,
  paymentMethodOptions,
  removeAdminStorage,
  resizeGuestTickets,
  serviceOptions,
  sourceOptions,
  ticketCatalog,
  statusOptions
} from "@/components/admin/admin-data";
import { useAdmin } from "@/components/admin/admin-provider";

const navigationItems = [
  { href: "/admin/dashboard", label: "Сегодня", icon: Home },
  { href: "/admin/calendar", label: "Календарь", icon: CalendarRange },
  { href: "/admin/appointments", label: "Записи", icon: Rows3 },
  { href: "/admin/clients", label: "Клиенты", icon: Users },
  { href: "/admin/settings", label: "Настройки", icon: Settings }
];

const pageMetaMap = {
  "/admin/dashboard": {
    eyebrow: "Тетрадь дня",
    title: "Сегодня",
    description: "Нечетные часы, число гостей и заполненность каждого слота."
  },
  "/admin/calendar": {
    eyebrow: "Планирование",
    title: "Календарь",
    description: "Слоты 11, 13, 15, 17 и 19 для каждого дня."
  },
  "/admin/appointments": {
    eyebrow: "Записи",
    title: "Все записи",
    description: "Поиск, фильтры и редактирование бронирований."
  },
  "/admin/clients": {
    eyebrow: "Клиенты",
    title: "Клиенты",
    description: "Минимальная база клиентов и история посещений."
  },
  "/admin/settings": {
    eyebrow: "Workspace",
    title: "Настройки",
    description: "Фиксированные часы, стартовый экран и демо-данные."
  }
};

function StatusChip({ status }) {
  const meta = getStatusMeta(status);
  return (
    <span className={styles.statusChip} data-tone={meta.tone}>
      {meta.label}
    </span>
  );
}

function EditorChoiceGroup({ compact = false, onChange, options, value }) {
  return (
    <div className={clsx(styles.editorChoiceGrid, compact && styles.editorChoiceGridCompact)}>
      {options.map((option) => (
        <button
          key={option.value}
          className={clsx(
            styles.editorChoiceButton,
            compact && styles.editorChoiceButtonCompact,
            value === option.value && styles.editorChoiceButtonActive
          )}
          data-tone={option.tone ?? "default"}
          type="button"
          onClick={() => onChange(option.value)}
        >
          <strong>{option.label}</strong>
          {option.hint ? <span>{option.hint}</span> : null}
        </button>
      ))}
    </div>
  );
}

function AppointmentEditorModal() {
  const { appointments, closeEditor, editorState, saveAppointment } = useAdmin();
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editorState) {
      setDraft(null);
      setError("");
      return;
    }

    setDraft(editorState.appointment);
    setError("");
  }, [editorState]);

  if (!editorState || !draft) {
    return null;
  }

  function updateField(field, value) {
    setDraft((current) =>
      normalizeAppointment({
        ...current,
        [field]: field === "guestCount" ? value : value
      })
    );
  }

  function updateGuestCount(value) {
    setDraft((current) =>
      normalizeAppointment({
        ...current,
        guestTickets: resizeGuestTickets(current.guestTickets, value, current.service)
      })
    );
  }

  function updateTicketTariff(ticketId, tariff) {
    setDraft((current) =>
      normalizeAppointment({
        ...current,
        guestTickets: current.guestTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, tariff } : ticket))
      })
    );
  }

  function addGuestTicket() {
    setDraft((current) =>
      normalizeAppointment({
        ...current,
        guestTickets: resizeGuestTickets(current.guestTickets, current.guestTickets.length + 1, current.service)
      })
    );
  }

  function removeGuestTicket(ticketId) {
    setDraft((current) => {
      if (current.guestTickets.length <= 1) {
        return current;
      }

      return normalizeAppointment({
        ...current,
        guestTickets: current.guestTickets.filter((ticket) => ticket.id !== ticketId)
      });
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!draft.clientName.trim() || !draft.phone.trim() || !draft.date || !draft.time || !draft.guestTickets?.length) {
      setError("Заполните имя, телефон, дату, час и добавьте хотя бы одного гостя.");
      return;
    }

    if (draft.prepaymentAmount > 0 && !draft.paymentMethod) {
      setError("Укажите способ оплаты для внесённой суммы.");
      return;
    }

    if (!canSaveInSlot(appointments, draft)) {
      const slotState = getSlotCapacityState(appointments, draft.date, draft.time, draft.id);
      setError(
        `На ${draft.time} уже ${slotState.bookedGuests} гостей. Можно добавить максимум ${slotState.remainingGuests}.`
      );
      return;
    }

    saveAppointment(draft);
  }

  const selectedStatusMeta = getStatusMeta(draft.status);
  const slotState = getSlotCapacityState(appointments, draft.date, draft.time, draft.id);
  const maxGuestsForDraft = slotState.remainingGuests + draft.guestCount;
  const slotOptions = FIXED_SLOT_TIMES.map((time) => {
    const state = getSlotCapacityState(appointments, draft.date, time, draft.id);
    return {
      value: time,
      label: time,
      hint: `${state.bookedGuests}/${SLOT_CAPACITY} гостей`,
      tone: state.isFull ? "danger" : state.bookedGuests ? "success" : "default"
    };
  });

  return (
    <div className={styles.modalBackdrop} onClick={closeEditor}>
      <form className={styles.modalCard} onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalEyebrow}>{editorState.mode === "edit" ? "Редактирование" : "Новая запись"}</p>
            <h2>{editorState.mode === "edit" ? "Обновить запись" : "Создать запись"}</h2>
          </div>
          <button className={styles.iconButton} type="button" onClick={closeEditor} aria-label="Закрыть">
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.editorBodyStack}>
            <section className={styles.editorHero}>
              <div className={styles.editorHeroMain}>
                <p className={styles.editorHeroLabel}>{getTariffSummary(draft, true)}</p>
                <strong>{draft.clientName.trim() || "Новая запись"}</strong>
                <p>
                  {draft.phone.trim() || "Добавьте телефон клиента"} · {draft.guestCount} чел. · {formatCurrency(draft.totalAmount)}
                </p>
              </div>
              <div className={styles.editorHeroMeta}>
                <span className={styles.detailHeroChip}>
                  <CalendarRange size={14} />
                  {formatShortDate(draft.date)}
                </span>
                <span className={styles.detailHeroChip}>
                  <Clock3 size={14} />
                  {draft.time} - {getAppointmentEnd(draft)}
                </span>
                <span className={styles.detailHeroChip}>
                  <Users size={14} />
                  Уже {slotState.bookedGuests}/{SLOT_CAPACITY}
                </span>
                <span className={styles.detailHeroChip}>{hasPrepayment(draft) ? "Предоплата внесена" : "Без предоплаты"}</span>
                <span className={styles.editorStatusBadge} data-tone={selectedStatusMeta.tone}>
                  {selectedStatusMeta.label}
                </span>
              </div>
            </section>

            <section className={styles.editorSection}>
              <div className={styles.editorFieldGrid}>
                <label className={clsx(styles.field, styles.settingField, styles.editorFieldCard)}>
                  <div className={styles.editorFieldHeader}>
                    <span>Имя клиента</span>
                    <small>Как показывать запись в тетради дня</small>
                  </div>
                  <input
                    placeholder="Например, Никита Козлов"
                    value={draft.clientName}
                    onChange={(event) => updateField("clientName", event.target.value)}
                  />
                </label>

                <label className={clsx(styles.field, styles.settingField, styles.editorFieldCard)}>
                  <div className={styles.editorFieldHeader}>
                    <span>Телефон</span>
                    <small>Для звонка и подтверждения</small>
                  </div>
                  <input
                    placeholder="+7 900 000-00-00"
                    type="tel"
                    autoComplete="tel"
                    value={draft.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className={styles.editorSection}>
              <div className={styles.editorSectionHeader}>
                <div>
                  <p className={styles.editorSectionTitle}>Дата и час</p>
                  <p className={styles.editorSectionNote}>Запись возможна только на нечетные часы ровно по началу часа.</p>
                </div>
                <div className={styles.editorSectionMeta}>
                  <span>Свободно</span>
                  <strong>{slotState.remainingGuests} мест</strong>
                </div>
              </div>

              <div className={styles.timeFieldsGrid}>
                <label className={clsx(styles.field, styles.settingField, styles.editorFieldCard)}>
                  <div className={styles.editorFieldHeader}>
                    <span>Дата</span>
                    <small>День для бронирования</small>
                  </div>
                  <input type="date" value={draft.date} onChange={(event) => updateField("date", event.target.value)} />
                </label>

                <label className={clsx(styles.field, styles.settingField, styles.editorFieldCard)}>
                  <div className={styles.editorFieldHeader}>
                    <span>Количество гостей</span>
                    <small>Это число сразу создаёт карточки гостей ниже</small>
                  </div>
                  <input
                    min="1"
                    max={Math.max(1, maxGuestsForDraft)}
                    type="number"
                    value={draft.guestCount}
                    onChange={(event) => updateGuestCount(event.target.value)}
                  />
                </label>
              </div>

              <EditorChoiceGroup compact options={slotOptions} value={draft.time} onChange={(value) => updateField("time", value)} />
            </section>

            <section className={styles.editorSection}>
              <div className={styles.editorSectionHeader}>
                <div>
                  <p className={styles.editorSectionTitle}>Гости и тарифы</p>
                  <p className={styles.editorSectionNote}>На каждого гостя можно выбрать свой тариф. Итоговая сумма считается автоматически.</p>
                </div>
                <div className={styles.editorSectionMeta}>
                  <span>Итого</span>
                  <strong>{formatCurrency(draft.totalAmount)}</strong>
                </div>
              </div>

              <div className={styles.ticketList}>
                {draft.guestTickets.map((ticket, index) => (
                  <div key={ticket.id} className={styles.ticketRow}>
                    <div className={styles.ticketRowTop}>
                      <div className={styles.ticketIdentity}>
                        <span className={styles.ticketIndex}>{index + 1}</span>
                        <div>
                          <strong>Гость {index + 1}</strong>
                          <small>{formatCurrency(getTariffPrice(ticket.tariff))}</small>
                        </div>
                      </div>
                      {draft.guestTickets.length > 1 ? (
                        <button
                          className={styles.ticketRemoveButton}
                          type="button"
                          aria-label={`Убрать гостя ${index + 1}`}
                          onClick={() => removeGuestTicket(ticket.id)}
                        >
                          <X size={16} />
                        </button>
                      ) : null}
                    </div>
                    <label className={clsx(styles.field, styles.settingField, styles.editorFieldCard, styles.ticketSelectField)}>
                      <div className={styles.editorFieldHeader}>
                        <span>Тариф</span>
                        <small>{ticketCatalog[ticket.tariff].shortLabel}</small>
                      </div>
                      <select value={ticket.tariff} onChange={(event) => updateTicketTariff(ticket.id, event.target.value)}>
                        {serviceOptions.map((service) => (
                          <option key={service} value={service}>
                            {service} · {formatCurrency(getTariffPrice(service))}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </div>

              <button
                className={styles.notebookAddButton}
                type="button"
                onClick={addGuestTicket}
                disabled={draft.guestTickets.length >= maxGuestsForDraft}
              >
                Добавить гостя
              </button>
            </section>

            <section className={styles.editorSection}>
              <div className={styles.editorSectionHeader}>
                <div>
                  <p className={styles.editorSectionTitle}>Оплата</p>
                  <p className={styles.editorSectionNote}>Фиксируйте, сколько уже внесли, каким способом и сколько осталось доплатить.</p>
                </div>
                <div className={styles.editorSectionMeta}>
                  <span>Остаток</span>
                  <strong>{formatCurrency(draft.remainingAmount)}</strong>
                </div>
              </div>

              <div className={styles.paymentSummaryGrid}>
                <div className={styles.paymentSummaryCard}>
                  <span>Всего стоит</span>
                  <strong>{formatCurrency(draft.totalAmount)}</strong>
                </div>
                <div className={styles.paymentSummaryCard}>
                  <span>Внесено</span>
                  <strong>{formatCurrency(draft.prepaymentAmount)}</strong>
                </div>
                <div className={styles.paymentSummaryCard}>
                  <span>Осталось</span>
                  <strong>{formatCurrency(draft.remainingAmount)}</strong>
                </div>
                <div className={styles.paymentSummaryCard}>
                  <span>Предоплата</span>
                  <strong>{hasPrepayment(draft) ? "Есть" : "Нет"}</strong>
                </div>
              </div>

              <div className={styles.editorFieldGrid}>
                <label className={clsx(styles.field, styles.settingField, styles.editorFieldCard)}>
                  <div className={styles.editorFieldHeader}>
                    <span>Сколько внесли</span>
                    <small>Можно указать предоплату или полную оплату</small>
                  </div>
                  <input
                    min="0"
                    max={draft.totalAmount}
                    type="number"
                    value={draft.prepaymentAmount}
                    onChange={(event) => updateField("prepaymentAmount", event.target.value)}
                  />
                </label>

                <div className={clsx(styles.settingField, styles.editorFieldCard, styles.paymentMethodBlock)}>
                  <div className={styles.editorFieldHeader}>
                    <span>Способ оплаты</span>
                    <small>{draft.prepaymentAmount > 0 ? "Как внесли деньги" : "Станет доступно после внесения суммы"}</small>
                  </div>
                  {draft.prepaymentAmount > 0 ? (
                    <EditorChoiceGroup
                      compact
                      options={paymentMethodOptions.map((method) => ({
                        value: method.value,
                        label: method.label
                      }))}
                      value={draft.paymentMethod}
                      onChange={(value) => updateField("paymentMethod", value)}
                    />
                  ) : (
                    <div className={styles.paymentMethodPlaceholder}>Сначала укажите внесённую сумму.</div>
                  )}
                </div>
              </div>
            </section>

            <section className={styles.editorSection}>
              <div className={clsx(styles.editorFieldGrid, styles.editorFieldGridWide)}>
                <div className={styles.editorSubSection}>
                  <div className={styles.editorSectionHeader}>
                    <div>
                      <p className={styles.editorSectionTitle}>Статус</p>
                      <p className={styles.editorSectionNote}>Как сейчас выглядит запись в работе.</p>
                    </div>
                  </div>
                  <EditorChoiceGroup
                    compact
                    options={statusOptions.map((status) => ({
                      value: status.value,
                      label: status.label,
                      tone: status.tone
                    }))}
                    value={draft.status}
                    onChange={(value) => updateField("status", value)}
                  />
                </div>

                <div className={styles.editorSubSection}>
                  <div className={styles.editorSectionHeader}>
                    <div>
                      <p className={styles.editorSectionTitle}>Источник</p>
                      <p className={styles.editorSectionNote}>Откуда пришёл клиент.</p>
                    </div>
                  </div>
                  <EditorChoiceGroup
                    compact
                    options={sourceOptions.map((source) => ({
                      value: source,
                      label: source
                    }))}
                    value={draft.source}
                    onChange={(value) => updateField("source", value)}
                  />
                </div>
              </div>
            </section>

            <section className={styles.editorSection}>
              <div className={styles.editorSectionHeader}>
                <div>
                  <p className={styles.editorSectionTitle}>Комментарий</p>
                  <p className={styles.editorSectionNote}>Короткая заметка по группе, опозданию или особым условиям.</p>
                </div>
              </div>

              <label className={clsx(styles.field, styles.settingField, styles.editorFieldCard)}>
                <textarea
                  className={styles.editorTextarea}
                  placeholder="Например: придут чуть позже, нужна тихая зона, день рождения."
                  rows={4}
                  value={draft.comment}
                  onChange={(event) => updateField("comment", event.target.value)}
                />
              </label>
            </section>
          </div>

          {error ? <div className={styles.inlineAlert} data-tone="danger">{error}</div> : null}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.secondaryButton} type="button" onClick={closeEditor}>
            Отмена
          </button>
          <button className={styles.primaryButton} type="submit">
            {editorState.mode === "edit" ? "Сохранить изменения" : "Создать запись"}
            <ChevronRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

function AppointmentDetailsModal() {
  const { appointments, closeDetails, deleteAppointment, openEditModal, selectedAppointment, updateAppointmentStatus } = useAdmin();

  const telLink = useMemo(
    () => (selectedAppointment?.phone ? `tel:${selectedAppointment.phone.replace(/[^\d+]/g, "")}` : "#"),
    [selectedAppointment]
  );

  if (!selectedAppointment) {
    return null;
  }

  const slotState = getSlotCapacityState(appointments, selectedAppointment.date, selectedAppointment.time);

  return (
    <div className={styles.modalBackdrop} onClick={closeDetails}>
      <div className={clsx(styles.modalCard, styles.detailModal)} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.detailHeaderMain}>
            <p className={styles.modalEyebrow}>Детали записи</p>
            <h2>{selectedAppointment.clientName}</h2>
            <div className={styles.detailHeroMeta}>
              <span className={styles.detailHeroChip}>
                <CalendarClock size={14} />
                {formatShortDate(selectedAppointment.date)}
              </span>
              <span className={styles.detailHeroChip}>
                <Clock3 size={14} />
                {selectedAppointment.time} - {getAppointmentEnd(selectedAppointment)}
              </span>
              <StatusChip status={selectedAppointment.status} />
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconButton} type="button" onClick={closeDetails} aria-label="Закрыть">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailActionBar}>
            <a className={styles.detailActionButton} href={telLink} aria-label="Позвонить" title="Позвонить">
              <Phone size={16} />
            </a>
            <button
              className={styles.detailActionButton}
              type="button"
              aria-label="Редактировать"
              title="Редактировать"
              onClick={() => {
                openEditModal(selectedAppointment);
                closeDetails();
              }}
            >
              <Pencil size={16} />
            </button>
            {selectedAppointment.status !== "canceled" ? (
              <button
                className={clsx(styles.detailActionButton, styles.detailActionWarning)}
                type="button"
                aria-label="Отменить"
                title="Отменить"
                onClick={() => updateAppointmentStatus(selectedAppointment.id, "canceled", "Запись отменена")}
              >
                <X size={16} />
              </button>
            ) : null}
            {selectedAppointment.status !== "confirmed" && selectedAppointment.status !== "completed" ? (
              <button
                className={styles.detailActionConfirm}
                type="button"
                onClick={() => updateAppointmentStatus(selectedAppointment.id, "confirmed", "Запись подтверждена")}
              >
                Подтвердить
              </button>
            ) : null}
            <button
              className={clsx(styles.detailActionButton, styles.detailActionDanger)}
              type="button"
              aria-label="Удалить"
              title="Удалить"
              onClick={() => deleteAppointment(selectedAppointment.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className={styles.detailOverviewGrid}>
            <div className={styles.detailPrimaryCard}>
              <span className={styles.detailCardLabel}>Тарифы группы</span>
              <strong>{getTariffSummary(selectedAppointment)}</strong>
              <div className={styles.detailMiniList}>
                <span className={styles.detailMiniItem}>
                  <Phone size={14} />
                  {selectedAppointment.phone}
                </span>
                <span className={styles.detailMiniItem}>
                  <Users size={14} />
                  {selectedAppointment.guestCount} чел.
                </span>
                <span className={styles.detailMiniItem}>{hasPrepayment(selectedAppointment) ? "Предоплата внесена" : "Предоплаты нет"}</span>
              </div>
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailCard}>
                <span>Дата</span>
                <strong>{formatShortDate(selectedAppointment.date)}</strong>
              </div>
              <div className={styles.detailCard}>
                <span>Час</span>
                <strong>
                  {selectedAppointment.time} - {getAppointmentEnd(selectedAppointment)}
                </strong>
              </div>
              <div className={styles.detailCard}>
                <span>В этом часу</span>
                <strong>{slotState.bookedGuests}/{SLOT_CAPACITY} гостей</strong>
              </div>
              <div className={styles.detailCard}>
                <span>Источник</span>
                <strong>{selectedAppointment.source}</strong>
              </div>
              <div className={styles.detailCard}>
                <span>Всего стоит</span>
                <strong>{formatCurrency(selectedAppointment.totalAmount)}</strong>
              </div>
              <div className={styles.detailCard}>
                <span>Внесено</span>
                <strong>{formatCurrency(selectedAppointment.prepaymentAmount)}</strong>
              </div>
              <div className={styles.detailCard}>
                <span>Способ оплаты</span>
                <strong>{getPaymentMethodLabel(selectedAppointment.paymentMethod)}</strong>
              </div>
              <div className={styles.detailCard}>
                <span>Осталось оплатить</span>
                <strong>{formatCurrency(selectedAppointment.remainingAmount)}</strong>
              </div>
              <div className={styles.detailCard}>
                <span>Свободно мест</span>
                <strong>{slotState.remainingGuests}</strong>
              </div>
              <div className={styles.detailCard}>
                <span>Создана</span>
                <strong>
                  {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(
                    new Date(selectedAppointment.createdAt)
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className={styles.detailNotesGrid}>
            <div className={styles.noteCard}>
              <span className={styles.noteCardTitle}>
                <Users size={16} />
                Гости и тарифы
              </span>
              <div className={styles.detailBreakdownList}>
                {selectedAppointment.guestTickets.map((ticket, index) => (
                  <div key={ticket.id} className={styles.detailBreakdownRow}>
                    <span>Гость {index + 1}</span>
                    <strong>
                      {ticket.tariff} · {formatCurrency(getTariffPrice(ticket.tariff))}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.noteCard}>
              <span className={styles.noteCardTitle}>
                <MessageSquareText size={16} />
                Комментарий
              </span>
              <p>{selectedAppointment.comment || "Комментарий не добавлен."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToastStack() {
  const { toasts } = useAdmin();

  if (!toasts.length) {
    return null;
  }

  return (
    <div className={styles.toastStack}>
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast} data-tone={toast.tone}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function AdminShell({ children }) {
  const pathname = stripBasePath(usePathname());
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { openCreateModal, searchQuery, selectedDate, setSearchQuery, settings } = useAdmin();

  const theme = accentThemes[settings.accentTheme] ?? accentThemes.cyan;
  const currentMeta = pageMetaMap[pathname] ?? pageMetaMap["/admin/dashboard"];
  const otherCrmUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "http://localhost:3000/admin";
    }

    return `${window.location.protocol}//${window.location.hostname}:3000/admin`;
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  function handleLogout() {
    removeAdminStorage(ADMIN_AUTH_KEY);
    router.replace("/admin");
  }

  return (
    <div
      className={styles.adminRoot}
      style={{
        "--admin-accent": theme.accent,
        "--admin-accent-soft": theme.accentSoft,
        "--admin-accent-glow": theme.accentGlow
      }}
    >
      <div className={clsx(styles.sidebarBackdrop, isMenuOpen && styles.sidebarBackdropVisible)} onClick={() => setIsMenuOpen(false)} />

      <aside className={clsx(styles.sidebar, isMenuOpen && styles.sidebarOpen)}>
        <div className={styles.brandCard}>
          <span className={styles.brandMark}>PL</span>
          <div className={styles.brandText}>
            <strong>{settings.crmName}</strong>
            <span>{settings.businessName}</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href} className={clsx(styles.navLink, isActive && styles.navLinkActive)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarInfoCard}>
            <span>Часы записи</span>
            <strong>{FIXED_SLOT_TIMES.join(" · ")}</strong>
            <small>Выбранный день: {formatWeekday(selectedDate)}, {formatShortDate(selectedDate)}</small>
          </div>
          <a className={styles.ghostButton} href={otherCrmUrl}>
            <ChevronRight size={16} />
            V Elkah CRM
          </a>
          <button className={styles.ghostButton} type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      </aside>

      <div className={styles.contentShell}>
        <header className={styles.topbar}>
          <div className={styles.topbarIntro}>
            <button className={styles.mobileMenuButton} type="button" onClick={() => setIsMenuOpen(true)}>
              <Menu size={18} />
            </button>
            <div className={styles.topbarTitleBlock}>
              <p className={styles.kicker}>{currentMeta.eyebrow}</p>
              <h1>{currentMeta.title}</h1>
              <p>{currentMeta.description}</p>
            </div>
            <div className={styles.mobileActionRow}>
              <button
                className={styles.mobileActionButton}
                type="button"
                aria-label="Открыть поиск"
                aria-pressed={isMobileSearchOpen}
                onClick={() => setIsMobileSearchOpen((current) => !current)}
              >
                <Search size={18} />
              </button>
              <button
                className={clsx(styles.mobileActionButton, styles.mobileActionPrimary)}
                type="button"
                aria-label="Новая запись"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  openCreateModal();
                }}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className={styles.topbarTools}>
            <div className={styles.dateBadge}>
              <Clock3 size={16} />
              <span>{formatLongDate(selectedDate)}</span>
            </div>

            <label className={styles.searchField}>
              <Search size={16} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Поиск по клиенту, телефону, тарифу"
              />
            </label>

            <button className={styles.primaryButton} type="button" onClick={() => openCreateModal()}>
              <Plus size={18} />
              <span>Новая запись</span>
            </button>
          </div>
        </header>

        {isMobileSearchOpen ? (
          <div className={styles.mobileSearchPanel}>
            <label className={styles.searchField}>
              <Search size={16} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Поиск по клиенту, телефону, тарифу"
              />
            </label>
          </div>
        ) : null}

        <main className={styles.contentSurface}>{children}</main>
      </div>

      <nav className={styles.bottomNav}>
        {[navigationItems[0], navigationItems[1], navigationItems[2]].map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} className={clsx(styles.bottomNavLink, isActive && styles.bottomNavActive)}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <Link href="/admin/settings" className={clsx(styles.bottomNavLink, pathname === "/admin/settings" && styles.bottomNavActive)}>
          <Settings size={18} />
          <span>Ещё</span>
        </Link>

        <button className={clsx(styles.bottomNavLink, styles.bottomNavCreate)} type="button" onClick={() => openCreateModal()}>
          <Plus size={18} />
          <span>Новая</span>
        </button>
      </nav>

      <AppointmentEditorModal />
      <AppointmentDetailsModal />
      <ToastStack />
    </div>
  );
}
