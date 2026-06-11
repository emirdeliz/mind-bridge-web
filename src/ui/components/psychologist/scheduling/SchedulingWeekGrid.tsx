"use client";

import { type MouseEvent, useMemo } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { PsychologistAppointmentDto } from "@api";
import { Button, Icon } from "@atoms";
import { useI18n } from "@i18n";
import { Tooltip } from "@molecules";
import {
  appointmentDragId,
  combineLocalDateAndTime,
  getWeekDateKeys,
  parseAppointmentDragId,
  parseSlotId,
  slotId,
  toLocalDateKey,
  toLocalTime,
} from "@services";

type SchedulingWeekGridProps = {
  weekStart: string;
  slotTimes: string[];
  appointments: PsychologistAppointmentDto[];
  tzOffset: number;
  saving?: boolean;
  movingAppointmentId?: string | null;
  onSlotClick: (dateKey: string, time: string) => void;
  onMoveAppointment: (appointmentId: string, startsAt: string) => void | Promise<void>;
  onOpenContact: (appointment: PsychologistAppointmentDto) => void;
  onOpenAppointment: (appointment: PsychologistAppointmentDto) => void;
};

const stopBadgeAction = (event: MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();
};

type AppointmentBadgeProps = {
  appointment: PsychologistAppointmentDto;
  tzOffset: number;
  disabled?: boolean;
  onOpenContact: (appointment: PsychologistAppointmentDto) => void;
  onOpenAppointment: (appointment: PsychologistAppointmentDto) => void;
};

const AppointmentBadge = ({
  appointment,
  tzOffset,
  disabled,
  onOpenContact,
  onOpenAppointment,
}: AppointmentBadgeProps) => {
  const { t } = useI18n();
  const label =
    appointment.patientFullName?.trim() ||
    appointment.patientEmail ||
    appointment.patientId;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointmentDragId(appointment.id),
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className="mb-scheduling-badge"
      style={style}
      title={label}
    >
      <div className="mb-scheduling-badge-drag" {...listeners} {...attributes}>
        <span className="mb-scheduling-badge-name">{label}</span>
        <span className="mb-scheduling-badge-time">
          {toLocalTime(new Date(appointment.startsAt), tzOffset)}
        </span>
      </div>
      <div className="mb-scheduling-badge-actions" onPointerDown={stopBadgeAction}>
        <Tooltip title={t("PSYCHOLOGIST_SCHEDULING_BADGE_CONTACT")} top minWidth={10}>
          <span className="mb-scheduling-badge-action">
            <Button
              type="button"
              xs
              sm
              circle
              variant="secondary"
              outlined
              clickable={!disabled}
              onClick={(event) => {
                stopBadgeAction(event);
                onOpenContact(appointment);
              }}
            >
              <Icon.User sm white />
            </Button>
          </span>
        </Tooltip>
        <Tooltip title={t("PSYCHOLOGIST_SCHEDULING_BADGE_APPOINTMENT")} top minWidth={10}>
          <span className="mb-scheduling-badge-action">
            <Button
              type="button"
              xs
              sm
              circle
              variant="secondary"
              outlined
              clickable={!disabled}
              onClick={(event) => {
                stopBadgeAction(event);
                onOpenAppointment(appointment);
              }}
            >
              <Icon.Pencil sm white />
            </Button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

type SlotCellProps = {
  dateKey: string;
  time: string;
  appointment: PsychologistAppointmentDto | null;
  tzOffset: number;
  disabled?: boolean;
  onSlotClick: (dateKey: string, time: string) => void;
  onOpenContact: (appointment: PsychologistAppointmentDto) => void;
  onOpenAppointment: (appointment: PsychologistAppointmentDto) => void;
};

const SlotCell = ({
  dateKey,
  time,
  appointment,
  tzOffset,
  disabled,
  onSlotClick,
  onOpenContact,
  onOpenAppointment,
}: SlotCellProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: slotId(dateKey, time),
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`mb-scheduling-slot${isOver ? " mb-scheduling-slot-over" : ""}`}
      onClick={() => {
        if (!appointment && !disabled) {
          onSlotClick(dateKey, time);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !appointment && !disabled) {
          onSlotClick(dateKey, time);
        }
      }}
      role="button"
      tabIndex={appointment ? -1 : 0}
      aria-label={`${dateKey} ${time}`}
    >
      {appointment ? (
        <AppointmentBadge
          appointment={appointment}
          tzOffset={tzOffset}
          disabled={disabled}
          onOpenContact={onOpenContact}
          onOpenAppointment={onOpenAppointment}
        />
      ) : null}
    </div>
  );
};

const formatDayHeader = (dateKey: string, language: string): string => {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat(language, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(date);
};

export const SchedulingWeekGrid = ({
  weekStart,
  slotTimes,
  appointments,
  tzOffset,
  saving = false,
  movingAppointmentId = null,
  onSlotClick,
  onMoveAppointment,
  onOpenContact,
  onOpenAppointment,
}: SchedulingWeekGridProps) => {
  const { language } = useI18n();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const weekDateKeys = useMemo(
    () => getWeekDateKeys(weekStart, tzOffset),
    [weekStart, tzOffset],
  );

  const appointmentBySlot = useMemo(() => {
    const map = new Map<string, PsychologistAppointmentDto>();
    for (const appointment of appointments) {
      const dateKey = toLocalDateKey(new Date(appointment.startsAt), tzOffset);
      const time = toLocalTime(new Date(appointment.startsAt), tzOffset);
      map.set(slotId(dateKey, time), appointment);
    }
    return map;
  }, [appointments, tzOffset]);

  const handleDragEnd = (event: DragEndEvent) => {
    const appointmentId = parseAppointmentDragId(String(event.active.id));
    const target = event.over ? parseSlotId(String(event.over.id)) : null;
    if (!appointmentId || !target) {
      return;
    }

    const startsAt = combineLocalDateAndTime(
      target.dateKey,
      target.time,
      tzOffset,
    ).toISOString();

    void onMoveAppointment(appointmentId, startsAt);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="mb-scheduling-grid-wrap">
        <div className="mb-scheduling-grid-scroll">
          <div
            className="mb-scheduling-grid"
            style={{
              gridTemplateColumns: `4.5rem repeat(${weekDateKeys.length}, minmax(8rem, 1fr))`,
            }}
          >
            <div className="mb-scheduling-grid-corner" />
            {weekDateKeys.map((dateKey) => (
              <div key={dateKey} className="mb-scheduling-day-header">
                {formatDayHeader(dateKey, language)}
              </div>
            ))}

            {slotTimes.flatMap((time) => [
              <div key={`label-${time}`} className="mb-scheduling-time-label">
                {time}
              </div>,
            ...weekDateKeys.map((dateKey) => {
              const key = slotId(dateKey, time);
              const slotAppointment = appointmentBySlot.get(key) ?? null;
              return (
                <SlotCell
                  key={key}
                  dateKey={dateKey}
                  time={time}
                  appointment={slotAppointment}
                  tzOffset={tzOffset}
                  disabled={
                    saving ||
                    (slotAppointment !== null && movingAppointmentId === slotAppointment.id)
                  }
                  onSlotClick={onSlotClick}
                    onOpenContact={onOpenContact}
                    onOpenAppointment={onOpenAppointment}
                  />
                );
              }),
            ])}
          </div>
        </div>
      </div>
    </DndContext>
  );
};
