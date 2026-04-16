"use client";

import clsx from "clsx";
import { Check, ChevronLeft, ChevronRight, Pencil, Phone, SlidersHorizontal, Sparkles, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/components/admin/admin.module.css";
import {
  FIXED_SLOT_TIMES,
  SLOT_CAPACITY,
  formatDateKey,
  formatCurrency,
  formatLongDate,
  formatMonthLabel,
  formatShortDate,
  formatWeekday,
  getAppointmentEnd,
  getDayIncome,
  getDaySlotGroups,
  getFreeSlots,
  getMonthGrid,
  getPaymentSummary,
  getRecentActions,
  getSlotCapacityState,
  getStatusMeta,
  getTariffSummary,
  getUpcomingAppointments,
  getWeekDays,
  matchesSearch,
  serviceOptions,
  shiftDate,
  statusOptions
} from "@/components/admin/admin-data";
import { useAdmin } from "@/components/admin/admin-provider";

function StatusChip({ status }) {
  const meta = getStatusMeta(status);
  return (
    <span className={styles.statusChip} data-tone={meta.tone}>
      {meta.label}
    </span>
  );
}

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className={styles.emptyState}>
      <Sparkles size={18} />
      <strong>{title}</strong>
      <p>{description}</p>
      {actionLabel ? (
        <button className={styles.secondaryButton} type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function Panel({ title, description, action, children }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleBlock}>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action ? <div className={styles.panelAction}>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function DaySwitcher() {
  const { selectedDate, setSelectedDate } = useAdmin();
  const today = formatDateKey(new Date());
  const dateInputRef = useRef(null);

  function openDatePicker() {
    const input = dateInputRef.current;

    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  }

  return (
    <div className={styles.dayControl}>
      <button className={styles.iconButton} type="button" onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}>
        <ChevronLeft size={18} />
      </button>
      <label
        className={styles.dayLabel}
        onClick={(event) => {
          event.preventDefault();
          openDatePicker();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDatePicker();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <strong className={styles.dayLabelFull}>{formatLongDate(selectedDate)}</strong>
        <strong className={styles.dayLabelCompact}>
          {formatWeekday(selectedDate)}, {formatShortDate(selectedDate)}
        </strong>
        <input
          ref={dateInputRef}
          className={styles.dayInputOverlay}
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          aria-label="Выбрать дату"
        />
      </label>
      <button className={styles.iconButton} type="button" onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}>
        <ChevronRight size={18} />
      </button>
      <button className={styles.secondaryButton} type="button" onClick={() => setSelectedDate(today)}>
        Сегодня
      </button>
    </div>
  );
}

function AppointmentQuickActions({ appointment }) {
  const { openDetails, openEditModal, updateAppointmentStatus } = useAdmin();
  const telLink = `tel:${appointment.phone.replace(/[^\d+]/g, "")}`;

  return (
    <div className={styles.cardActions}>
      <button className={styles.ghostButton} type="button" onClick={() => openDetails(appointment.id)}>
        Открыть
      </button>
      <button className={styles.ghostButton} type="button" onClick={() => openEditModal(appointment)}>
        <Pencil size={14} />
        Изменить
      </button>
      {appointment.status !== "confirmed" && appointment.status !== "completed" ? (
        <button
          className={styles.successButton}
          type="button"
          onClick={() => updateAppointmentStatus(appointment.id, "confirmed", "Запись подтверждена")}
        >
          <Check size={14} />
          Подтвердить
        </button>
      ) : null}
      {appointment.status !== "canceled" ? (
        <button
          className={styles.warningButton}
          type="button"
          onClick={() => updateAppointmentStatus(appointment.id, "canceled", "Запись отменена")}
        >
          <X size={14} />
          Отменить
        </button>
      ) : null}
      <a className={styles.ghostButton} href={telLink}>
        <Phone size={14} />
        Позвонить
      </a>
    </div>
  );
}

function NotebookAppointmentRow({ appointment }) {
  const { openDetails } = useAdmin();
  const paymentNote = appointment.prepaymentAmount
    ? `Внесено ${formatCurrency(appointment.prepaymentAmount)} · осталось ${formatCurrency(appointment.remainingAmount)}`
    : "Без предоплаты";

  return (
    <button className={styles.notebookEntry} type="button" onClick={() => openDetails(appointment.id)}>
      <span className={styles.notebookGuestBadge}>
        <strong>{appointment.guestCount}</strong>
        <small>чел.</small>
      </span>
      <div className={styles.notebookEntryMain}>
        <div className={styles.notebookEntryTop}>
          <div className={styles.notebookEntryIdentity}>
            <strong>{appointment.clientName}</strong>
          </div>
          <StatusChip status={appointment.status} />
        </div>

        <div className={styles.notebookEntryFacts}>
          <span className={styles.notebookEntryFact}>
            <small className={styles.notebookEntryFactLabel}>Телефон</small>
            <span className={styles.notebookEntryFactValue}>{appointment.phone}</span>
          </span>

          <span className={styles.notebookEntryFact}>
            <small className={styles.notebookEntryFactLabel}>Тариф</small>
            <span className={styles.notebookEntryFactValue}>{getTariffSummary(appointment, true)}</span>
          </span>

          <span className={`${styles.notebookEntryFact} ${styles.notebookEntryFactWide}`}>
            <small className={styles.notebookEntryFactLabel}>Оплата</small>
            <span className={styles.notebookEntryFactValue}>{formatCurrency(appointment.totalAmount)}</span>
            <small className={styles.notebookEntryFactNote}>{paymentNote}</small>
          </span>

          {appointment.comment ? (
            <span className={`${styles.notebookEntryFact} ${styles.notebookEntryFactWide}`}>
              <small className={styles.notebookEntryFactLabel}>Комментарий</small>
              <span className={styles.notebookEntryCommentText}>{appointment.comment}</span>
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function NotebookScheduleView({ appointments, selectedDate }) {
  const { openCreateModal } = useAdmin();
  const slotGroups = useMemo(() => getDaySlotGroups(appointments, selectedDate), [appointments, selectedDate]);
  const hasAnyAppointments = slotGroups.some((slot) => slot.appointments.length > 0);

  if (!hasAnyAppointments) {
    return (
      <EmptyState
        title="На этот день записей нет"
        description="Свободны все нечетные часы. Можно сразу поставить бронь на один из слотов."
        actionLabel="Создать запись"
        onAction={() => openCreateModal()}
      />
    );
  }

  return (
    <div className={styles.notebookBoard}>
      {slotGroups.map((slot) => (
        <section
          key={slot.time}
          className={styles.notebookSlot}
          data-full={slot.isFull ? "true" : "false"}
          data-state={slot.isFull ? "full" : slot.bookedGuests ? "busy" : "empty"}
        >
          <div className={styles.notebookSlotHeader}>
            <div>
              <strong>{slot.time}</strong>
              <span>Слот на 1 час</span>
            </div>
            <div className={styles.notebookSlotCounter}>
              <strong>{slot.bookedGuests}</strong>
              <span>/ {SLOT_CAPACITY}</span>
            </div>
          </div>

          <div className={styles.notebookSlotMeta}>
            <span>
              {slot.appointments.length
                ? `${slot.appointments.length} ${slot.appointments.length === 1 ? "запись" : "записи"}`
                : "Записей нет"}
            </span>
            <span>{slot.remainingGuests} мест осталось</span>
          </div>

          <button
            className={styles.notebookAddButton}
            type="button"
            onClick={() => openCreateModal({ date: selectedDate, time: slot.time })}
          >
            Добавить запись
          </button>

          {slot.appointments.length ? (
            <div className={styles.notebookEntries}>
              {slot.appointments.map((appointment) => (
                <NotebookAppointmentRow key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <button className={styles.notebookEmpty} type="button" onClick={() => openCreateModal({ date: selectedDate, time: slot.time })}>
              Свободный час. Нажмите, чтобы добавить запись.
            </button>
          )}
        </section>
      ))}
    </div>
  );
}

function StatCard({ label, value, note, tone = "default", action = null }) {
  return (
    <div className={styles.statCard} data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
      {action ? <div className={styles.statCardAction}>{action}</div> : null}
    </div>
  );
}

function ChoiceGroup({ options, value, onChange }) {
  return (
    <div className={styles.mobileChoiceGroup}>
      {options.map((option) => (
        <button
          key={option.value}
          className={clsx(styles.choiceChip, value === option.value && styles.choiceChipActive)}
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

export function AdminDashboardPage() {
  const { appointments, openCreateModal, selectedDate } = useAdmin();
  const slotGroups = useMemo(() => getDaySlotGroups(appointments, selectedDate), [appointments, selectedDate]);
  const freeSlots = useMemo(() => getFreeSlots(appointments, selectedDate), [appointments, selectedDate]);
  const upcomingAppointments = useMemo(() => getUpcomingAppointments(appointments, 4), [appointments]);
  const recentActions = useMemo(() => getRecentActions(appointments, 4), [appointments]);
  const activeGuests = slotGroups.reduce((sum, slot) => sum + slot.bookedGuests, 0);
  const remainingGuests = slotGroups.reduce((sum, slot) => sum + slot.remainingGuests, 0);
  const newAppointments = slotGroups.reduce(
    (sum, slot) => sum + slot.appointments.filter((appointment) => appointment.status === "new").length,
    0
  );
  const dailyIncome = useMemo(() => getDayIncome(appointments, selectedDate), [appointments, selectedDate]);

  return (
    <div className={styles.pageStack}>
      <DaySwitcher />

      <div className={styles.statsGrid}>
        <StatCard label="Гостей в дне" value={activeGuests} note="Сумма гостей по всем часам" tone="info" />
        <StatCard label="Доход за день" value={formatCurrency(dailyIncome)} note="Сколько уже внесено по записям этого дня" tone="accent" />
        <StatCard label="Свободных мест" value={remainingGuests} note="Сколько ещё можно посадить в этот день" tone="success" />
        <StatCard
          label="Новых записей"
          value={newAppointments}
          note="Запросы, которые нужно подтвердить"
          tone="danger"
          action={
            <Link className={styles.statCardLink} href="/admin/appointments?status=new">
              Просмотреть
            </Link>
          }
        />
      </div>

      <div className={styles.dashboardGrid}>
        <Panel
          title="Расписание дня"
          description="Экран построен как цифровая тетрадь: нечетный час, число гостей и список записей внутри часа."
          action={
            <button className={styles.secondaryButton} type="button" onClick={() => openCreateModal()}>
              Новая запись
            </button>
          }
        >
          <NotebookScheduleView appointments={appointments} selectedDate={selectedDate} />
        </Panel>

        <div className={styles.sideColumn}>
          <Panel title="Где ещё есть места" description="Часы, в которые ещё можно добавить гостей.">
            {freeSlots.length ? (
              <div className={styles.slotGrid}>
                {freeSlots.map((slot) => (
                  <button
                    key={slot.start}
                    className={styles.slotCard}
                    type="button"
                    onClick={() => openCreateModal({ date: selectedDate, time: slot.start })}
                  >
                    <strong>{slot.start}</strong>
                    <span>{slot.remainingGuests} мест осталось</span>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="Свободных мест нет" description="Все часы дня уже заполнены." />
            )}
          </Panel>

          <Panel title="Ближайшие записи" description="Следующие гости по времени.">
            {upcomingAppointments.length ? (
              <div className={styles.sideList}>
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className={styles.sideListItem}>
                    <div>
                      <strong>{appointment.clientName}</strong>
                      <span>
                        {formatShortDate(appointment.date)} · {appointment.time} · {appointment.guestCount} чел.
                      </span>
                      <small>{getPaymentSummary(appointment)}</small>
                    </div>
                    <StatusChip status={appointment.status} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Нет ближайших записей" description="Активных визитов впереди сейчас нет." />
            )}
          </Panel>

          <Panel title="Последние действия" description="Недавние изменения по записям.">
            <div className={styles.sideList}>
              {recentActions.map((appointment) => (
                <div key={appointment.id} className={styles.sideListItem}>
                  <div>
                    <strong>{appointment.clientName}</strong>
                    <span>
                      {appointment.time} · {appointment.guestCount} чел.
                    </span>
                    <small>{getTariffSummary(appointment, true)}</small>
                  </div>
                  <small>{formatShortDate(appointment.date)}</small>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function WeekView() {
  const { appointments, openCreateModal, selectedDate, setSelectedDate } = useAdmin();
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  return (
    <div className={styles.weekGrid}>
      {weekDays.map((day) => {
        const slotGroups = getDaySlotGroups(appointments, day);

        return (
          <div key={day} className={styles.weekColumn}>
            <button type="button" className={styles.weekHeader} onClick={() => setSelectedDate(day)}>
              <strong>{formatWeekday(day)}</strong>
              <span>{formatShortDate(day)}</span>
            </button>
            <div className={styles.weekColumnBody}>
              {slotGroups.map((slot) => (
                <button
                  key={`${day}-${slot.time}`}
                  type="button"
                  className={styles.weekEvent}
                  data-tone={slot.isFull ? "danger" : slot.bookedGuests ? "success" : "muted"}
                  onClick={() => {
                    setSelectedDate(day);
                    if (!slot.appointments.length) {
                      openCreateModal({ date: day, time: slot.time });
                    }
                  }}
                >
                  <strong>{slot.time}</strong>
                  <span>{slot.bookedGuests}/{SLOT_CAPACITY} гостей</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthView() {
  const { appointments, openCreateModal, selectedDate, setSelectedDate } = useAdmin();
  const monthGrid = useMemo(() => getMonthGrid(selectedDate), [selectedDate]);
  const today = formatDateKey(new Date());

  return (
    <div className={styles.monthGrid}>
      {monthGrid.map((cell) => {
        const slotGroups = getDaySlotGroups(appointments, cell.dateKey);
        const guestsInDay = slotGroups.reduce((sum, slot) => sum + slot.bookedGuests, 0);
        const filledSlots = slotGroups.filter((slot) => slot.bookedGuests > 0).length;
        const remainingGuests = slotGroups.reduce((sum, slot) => sum + slot.remainingGuests, 0);
        const isSelected = cell.dateKey === selectedDate;
        const dayState = guestsInDay === 0 ? "empty" : remainingGuests === 0 ? "full" : "busy";

        return (
          <button
            key={cell.dateKey}
            type="button"
            className={clsx(
              styles.monthCell,
              !cell.isCurrentMonth && styles.monthCellMuted,
              isSelected && styles.monthCellSelected,
              cell.dateKey === today && styles.monthCellToday
            )}
            data-state={dayState}
            onClick={() => setSelectedDate(cell.dateKey)}
          >
            <div className={styles.monthCellHeader}>
              <strong>{parseInt(cell.dateKey.split("-")[2], 10)}</strong>
              <span>{guestsInDay} чел.</span>
            </div>
            <div className={styles.monthCellBody}>
              <span className={styles.monthAppointment} data-tone={filledSlots ? "success" : "muted"}>
                {filledSlots} из {FIXED_SLOT_TIMES.length} часов занято
              </span>
              {!filledSlots ? (
                <span className={styles.monthEmptyLabel} onClick={() => openCreateModal({ date: cell.dateKey, time: FIXED_SLOT_TIMES[0] })}>
                  Свободно
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function AdminCalendarPage() {
  const { appointments, selectedDate } = useAdmin();
  const [viewMode, setViewMode] = useState("day");

  return (
    <div className={styles.pageStack}>
      <div className={styles.calendarToolbar}>
        <DaySwitcher />
        <div className={styles.segmented}>
          {[
            { value: "day", label: "День" },
            { value: "week", label: "Неделя" },
            { value: "month", label: "Месяц" }
          ].map((mode) => (
            <button
              key={mode.value}
              className={clsx(styles.segmentedButton, viewMode === mode.value && styles.segmentedButtonActive)}
              type="button"
              onClick={() => setViewMode(mode.value)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <Panel
        title={viewMode === "month" ? formatMonthLabel(selectedDate) : formatLongDate(selectedDate)}
        description="Запись только на часы 11, 13, 15, 17 и 19. В каждом часу можно посадить максимум 13 гостей."
      >
        {viewMode === "day" ? <NotebookScheduleView appointments={appointments} selectedDate={selectedDate} /> : null}
        {viewMode === "week" ? <WeekView /> : null}
        {viewMode === "month" ? <MonthView /> : null}
      </Panel>
    </div>
  );
}

export function AdminAppointmentsPage() {
  const searchParams = useSearchParams();
  const statusFromQuery = searchParams.get("status");
  const { appointments, openCreateModal, searchQuery } = useAdmin();
  const [statusFilter, setStatusFilter] = useState(
    statusOptions.some((status) => status.value === statusFromQuery) ? statusFromQuery : "all"
  );
  const [serviceFilter, setServiceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const nextStatus = statusOptions.some((status) => status.value === statusFromQuery) ? statusFromQuery : "all";
    setStatusFilter(nextStatus);
  }, [statusFromQuery]);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
        const matchesService =
          serviceFilter === "all" || appointment.guestTickets?.some((ticket) => ticket.tariff === serviceFilter);
        const matchesDate = !dateFilter || appointment.date === dateFilter;
        const matchesQuery = matchesSearch(appointment, searchQuery);

        return matchesStatus && matchesService && matchesDate && matchesQuery;
      }),
    [appointments, dateFilter, searchQuery, serviceFilter, statusFilter]
  );

  return (
    <div className={styles.pageStack}>
      <Panel title="Фильтры" description="Быстрый срез по дате, статусу и тарифу.">
        <div className={styles.filtersBar}>
          <label className={styles.field}>
            <span>Дата</span>
            <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          </label>
          <label className={styles.field}>
            <span>Статус</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Все</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Тариф</span>
            <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}>
              <option value="all">Все</option>
              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.filterSummary}>
            <SlidersHorizontal size={16} />
            <span>Найдено: {filteredAppointments.length}</span>
          </div>
        </div>
      </Panel>

      <Panel
        title="Список записей"
        description="Все записи с часом, тарифами по гостям и оплатой."
        action={
          <button className={styles.secondaryButton} type="button" onClick={() => openCreateModal()}>
            Новая запись
          </button>
        }
      >
        {filteredAppointments.length ? (
          <div className={styles.appointmentsList}>
            {filteredAppointments.map((appointment) => {
              const slotState = getSlotCapacityState(appointments, appointment.date, appointment.time);

              return (
                <div key={appointment.id} className={styles.appointmentRow}>
                  <div className={styles.rowInfoGrid}>
                    <div className={styles.infoCell}>
                      <span>Дата</span>
                      <strong>{formatShortDate(appointment.date)}</strong>
                    </div>
                    <div className={styles.infoCell}>
                      <span>Час</span>
                      <strong>
                        {appointment.time} - {getAppointmentEnd(appointment)}
                      </strong>
                    </div>
                    <div className={styles.infoCell}>
                      <span>Клиент</span>
                      <strong>{appointment.clientName}</strong>
                      <small>{appointment.phone}</small>
                    </div>
                    <div className={styles.infoCell}>
                      <span>Гостей</span>
                      <strong>{appointment.guestCount}</strong>
                      <small>в этом часе уже {slotState.bookedGuests} чел.</small>
                    </div>
                    <div className={styles.infoCell}>
                      <span>Тариф</span>
                      <strong>{getTariffSummary(appointment, true)}</strong>
                      <small>{formatCurrency(appointment.totalAmount)}</small>
                    </div>
                    <div className={styles.infoCell}>
                      <span>Оплата</span>
                      <strong>{formatCurrency(appointment.prepaymentAmount)}</strong>
                      <small>осталось {formatCurrency(appointment.remainingAmount)}</small>
                    </div>
                    <div className={styles.infoCell}>
                      <span>Статус</span>
                      <StatusChip status={appointment.status} />
                    </div>
                  </div>
                  <AppointmentQuickActions appointment={appointment} />
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Ничего не найдено"
            description="Измените фильтры или создайте новую запись."
            actionLabel="Создать запись"
            onAction={() => openCreateModal()}
          />
        )}
      </Panel>
    </div>
  );
}

export function AdminClientsPage() {
  const { clients, openDetails, searchQuery } = useAdmin();
  const [selectedClientId, setSelectedClientId] = useState("");

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) {
      return clients;
    }

    const query = searchQuery.toLowerCase();
    return clients.filter((client) => `${client.name} ${client.phone}`.toLowerCase().includes(query));
  }, [clients, searchQuery]);

  useEffect(() => {
    if (!filteredClients.length) {
      setSelectedClientId("");
      return;
    }

    if (!filteredClients.some((client) => client.id === selectedClientId)) {
      setSelectedClientId(filteredClients[0].id);
    }
  }, [filteredClients, selectedClientId]);

  const selectedClient = filteredClients.find((client) => client.id === selectedClientId) ?? null;
  const weekAgo = parseDateOnly(shiftDate(formatDateKey(new Date()), -7));

  return (
    <div className={styles.pageStack}>
      <div className={styles.statsGrid}>
        <StatCard label="Клиентов в базе" value={clients.length} note="Формируется автоматически из записей" />
        <StatCard
          label="Активных за неделю"
          value={
            clients.filter((client) =>
              client.appointments.some((appointment) => parseDateOnly(appointment.date) >= weekAgo)
            ).length
          }
          note="Клиенты с недавней активностью"
        />
        <StatCard label="С повторами" value={clients.filter((client) => client.count > 1).length} note="Лояльная база" />
        <StatCard label="С заметками" value={clients.filter((client) => client.note).length} note="Есть контекст для менеджера" />
      </div>

      <div className={styles.clientsGrid}>
        <Panel title="Список клиентов" description="Минимальная база клиентов и их часов.">
          {filteredClients.length ? (
            <div className={styles.clientList}>
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  className={clsx(styles.clientListItem, client.id === selectedClientId && styles.clientListItemActive)}
                  onClick={() => setSelectedClientId(client.id)}
                >
                  <div className={styles.clientListTop}>
                    <div>
                      <strong>{client.name}</strong>
                      <span>{client.phone}</span>
                    </div>
                    <span className={styles.countBadge}>{client.count}</span>
                  </div>
                  <small>Последняя запись: {formatShortDate(client.lastAppointment.date)}</small>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="Клиенты пока отсутствуют" description="Первые карточки клиентов появятся после создания записей." />
          )}
        </Panel>

        <Panel title={selectedClient ? selectedClient.name : "Карточка клиента"} description="Телефон, заметка и история посещений.">
          {selectedClient ? (
            <div className={styles.clientDetail}>
              <div className={styles.clientHero}>
                <div className={styles.clientAvatar}>
                  <UserRound size={20} />
                </div>
                <div>
                  <h3>{selectedClient.name}</h3>
                  <p>{selectedClient.phone}</p>
                </div>
              </div>

              <div className={styles.noteCard}>
                <span>Заметка</span>
                <p>{selectedClient.note || "Отдельная заметка пока не добавлена."}</p>
              </div>

              <div className={styles.historyList}>
                {selectedClient.appointments.map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    className={styles.historyItem}
                    onClick={() => openDetails(appointment.id)}
                  >
                    <div>
                      <strong>
                        {formatShortDate(appointment.date)} · {appointment.time}
                      </strong>
                      <span>{appointment.guestCount} чел. · {getTariffSummary(appointment, true)}</span>
                    </div>
                    <StatusChip status={appointment.status} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="Выберите клиента" description="Справа появится история записей и краткая заметка." />
          )}
        </Panel>
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  const { resetDemoData, saveSettings, settings } = useAdmin();
  const [draft, setDraft] = useState(settings);

  const slotDurationOptions = [{ value: 60, label: "60 мин", hint: "фиксированный час" }];
  const startRouteOptions = [
    { value: "/admin/dashboard", label: "Сегодня", hint: "тетрадь дня" },
    { value: "/admin/calendar", label: "Календарь", hint: "планирование" },
    { value: "/admin/appointments", label: "Записи", hint: "все брони" }
  ];
  const timeFormatOptions = [
    { value: "24h", label: "24 часа", hint: "11:00" },
    { value: "ampm", label: "12 часов", hint: "11 AM" }
  ];

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function updateField(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    saveSettings(draft);
  }

  return (
    <div className={styles.pageStack}>
      <form className={styles.settingsGrid} onSubmit={handleSubmit}>
        <Panel title="Общие настройки" description="CRM работает по фиксированным часам: 11, 13, 15, 17 и 19. На каждый час максимум 13 гостей.">
          <div className={styles.formGrid}>
            <label className={clsx(styles.field, styles.settingField)}>
              <span>Название CRM</span>
              <small className={styles.settingHint}>Как называется админка в шапке и боковом меню.</small>
              <input value={draft.crmName} onChange={(event) => updateField("crmName", event.target.value)} />
            </label>
            <label className={clsx(styles.field, styles.settingField)}>
              <span>Название бизнеса</span>
              <small className={styles.settingHint}>Подпись для бизнеса внутри CRM.</small>
              <input value={draft.businessName} onChange={(event) => updateField("businessName", event.target.value)} />
            </label>

            <label className={clsx(styles.field, styles.settingField)}>
              <span>Длительность часа</span>
              <small className={styles.settingHint}>Запись идёт только ровно на час.</small>
              <select
                className={styles.desktopSelect}
                value={draft.slotDuration}
                onChange={(event) => updateField("slotDuration", Number(event.target.value))}
              >
                {slotDurationOptions.map((minutes) => (
                  <option key={minutes.value} value={minutes.value}>
                    {minutes.label}
                  </option>
                ))}
              </select>
              <ChoiceGroup options={slotDurationOptions} value={draft.slotDuration} onChange={(value) => updateField("slotDuration", Number(value))} />
            </label>

            <label className={clsx(styles.field, styles.settingField)}>
              <span>Стартовая вкладка</span>
              <small className={styles.settingHint}>Куда открывать CRM сразу после входа.</small>
              <select
                className={styles.desktopSelect}
                value={draft.startRoute}
                onChange={(event) => updateField("startRoute", event.target.value)}
              >
                {startRouteOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChoiceGroup options={startRouteOptions} value={draft.startRoute} onChange={(value) => updateField("startRoute", value)} />
            </label>

            <label className={clsx(styles.field, styles.settingField)}>
              <span>Формат времени</span>
              <small className={styles.settingHint}>Как показывать время в карточках и календаре.</small>
              <select
                className={styles.desktopSelect}
                value={draft.timeFormat}
                onChange={(event) => updateField("timeFormat", event.target.value)}
              >
                {timeFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChoiceGroup options={timeFormatOptions} value={draft.timeFormat} onChange={(value) => updateField("timeFormat", value)} />
            </label>

            <label className={clsx(styles.switchRow, styles.settingSwitch)}>
              <div className={styles.switchCopy}>
                <span>Тёмная тема по умолчанию</span>
                <small className={styles.settingHint}>Оставить текущий dark UI базовым режимом.</small>
              </div>
              <input
                checked={draft.darkThemeByDefault}
                type="checkbox"
                onChange={(event) => updateField("darkThemeByDefault", event.target.checked)}
              />
            </label>
          </div>
        </Panel>

        <Panel title="Демо-среда" description="Восстановить тестовые записи по часам.">
          <div className={styles.settingsActions}>
            <button className={styles.primaryButton} type="submit">
              Сохранить настройки
            </button>
            <button className={styles.secondaryButton} type="button" onClick={resetDemoData}>
              Восстановить демо-данные
            </button>
          </div>
          <div className={styles.inlineAlert} data-tone="info">
            Доступные часы фиксированы: {FIXED_SLOT_TIMES.join(", ")}. Вместимость каждого часа: {SLOT_CAPACITY} гостей.
          </div>
        </Panel>
      </form>
    </div>
  );
}

function parseDateOnly(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}
