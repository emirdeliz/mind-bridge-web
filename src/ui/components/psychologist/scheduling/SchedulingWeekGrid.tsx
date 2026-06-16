'use client';

import { type MouseEvent, useMemo } from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import type { PsychologistAppointmentDto } from '@api';
import { Button, Icon } from '@atoms';
import { useI18n } from '@i18n';
import { Tooltip } from '@molecules';
import {
  appointmentDragId,
  combineLocalDateAndTime,
  getAppointmentSlotCoverage,
  getWeekDateKeys,
  parseAppointmentDragId,
  parseSlotId,
  slotId,
  toLocalTime,
} from '@services';

type SlotAppointmentView = {
  appointment: PsychologistAppointmentDto;
  variant: 'start' | 'continuation';
};

type SchedulingWeekGridProps = {
  weekStart: string;
  slotTimes: string[];
  sessionDurationMinutes: number;
  appointments: PsychologistAppointmentDto[];
  tzOffset: number;
  saving?: boolean;
  movingAppointmentId?: string | null;
  onSlotClick: (dateKey: string, time: string) => void;
  onMoveAppointment: (
    appointmentId: string,
    startsAt: string
  ) => void | Promise<void>;
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
  variant: 'start' | 'continuation';
  disabled?: boolean;
  onOpenContact: (appointment: PsychologistAppointmentDto) => void;
  onOpenAppointment: (appointment: PsychologistAppointmentDto) => void;
};

