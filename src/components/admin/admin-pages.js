"use client";

import clsx from "clsx";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Pencil,
  Phone,
  Plus,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/components/admin/admin.module.css";
import {
  BOOKING_PREPAYMENT_PER_GUEST,
  FIXED_SLOT_TIMES,
  PUBLIC_SLOT_CAPACITY,
  expenseCategoryOptions,
  financeTypeOptions,
  formatDateKey,
  formatCurrency,
  formatLongDate,
  formatMonthLabel,
  formatShortDate,
  formatWeekday,
  getAppointmentEnd,
  getDayActivity,
  getDayExpenseBreakdown,
  getDayExpenseEntries,
  getDayExpenseTotal,
  getDayGiftOrders,
  getDayGiftRevenue,
  getDayIncome,
  getDayIncomeBreakdown,
  getDayIncomeEntries,
  getDayOnSiteIncome,
  getDayPaymentBreakdown,
  getDayPrepaymentAmount,
  getDaySlotGroups,
  getDaySourceBreakdown,
  getDayTotalIncome,
  getFreeSlots,
  getGiftCertificateSummary,
  getMonthGrid,
  getPaymentMethodLabel,
  getPaymentSummary,
  getRecentActions,
  getSlotCapacityState,
  getStatusMeta,
  getTariffSummary,
  getUpcomingAppointments,
  getWeekDays,
  HAPPY_HOUR_SLOT_TIMES,
  incomeCategoryOptions,
  isHappyHourDisabledForDate,
  isHappyHourEnabled,
  matchesGiftSearch,
  matchesFinanceSearch,
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

function Panel({ title, description, action, children, className, tone }) {
  return (
    <section className={clsx(styles.panel, className)} data-tone={tone}>
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
            <small className={styles.notebookEntryFactNote}>{getPaymentSummary(appointment)}</small>
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

function NotebookScheduleView({ appointments, selectedDate, settings, updateHappyHourDate, updateSlotReserve }) {
  const { openCreateModal } = useAdmin();
  const slotGroups = useMemo(() => getDaySlotGroups(appointments, settings, selectedDate), [appointments, selectedDate, settings]);
  const happyHourDisabled = isHappyHourDisabledForDate(settings, selectedDate);
  const happyHourSlots = HAPPY_HOUR_SLOT_TIMES.join(" и ");

  return (
    <div className={styles.notebookBoard}>
      <div className={styles.happyHourControl} data-disabled={happyHourDisabled ? "true" : "false"}>
        <div>
          <strong>Счастливый час на дату</strong>
          <span>
            {happyHourDisabled
              ? `Отключён для слотов ${happyHourSlots}. На сайте будет обычная цена.`
              : `Активен в будни для слотов ${happyHourSlots}. На сайте будет метка и скидка.`}
          </span>
        </div>
        <button
          className={happyHourDisabled ? styles.successButton : styles.warningButton}
          type="button"
          onClick={() => updateHappyHourDate(selectedDate, happyHourDisabled)}
        >
          {happyHourDisabled ? "Включить" : "Отключить"}
        </button>
      </div>

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
              <span>{isHappyHourEnabled(settings, selectedDate, slot.time) ? "Счастливый час" : "Слот на 1 час"}</span>
            </div>
            <div className={styles.notebookSlotCounter}>
              <strong>{slot.bookedGuests}</strong>
              <span>/ {slot.totalCapacity}</span>
            </div>
          </div>

          <div className={styles.notebookSlotMeta}>
            <span>{slot.appointments.length ? `${slot.appointments.length} записей` : "Записей нет"}</span>
            <span>{slot.remainingGuests} мест осталось</span>
          </div>

          <div className={styles.reserveControls}>
            <div className={styles.reserveMeta}>
              <strong>{PUBLIC_SLOT_CAPACITY} базовых</strong>
              <span>Резерв включён: {slot.enabledReserveSeats} из 2</span>
            </div>
            <div className={styles.reserveButtons}>
              <button
                className={styles.reserveButton}
                type="button"
                onClick={() => updateSlotReserve(selectedDate, slot.time, -1)}
                disabled={slot.enabledReserveSeats === 0}
              >
                <Minus size={16} />
              </button>
              <button
                className={styles.reserveButton}
                type="button"
                onClick={() => updateSlotReserve(selectedDate, slot.time, 1)}
                disabled={slot.enabledReserveSeats >= 2}
              >
                <Plus size={16} />
              </button>
            </div>
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

function ReportList({ items, emptyLabel }) {
  if (!items.length) {
    return <div className={styles.reportEmpty}>{emptyLabel}</div>;
  }

  return (
    <div className={styles.reportList}>
      {items.map((item) => (
        <div key={item.label} className={styles.reportListItem}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.note ? <small>{item.note}</small> : null}
        </div>
      ))}
    </div>
  );
}

function formatEventTime(timestamp) {
  return new Intl.DateTimeFormat("ru-RU", { timeStyle: "short" }).format(new Date(timestamp));
}

function toBreakdownItems(summary, noun) {
  return Object.entries(summary)
    .sort(([, left], [, right]) => right.amount - left.amount)
    .map(([label, meta]) => ({
      label,
      value: formatCurrency(meta.amount),
      note: `${meta.count} ${noun}`
    }));
}

function getFlowLeadLabel(summary, fallback) {
  const [topEntry] = Object.entries(summary).sort(([, left], [, right]) => right.amount - left.amount);
  return topEntry?.[0] ?? fallback;
}

function formatSignedAmount(amount, type) {
  return `${type === "expense" ? "-" : "+"}${formatCurrency(amount)}`;
}

function FinanceEntryRow({ entry, tone, onDelete }) {
  return (
    <article className={styles.financeEntry}>
      <div className={styles.financeEntryMain}>
        <div className={styles.financeEntryTop}>
          <div className={styles.financeEntryHeading}>
            <span className={styles.financeEntryTime}>{entry.time}</span>
            <strong>{entry.person || entry.title}</strong>
          </div>
          <span className={styles.financeEntryAmount} data-tone={tone}>
            {formatSignedAmount(entry.amount, tone)}
          </span>
        </div>

        <div className={styles.financeEntryBottom}>
          <strong className={styles.financeEntryTitle}>{entry.title}</strong>
          {entry.note ? <small className={styles.financeEntryNote}>{entry.note}</small> : null}
          <div className={styles.financeEntryBadges}>
            <span className={styles.financeBadge} data-tone={entry.isManual ? "manual" : "system"}>
              {entry.origin}
            </span>
            <span className={styles.financeBadge}>{entry.stream}</span>
          </div>
        </div>
      </div>

      {entry.isManual && onDelete ? (
        <button className={styles.financeDeleteButton} type="button" onClick={() => onDelete(entry.id)}>
          Удалить
        </button>
      ) : null}
    </article>
  );
}

function FinanceColumn({ action, entries, emptyLabel, onDelete, title, tone, total }) {
  return (
    <section className={styles.financeColumn} data-tone={tone}>
      <div className={styles.financeColumnHeader}>
        <div className={styles.financeColumnCopy}>
          <span className={styles.financeColumnEyebrow}>{title}</span>
          <strong>{formatSignedAmount(total, tone)}</strong>
          <small>
            {entries.length} {entries.length === 1 ? "операция" : entries.length < 5 ? "операции" : "операций"} за день
          </small>
        </div>
        {action ? (
          action.href ? (
            <Link
              className={styles.financeHeaderAction}
              href={action.href}
              aria-label={action.ariaLabel ?? action.label}
            >
              <span className={styles.financeHeaderActionIcon}>
                <Plus size={16} />
              </span>
              <span className={styles.financeHeaderActionText}>{action.label}</span>
            </Link>
          ) : (
            <button
              className={styles.financeHeaderAction}
              type="button"
              onClick={action.onClick}
              aria-label={action.ariaLabel ?? action.label}
            >
              <span className={styles.financeHeaderActionIcon}>
                <Plus size={16} />
              </span>
              <span className={styles.financeHeaderActionText}>{action.label}</span>
            </button>
          )
        ) : null}
      </div>

      {entries.length ? (
        <div className={styles.financeEntryList}>
          {entries.map((entry) => (
            <FinanceEntryRow key={entry.id} entry={entry} tone={tone} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className={styles.financeEmpty}>{emptyLabel}</div>
      )}
    </section>
  );
}

function FinanceBoard({
  expenseAction,
  expenseEntries,
  expenseTotal,
  incomeAction,
  incomeEntries,
  incomeTotal,
  onDeleteExpense,
  onDeleteIncome
}) {
  return (
    <div className={styles.financeBoard}>
      <FinanceColumn
        action={incomeAction}
        entries={incomeEntries}
        emptyLabel="Доходов по выбранному дню пока нет."
        onDelete={onDeleteIncome}
        title="Доходы"
        tone="income"
        total={incomeTotal}
      />
      <FinanceColumn
        action={expenseAction}
        entries={expenseEntries}
        emptyLabel="Расходов по выбранному дню пока нет."
        onDelete={onDeleteExpense}
        title="Расходы"
        tone="expense"
        total={expenseTotal}
      />
    </div>
  );
}

export function AdminDashboardPage() {
  const { activityLog, appointments, financeRecords, giftOrders, openCreateModal, selectedDate, settings, updateHappyHourDate, updateSlotReserve } =
    useAdmin();
  const slotGroups = useMemo(() => getDaySlotGroups(appointments, settings, selectedDate), [appointments, selectedDate, settings]);
  const freeSlots = useMemo(() => getFreeSlots(appointments, settings, selectedDate), [appointments, selectedDate, settings]);
  const upcomingAppointments = useMemo(() => getUpcomingAppointments(appointments, 4), [appointments]);
  const recentActions = useMemo(() => getRecentActions(appointments, 4), [appointments]);
  const activeGuests = slotGroups.reduce((sum, slot) => sum + slot.bookedGuests, 0);
  const remainingGuests = slotGroups.reduce((sum, slot) => sum + slot.remainingGuests, 0);
  const newAppointments = slotGroups.reduce(
    (sum, slot) => sum + slot.appointments.filter((appointment) => appointment.status === "new").length,
    0
  );
  const dayPrepayment = useMemo(() => getDayPrepaymentAmount(appointments, selectedDate), [appointments, selectedDate]);
  const dayOnSiteIncome = useMemo(() => getDayOnSiteIncome(appointments, selectedDate), [appointments, selectedDate]);
  const dayGiftSales = useMemo(() => getDayGiftOrders(giftOrders, selectedDate), [giftOrders, selectedDate]);
  const dayGiftRevenue = useMemo(() => getDayGiftRevenue(giftOrders, selectedDate), [giftOrders, selectedDate]);
  const incomeEntries = useMemo(
    () => getDayIncomeEntries(appointments, giftOrders, financeRecords, selectedDate),
    [appointments, financeRecords, giftOrders, selectedDate]
  );
  const expenseEntries = useMemo(() => getDayExpenseEntries(financeRecords, selectedDate), [financeRecords, selectedDate]);
  const totalIncome = useMemo(
    () => getDayTotalIncome(appointments, giftOrders, financeRecords, selectedDate),
    [appointments, financeRecords, giftOrders, selectedDate]
  );
  const totalExpenses = useMemo(() => getDayExpenseTotal(financeRecords, selectedDate), [financeRecords, selectedDate]);
  const netIncome = totalIncome - totalExpenses;
  const manualIncome = Math.max(0, totalIncome - dayPrepayment - dayOnSiteIncome - dayGiftRevenue);
  const incomeBreakdown = useMemo(
    () => getDayIncomeBreakdown(appointments, giftOrders, financeRecords, selectedDate),
    [appointments, financeRecords, giftOrders, selectedDate]
  );
  const expenseBreakdown = useMemo(() => getDayExpenseBreakdown(financeRecords, selectedDate), [financeRecords, selectedDate]);
  const dayActivity = useMemo(() => getDayActivity(activityLog, selectedDate), [activityLog, selectedDate]);

  const incomeRows = useMemo(() => toBreakdownItems(incomeBreakdown, "поступл."), [incomeBreakdown]);
  const expenseRows = useMemo(() => toBreakdownItems(expenseBreakdown, "спис."), [expenseBreakdown]);

  const activityRows = useMemo(
    () =>
      dayActivity.slice(0, 8).map((entry) => ({
        label: `${formatEventTime(entry.timestamp)} · ${entry.message}`,
        value: entry.relatedTime || "CRM"
      })),
    [dayActivity]
  );
  const bookedSlotsCount = slotGroups.filter((slot) => slot.appointments.length).length;

  return (
    <div className={styles.pageStack}>
      <DaySwitcher />

      <div className={clsx(styles.statsGrid, styles.dashboardStatsGrid)}>
        <StatCard
          label="Гости и записи"
          value={`${activeGuests} чел.`}
          note={`${newAppointments} новых · ${bookedSlotsCount} часов занято`}
          tone="info"
        />
        <StatCard
          label="Доходы дня"
          value={formatCurrency(totalIncome)}
          note={`Сайт ${formatCurrency(dayPrepayment + dayGiftRevenue)} · на месте ${formatCurrency(dayOnSiteIncome)} · ручной ${formatCurrency(manualIncome)}`}
          tone="accent"
        />
        <StatCard
          label="Расходы дня"
          value={formatCurrency(totalExpenses)}
          note={expenseEntries.length ? `Главное списание: ${getFlowLeadLabel(expenseBreakdown, "без категорий")}` : "Расходов пока нет"}
          tone="danger"
        />
        <StatCard
          label="Чистый итог"
          value={formatCurrency(netIncome)}
          note={`Доходов ${incomeEntries.length} · расходов ${expenseEntries.length}`}
          tone={netIncome >= 0 ? "success" : "danger"}
          action={
            <Link className={styles.statCardLink} href="/admin/finance">
              Открыть финансы
            </Link>
          }
        />
      </div>

      <Panel
        title="Денежный поток дня"
        description="Слева все поступления по дню, справа все расходы. Отсюда видно, откуда деньги пришли и куда ушли."
        action={
          <Link className={styles.secondaryButton} href="/admin/finance">
            Открыть финансы
          </Link>
        }
      >
        <FinanceBoard
          expenseAction={{
            href: "/admin/finance?type=expense#finance-form",
            label: "Добавить запись",
            ariaLabel: "Добавить расход"
          }}
          expenseEntries={expenseEntries}
          expenseTotal={totalExpenses}
          incomeAction={{
            href: "/admin/finance?type=income#finance-form",
            label: "Добавить запись",
            ariaLabel: "Добавить доход"
          }}
          incomeEntries={incomeEntries}
          incomeTotal={totalIncome}
        />
      </Panel>

      <div className={styles.dashboardGrid}>
        <Panel
          title="Расписание дня"
          description="12 мест открыты всегда, ещё 2 резервных места можно включать вручную по одному."
          action={
            <button className={styles.secondaryButton} type="button" onClick={() => openCreateModal()}>
              Новая запись
            </button>
          }
        >
          <NotebookScheduleView
            appointments={appointments}
            selectedDate={selectedDate}
            settings={settings}
            updateHappyHourDate={updateHappyHourDate}
            updateSlotReserve={updateSlotReserve}
          />
        </Panel>

        <div className={styles.dashboardSideGrid}>
          <Panel
            className={styles.dashboardSideSpanWide}
            title="Итоги дня"
            description="Быстрый разбор доходов, расходов и изменений по выбранной дате."
            tone="summary"
          >
            <div className={clsx(styles.reportGrid, styles.dashboardSummaryGrid)}>
              <div className={styles.reportCard} data-tone="income">
                <div className={styles.reportCardHeader}>
                  <span className={styles.reportTitle}>Источники дохода</span>
                  <strong className={styles.reportCardValue}>{formatCurrency(totalIncome)}</strong>
                </div>
                <p className={styles.reportLead}>Лидер дня: {getFlowLeadLabel(incomeBreakdown, "пока пусто")}</p>
                <ReportList items={incomeRows} emptyLabel="Поступлений по выбранному дню пока нет." />
              </div>
              <div className={styles.reportCard} data-tone="expense">
                <div className={styles.reportCardHeader}>
                  <span className={styles.reportTitle}>Категории расходов</span>
                  <strong className={styles.reportCardValue}>{formatCurrency(totalExpenses)}</strong>
                </div>
                <p className={styles.reportLead}>
                  Главное списание: {getFlowLeadLabel(expenseBreakdown, "пока без категорий")}
                </p>
                <ReportList items={expenseRows} emptyLabel="Списаний по выбранному дню пока нет." />
              </div>
              <div className={styles.reportCard} data-tone="activity">
                <div className={styles.reportCardHeader}>
                  <span className={styles.reportTitle}>Изменения по дню</span>
                  <strong className={styles.reportCardValue}>{dayActivity.length}</strong>
                </div>
                <p className={styles.reportLead}>
                  {dayActivity.length
                    ? "Последние действия менеджера и автоматические обновления по этой дате."
                    : "По выбранной дате пока не было изменений."}
                </p>
                <ReportList items={activityRows} emptyLabel="Изменений по этому дню пока не было." />
              </div>
            </div>
          </Panel>

          <Panel
            className={styles.dashboardMiniPanel}
            title="Продажи сертификатов"
            description="Полностью оплаченные сертификаты за выбранный день."
            tone="gift"
          >
            <div className={styles.dashboardPanelMeta}>
              <span>{dayGiftSales.length} продаж за день</span>
              <strong>{formatCurrency(dayGiftRevenue)}</strong>
            </div>
            {dayGiftSales.length ? (
              <div className={styles.sideList}>
                {dayGiftSales.map((order) => (
                  <div key={order.id} className={styles.sideListItem} data-card="gift">
                    <div>
                      <strong>{order.purchaserName}</strong>
                      <span>
                        {order.purchaseTime} · {order.recipientName}
                      </span>
                      <small>{getGiftCertificateSummary(order)}</small>
                    </div>
                    <div className={styles.sideListItemAside}>
                      <strong>{formatCurrency(order.amount)}</strong>
                      <small>{order.deliveryMethod}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Продаж сертификатов нет" description="В выбранный день полных онлайн-оплат по сертификатам пока не было." />
            )}
          </Panel>

          <Panel
            className={styles.dashboardMiniPanel}
            title="Где ещё есть места"
            description="Слоты, в которые ещё можно добавить гостей."
            tone="availability"
          >
            <div className={styles.dashboardPanelMeta}>
              <span>Свободных слотов: {freeSlots.length}</span>
              <strong>{remainingGuests} мест</strong>
            </div>
            {freeSlots.length ? (
              <div className={styles.slotGrid}>
                {freeSlots.map((slot) => (
                  <button
                    key={slot.start}
                    className={styles.slotCard}
                    data-state={slot.remainingGuests >= 8 ? "open" : slot.remainingGuests >= 4 ? "busy" : "limited"}
                    type="button"
                    onClick={() => openCreateModal({ date: selectedDate, time: slot.start })}
                  >
                    <strong>{slot.start}</strong>
                    <span>{slot.remainingGuests} мест осталось</span>
                    <small>{slot.enabledReserveSeats ? `Резерв активирован: ${slot.enabledReserveSeats}` : "Резерв скрыт"}</small>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="Свободных мест нет" description="Все часы дня уже заполнены." />
            )}
          </Panel>

          <Panel
            className={styles.dashboardMiniPanel}
            title="Ближайшие записи"
            description="Следующие гости по времени."
            tone="upcoming"
          >
            <div className={styles.dashboardPanelMeta}>
              <span>Следующие визиты</span>
              <strong>{upcomingAppointments.length}</strong>
            </div>
            {upcomingAppointments.length ? (
              <div className={styles.sideList}>
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className={styles.sideListItem} data-card="upcoming">
                    <div>
                      <strong>{appointment.clientName}</strong>
                      <span>
                        {formatShortDate(appointment.date)} · {appointment.time} · {appointment.guestCount} чел.
                      </span>
                      <small>{getPaymentSummary(appointment)}</small>
                    </div>
                    <div className={styles.sideListItemAside}>
                      <StatusChip status={appointment.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Нет ближайших записей" description="Активных визитов впереди сейчас нет." />
            )}
          </Panel>

          <Panel
            className={styles.dashboardMiniPanel}
            title="Последние действия по броням"
            description="Недавние изменения в основных записях."
            tone="activity"
          >
            <div className={styles.dashboardPanelMeta}>
              <span>Последние обновления</span>
              <strong>{recentActions.length}</strong>
            </div>
            {recentActions.length ? (
              <div className={styles.sideList}>
                {recentActions.map((appointment) => (
                  <div key={appointment.id} className={styles.sideListItem} data-card="activity">
                    <div>
                      <strong>{appointment.clientName}</strong>
                      <span>
                        {appointment.time} · {appointment.guestCount} чел.
                      </span>
                      <small>{getTariffSummary(appointment, true)}</small>
                    </div>
                    <div className={styles.sideListItemAside}>
                      <small>{formatShortDate(appointment.date)}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Действий пока нет" description="Последние изменения по броням появятся здесь автоматически." />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function WeekView() {
  const { appointments, openCreateModal, selectedDate, setSelectedDate, settings } = useAdmin();
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  return (
    <div className={styles.weekGrid}>
      {weekDays.map((day) => {
        const slotGroups = getDaySlotGroups(appointments, settings, day);

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
                  <span>
                    {slot.bookedGuests}/{slot.totalCapacity} гостей
                  </span>
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
  const { appointments, openCreateModal, selectedDate, setSelectedDate, settings } = useAdmin();
  const monthGrid = useMemo(() => getMonthGrid(selectedDate), [selectedDate]);
  const today = formatDateKey(new Date());

  return (
    <div className={styles.monthGrid}>
      {monthGrid.map((cell) => {
        const slotGroups = getDaySlotGroups(appointments, settings, cell.dateKey);
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
  const { selectedDate } = useAdmin();
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
        description="Часы фиксированы: 11, 13, 15, 17 и 19. База — 12 гостей, ещё 2 места можно открыть как резерв."
      >
        {viewMode === "day" ? <NotebookScheduleViewWrapper /> : null}
        {viewMode === "week" ? <WeekView /> : null}
        {viewMode === "month" ? <MonthView /> : null}
      </Panel>
    </div>
  );
}

function NotebookScheduleViewWrapper() {
  const { appointments, selectedDate, settings, updateHappyHourDate, updateSlotReserve } = useAdmin();

  return (
    <NotebookScheduleView
      appointments={appointments}
      selectedDate={selectedDate}
      settings={settings}
      updateHappyHourDate={updateHappyHourDate}
      updateSlotReserve={updateSlotReserve}
    />
  );
}

function getCurrentTimeValue() {
  const now = new Date();
  return `${`${now.getHours()}`.padStart(2, "0")}:${`${now.getMinutes()}`.padStart(2, "0")}`;
}

function createFinanceDraft(dateKey, type = "income") {
  const nextType = financeTypeOptions.some((option) => option.value === type) ? type : financeTypeOptions[0].value;

  return {
    id: "",
    type: nextType,
    date: dateKey,
    time: getCurrentTimeValue(),
    title: "",
    person: "",
    category: nextType === "expense" ? expenseCategoryOptions[0] : incomeCategoryOptions[0],
    amount: "",
    note: ""
  };
}

export function AdminFinancePage() {
  const searchParams = useSearchParams();
  const { appointments, deleteFinanceRecord, financeRecords, giftOrders, saveFinanceRecord, searchQuery, selectedDate } = useAdmin();
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [draft, setDraft] = useState(() => createFinanceDraft(formatDateKey(new Date())));
  const [formError, setFormError] = useState("");
  const formAnchorRef = useRef(null);
  const typeFromQuery = searchParams.get("type");

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      date: selectedDate
    }));
  }, [selectedDate]);

  useEffect(() => {
    if (!financeTypeOptions.some((option) => option.value === typeFromQuery)) {
      return;
    }

    setDraft((current) => ({
      ...current,
      type: typeFromQuery,
      category: typeFromQuery === "expense" ? expenseCategoryOptions[0] : incomeCategoryOptions[0]
    }));
  }, [typeFromQuery]);

  const incomeEntriesAll = useMemo(
    () => getDayIncomeEntries(appointments, giftOrders, financeRecords, selectedDate),
    [appointments, financeRecords, giftOrders, selectedDate]
  );
  const expenseEntriesAll = useMemo(() => getDayExpenseEntries(financeRecords, selectedDate), [financeRecords, selectedDate]);
  const incomeEntries = useMemo(
    () => incomeEntriesAll.filter((entry) => matchesFinanceSearch(entry, deferredSearchQuery)),
    [deferredSearchQuery, incomeEntriesAll]
  );
  const expenseEntries = useMemo(
    () => expenseEntriesAll.filter((entry) => matchesFinanceSearch(entry, deferredSearchQuery)),
    [deferredSearchQuery, expenseEntriesAll]
  );
  const totalIncome = useMemo(
    () => getDayTotalIncome(appointments, giftOrders, financeRecords, selectedDate),
    [appointments, financeRecords, giftOrders, selectedDate]
  );
  const totalExpenses = useMemo(() => getDayExpenseTotal(financeRecords, selectedDate), [financeRecords, selectedDate]);
  const netIncome = totalIncome - totalExpenses;
  const incomeBreakdownItems = useMemo(
    () => toBreakdownItems(getDayIncomeBreakdown(appointments, giftOrders, financeRecords, selectedDate), "поступл."),
    [appointments, financeRecords, giftOrders, selectedDate]
  );
  const expenseBreakdownItems = useMemo(
    () => toBreakdownItems(getDayExpenseBreakdown(financeRecords, selectedDate), "спис."),
    [financeRecords, selectedDate]
  );
  const manualOperationCount = incomeEntriesAll.filter((entry) => entry.isManual).length + expenseEntriesAll.filter((entry) => entry.isManual).length;
  const systemIncomeCount = incomeEntriesAll.filter((entry) => !entry.isManual).length;
  const categoryOptions = draft.type === "expense" ? expenseCategoryOptions : incomeCategoryOptions;

  function updateDraft(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleTypeChange(nextType) {
    setDraft((current) => ({
      ...current,
      type: nextType,
      category: nextType === "expense" ? expenseCategoryOptions[0] : incomeCategoryOptions[0]
    }));
    setFormError("");
  }

  function openFinanceForm(nextType) {
    handleTypeChange(nextType);
    formAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!draft.title.trim()) {
      setFormError("Укажите, что это за операция.");
      return;
    }

    if (!Number(draft.amount)) {
      setFormError("Укажите сумму больше 0 ₽.");
      return;
    }

    saveFinanceRecord({
      ...draft,
      date: selectedDate,
      amount: Number(draft.amount)
    });
    setDraft(createFinanceDraft(selectedDate, draft.type));
    setFormError("");
  }

  return (
    <div className={styles.pageStack}>
      <DaySwitcher />

      <div className={styles.statsGrid}>
        <StatCard label="Выручка дня" value={formatCurrency(totalIncome)} note={`Автоматически ${systemIncomeCount} поступл. · ручных ${manualOperationCount}`} tone="accent" />
        <StatCard label="Расходы дня" value={formatCurrency(totalExpenses)} note={expenseEntriesAll.length ? getFlowLeadLabel(getDayExpenseBreakdown(financeRecords, selectedDate), "без категорий") : "Расходов нет"} tone="danger" />
        <StatCard label="Чистый итог" value={formatCurrency(netIncome)} note="Доходы минус расходы за выбранную дату" tone={netIncome >= 0 ? "success" : "danger"} />
        <StatCard
          label="Операции в дне"
          value={incomeEntriesAll.length + expenseEntriesAll.length}
          note={`${incomeEntriesAll.length} поступлений · ${expenseEntriesAll.length} списаний`}
          tone="info"
        />
      </div>

      <div id="finance-form" ref={formAnchorRef}>
        <Panel title="Новая операция" description="Добавьте ручной доход или расход. Запись сразу попадёт в итоги дня и в историю CRM.">
          <form className={styles.financeForm} onSubmit={handleSubmit}>
            <div className={styles.segmented}>
              {financeTypeOptions.map((option) => (
                <button
                  key={option.value}
                  className={clsx(styles.segmentedButton, draft.type === option.value && styles.segmentedButtonActive)}
                  type="button"
                  onClick={() => handleTypeChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className={styles.financeFormGrid}>
              <label className={styles.field}>
                <span>Время</span>
                <input type="time" value={draft.time} onChange={(event) => updateDraft("time", event.target.value)} />
              </label>

              <label className={styles.field}>
                <span>Категория</span>
                <select value={draft.category} onChange={(event) => updateDraft("category", event.target.value)}>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={clsx(styles.field, styles.financeFieldWide)}>
                <span>Что это за операция</span>
                <input
                  placeholder={draft.type === "expense" ? "Например, зарплата администратора" : "Например, доплата за праздник"}
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>{draft.type === "expense" ? "Кому ушли деньги" : "От кого деньги"}</span>
                <input
                  placeholder={draft.type === "expense" ? "Сотрудник или поставщик" : "Клиент или контакт"}
                  value={draft.person}
                  onChange={(event) => updateDraft("person", event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>Сумма</span>
                <input
                  min="0"
                  step="100"
                  type="number"
                  value={draft.amount}
                  onChange={(event) => updateDraft("amount", event.target.value)}
                />
              </label>

              <label className={clsx(styles.field, styles.financeFieldWide)}>
                <span>Комментарий</span>
                <textarea
                  rows={3}
                  placeholder="Коротко поясните, что это за доход или расход."
                  value={draft.note}
                  onChange={(event) => updateDraft("note", event.target.value)}
                />
              </label>
            </div>

            {formError ? <div className={styles.inlineAlert} data-tone="danger">{formError}</div> : null}

            <div className={styles.financeFormFooter}>
              <span className={styles.financeFormHint}>Операция будет записана на {formatLongDate(selectedDate)}.</span>
              <button className={styles.primaryButton} type="submit">
                <Plus size={18} />
                <span>{draft.type === "expense" ? "Добавить расход" : "Добавить доход"}</span>
              </button>
            </div>
          </form>
        </Panel>
      </div>

      <Panel title="Итоги дня" description="Слева все доходы, справа все расходы. Для ручных операций доступно быстрое удаление.">
        <FinanceBoard
          expenseAction={{
            label: "Добавить запись",
            ariaLabel: "Добавить расход",
            onClick: () => openFinanceForm("expense")
          }}
          expenseEntries={expenseEntries}
          expenseTotal={totalExpenses}
          incomeAction={{
            label: "Добавить запись",
            ariaLabel: "Добавить доход",
            onClick: () => openFinanceForm("income")
          }}
          incomeEntries={incomeEntries}
          incomeTotal={totalIncome}
          onDeleteExpense={deleteFinanceRecord}
          onDeleteIncome={deleteFinanceRecord}
        />
      </Panel>

      <Panel title="Откуда деньги пришли и куда ушли" description="Крупные источники поступлений и категории расходов за день.">
        <div className={styles.reportGrid}>
          <div className={styles.reportCard}>
            <span className={styles.reportTitle}>Источники дохода</span>
            <ReportList items={incomeBreakdownItems} emptyLabel="Поступлений по выбранному дню пока нет." />
          </div>
          <div className={styles.reportCard}>
            <span className={styles.reportTitle}>Категории расходов</span>
            <ReportList items={expenseBreakdownItems} emptyLabel="Расходов по выбранному дню пока нет." />
          </div>
        </div>
      </Panel>
    </div>
  );
}

function GiftOrderRow({ order }) {
  return (
    <div className={styles.appointmentRow}>
      <div className={styles.rowInfoGrid}>
        <div className={styles.infoCell}>
          <span>Дата</span>
          <strong>{formatShortDate(order.purchaseDate)}</strong>
        </div>
        <div className={styles.infoCell}>
          <span>Время</span>
          <strong>{order.purchaseTime}</strong>
        </div>
        <div className={styles.infoCell}>
          <span>Покупатель</span>
          <strong>{order.purchaserName}</strong>
          <small>{order.purchaserPhone}</small>
        </div>
        <div className={styles.infoCell}>
          <span>Получатель</span>
          <strong>{order.recipientName}</strong>
          <small>{order.deliveryMethod}</small>
        </div>
        <div className={styles.infoCell}>
          <span>Сертификат</span>
          <strong>{order.certificateTitle}</strong>
          <small>{formatCurrency(order.amount)}</small>
        </div>
        <div className={styles.infoCell}>
          <span>Оплата</span>
          <strong>{formatCurrency(order.amount)}</strong>
          <small>{getPaymentMethodLabel(order.paymentMethod)}</small>
        </div>
      </div>
    </div>
  );
}

export function AdminAppointmentsPage() {
  const searchParams = useSearchParams();
  const statusFromQuery = searchParams.get("status");
  const { appointments, giftOrders, openCreateModal, searchQuery, settings } = useAdmin();
  const deferredSearchQuery = useDeferredValue(searchQuery);
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
        const matchesQuery = matchesSearch(appointment, deferredSearchQuery);

        return matchesStatus && matchesService && matchesDate && matchesQuery;
      }),
    [appointments, dateFilter, deferredSearchQuery, serviceFilter, statusFilter]
  );

  const filteredGiftOrders = useMemo(
    () =>
      giftOrders.filter((order) => {
        const matchesDate = !dateFilter || order.purchaseDate === dateFilter;
        const matchesQuery = matchesGiftSearch(order, deferredSearchQuery);
        return matchesDate && matchesQuery;
      }),
    [dateFilter, deferredSearchQuery, giftOrders]
  );

  return (
    <div className={styles.pageStack}>
      <Panel title="Фильтры" description="Быстрый срез по дате, статусу, тарифу и поиску.">
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
            <span>
              Брони: {filteredAppointments.length} · сертификаты: {filteredGiftOrders.length}
            </span>
          </div>
        </div>
      </Panel>

      <Panel
        title="Список записей"
        description="Все брони с часом, тарифами, предоплатой на сайте и оплатой на месте."
        action={
          <button className={styles.secondaryButton} type="button" onClick={() => openCreateModal()}>
            Новая запись
          </button>
        }
      >
        {filteredAppointments.length ? (
          <div className={styles.appointmentsList}>
            {filteredAppointments.map((appointment) => {
              const slotState = getSlotCapacityState(appointments, settings, appointment.date, appointment.time);

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
                      <small>
                        в слоте {slotState.bookedGuests}/{slotState.totalCapacity}
                      </small>
                    </div>
                    <div className={styles.infoCell}>
                      <span>Тариф</span>
                      <strong>{getTariffSummary(appointment, true)}</strong>
                      <small>{formatCurrency(appointment.totalAmount)}</small>
                    </div>
                    <div className={styles.infoCell}>
                      <span>Оплата</span>
                      <strong>{formatCurrency(appointment.prepaymentAmount)}</strong>
                      <small>
                        на месте {formatCurrency(appointment.onSitePaymentAmount)} · осталось {formatCurrency(appointment.remainingAmount)}
                      </small>
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

      <Panel title="Подарочные сертификаты" description="Полностью оплаченные заказы с сайта.">
        {filteredGiftOrders.length ? (
          <div className={styles.appointmentsList}>
            {filteredGiftOrders.map((order) => (
              <GiftOrderRow key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState title="Сертификатов не найдено" description="Заказы по сертификатам появятся здесь после полной оплаты на сайте." />
        )}
      </Panel>
    </div>
  );
}

export function AdminClientsPage() {
  const { clients, openDetails, searchQuery } = useAdmin();
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedClientId, setSelectedClientId] = useState("");

  const filteredClients = useMemo(() => {
    if (!deferredSearchQuery.trim()) {
      return clients;
    }

    const query = deferredSearchQuery.toLowerCase();
    return clients.filter((client) => `${client.name} ${client.phone} ${client.email ?? ""}`.toLowerCase().includes(query));
  }, [clients, deferredSearchQuery]);

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
          value={clients.filter((client) => client.appointments.some((appointment) => parseDateOnly(appointment.date) >= weekAgo)).length}
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
                  {selectedClient.email ? <p>{selectedClient.email}</p> : null}
                </div>
              </div>

              <div className={styles.noteCard}>
                <span>Заметка</span>
                <p>{selectedClient.note || "Отдельная заметка пока не добавлена."}</p>
              </div>

              <div className={styles.historyList}>
                {selectedClient.appointments.map((appointment) => (
                  <button key={appointment.id} type="button" className={styles.historyItem} onClick={() => openDetails(appointment.id)}>
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
    { value: "/admin/appointments", label: "Записи", hint: "все брони" },
    { value: "/admin/finance", label: "Финансы", hint: "деньги и расходы" }
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
        <Panel
          title="Общие настройки"
          description="CRM работает по фиксированным часам: 11, 13, 15, 17 и 19. В каждом слоте 12 базовых мест и до 2 резервных."
        >
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

        <Panel title="Демо-среда" description="Восстановить тестовые записи по часам и продажи сертификатов.">
          <div className={styles.settingsActions}>
            <button className={styles.primaryButton} type="submit">
              Сохранить настройки
            </button>
            <button className={styles.secondaryButton} type="button" onClick={resetDemoData}>
              Восстановить демо-данные
            </button>
          </div>
          <div className={styles.inlineAlert} data-tone="info">
            Доступные часы фиксированы: {FIXED_SLOT_TIMES.join(", ")}. Базовая вместимость каждого часа: {PUBLIC_SLOT_CAPACITY} гостей + 2 резервных места.
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