const AppointmentBadge = ({
  appointment,
  tzOffset,
  variant,
  disabled,
  onOpenContact,
  onOpenAppointment,
}: AppointmentBadgeProps) => {
  const { t } = useI18n();
  const label = appointment.isPersonalCommitment
    ? appointment.notes?.trim() ||
      t('PSYCHOLOGIST_SCHEDULING_PERSONAL_COMMITMENT')
    : appointment.patientFullName?.trim() ||
      appointment.patientEmail ||
      appointment.patientId ||
      '';
  const startTime = toLocalTime(new Date(appointment.startsAt), tzOffset);
  const endTime = toLocalTime(
    new Date(
      new Date(appointment.startsAt).getTime() +
        appointment.durationMinutes * 60_000
    ),
    tzOffset
  );
  const timeLabel = appointment.isPersonalCommitment
    ? `${startTime} – ${endTime}`
    : startTime;

  const personalBadgeContent = (
    <>
      <span className='mb-scheduling-badge-name'>{label}</span>
      <span className='mb-scheduling-badge-time'>{timeLabel}</span>
    </>
  );

  if (variant === 'continuation') {
    if (!appointment.isPersonalCommitment) {
      return (
        <div
          className='mb-scheduling-badge mb-scheduling-badge-continuation'
          title={label}
          aria-hidden='true'
        />
      );
    }

    return (
      <div
        className='mb-scheduling-badge mb-scheduling-badge-personal mb-scheduling-badge-continuation-personal'
        title={`${label} · ${timeLabel}`}
      >
        <div className='mb-scheduling-badge-continuation-content'>
          {personalBadgeContent}
        </div>
      </div>
    );
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: appointmentDragId(appointment.id),
      disabled,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.65 : 1,
  };

  const badgeClassName = appointment.isPersonalCommitment
    ? 'mb-scheduling-badge mb-scheduling-badge-personal'
    : 'mb-scheduling-badge';

  return (
    <div
      ref={setNodeRef}
      className={badgeClassName}
      style={style}
      title={label}
    >
      <div className='mb-scheduling-badge-drag' {...listeners} {...attributes}>
        {appointment.isPersonalCommitment ? (
          personalBadgeContent
        ) : (
          <>
            <span className='mb-scheduling-badge-name'>{label}</span>
            <span className='mb-scheduling-badge-time'>{timeLabel}</span>
          </>
        )}
      </div>
      <div
        className='mb-scheduling-badge-actions'
        onPointerDown={stopBadgeAction}
      >
        {!appointment.isPersonalCommitment ? (
          <Tooltip
            title={t('PSYCHOLOGIST_SCHEDULING_BADGE_CONTACT')}
            top
            minWidth={10}
          >
            <span className='mb-scheduling-badge-action'>
              <Button
                type='button'
                xs
                sm
                circle
                variant='secondary'
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
        ) : null}
        <Tooltip
          title={t('PSYCHOLOGIST_SCHEDULING_BADGE_APPOINTMENT')}
          top
          minWidth={10}
        >
          <span className='mb-scheduling-badge-action'>
            <Button
              type='button'
              xs
              sm
              circle
              variant='secondary'
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
  slotView: SlotAppointmentView | null;
  tzOffset: number;
  disabled?: boolean;
  onSlotClick: (dateKey: string, time: string) => void;
  onOpenContact: (appointment: PsychologistAppointmentDto) => void;
  onOpenAppointment: (appointment: PsychologistAppointmentDto) => void;
};

const SlotCell = ({
  dateKey,
  time,
  slotView,
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

  const occupied = slotView !== null;

  return (
    <div
      ref={setNodeRef}
      className={`mb-scheduling-slot${isOver ? ' mb-scheduling-slot-over' : ''}${occupied ? ' mb-scheduling-slot-occupied' : ''}`}
      onClick={() => {
        if (!occupied && !disabled) {
          onSlotClick(dateKey, time);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !occupied && !disabled) {
          onSlotClick(dateKey, time);
        }
      }}
      role='button'
      tabIndex={occupied ? -1 : 0}
      aria-label={`${dateKey} ${time}`}
    >
      {slotView ? (
        <AppointmentBadge
          appointment={slotView.appointment}
          variant={slotView.variant}
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
  const [year, month, day] = dateKey.split('-').map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat(language, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(date);
};

export const SchedulingWeekGrid = ({
  weekStart,
  slotTimes,
  sessionDurationMinutes,
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const weekDateKeys = useMemo(
    () => getWeekDateKeys(weekStart, tzOffset),
    [weekStart, tzOffset]
  );

  const appointmentBySlot = useMemo(() => {
    const map = new Map<string, SlotAppointmentView>();

    for (const appointment of appointments) {
      for (const dateKey of weekDateKeys) {
        const coverage = getAppointmentSlotCoverage(
          appointment,
          dateKey,
          slotTimes,
          sessionDurationMinutes,
          tzOffset
        );

        for (const { slotTime, isStart } of coverage) {
          map.set(slotId(dateKey, slotTime), {
            appointment,
            variant: isStart ? 'start' : 'continuation',
          });
        }
      }
    }

    return map;
  }, [appointments, sessionDurationMinutes, slotTimes, tzOffset, weekDateKeys]);

  const handleDragEnd = (event: DragEndEvent) => {
    const appointmentId = parseAppointmentDragId(String(event.active.id));
    const target = event.over ? parseSlotId(String(event.over.id)) : null;
    if (!appointmentId || !target) {
      return;
    }

    const startsAt = combineLocalDateAndTime(
      target.dateKey,
      target.time,
      tzOffset
    ).toISOString();

    void onMoveAppointment(appointmentId, startsAt);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className='mb-scheduling-grid-wrap'>
        <div className='mb-scheduling-grid-scroll'>
          <div
            className='mb-scheduling-grid'
            style={{
              gridTemplateColumns: `4.5rem repeat(${weekDateKeys.length}, minmax(8rem, 1fr))`,
            }}
          >
            <div className='mb-scheduling-grid-corner' />
            {weekDateKeys.map((dateKey) => (
              <div key={dateKey} className='mb-scheduling-day-header'>
                {formatDayHeader(dateKey, language)}
              </div>
            ))}

            {slotTimes.flatMap((time) => [
              <div key={`label-${time}`} className='mb-scheduling-time-label'>
                {time}
              </div>,
              ...weekDateKeys.map((dateKey) => {
                const key = slotId(dateKey, time);
                const slotView = appointmentBySlot.get(key) ?? null;
                return (
                  <SlotCell
                    key={key}
                    dateKey={dateKey}
                    time={time}
                    slotView={slotView}
                    tzOffset={tzOffset}
                    disabled={
                      saving ||
                      (slotView?.variant === 'start' &&
                        movingAppointmentId === slotView.appointment.id)
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
