import { useEffect, useMemo, useState } from 'react'
import { generateCalendar } from '../../utils/generateCalendar'
import { supabase } from '../../supabaseClient'

function formatDuration(durationMs) {
  if (!durationMs || durationMs <= 0) return '0h 00m 00s'
  const totalSeconds = Math.floor(durationMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
}

function formatTime(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

function getRenderedDuration(record) {
  if (!record?.time_in || !record?.time_out) return 0
  return Math.max(0, new Date(record.time_out).getTime() - new Date(record.time_in).getTime())
}

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getGridBounds(viewDate) {
  const year = viewDate.getFullYear()
  const monthIndex = viewDate.getMonth()
  const firstOfMonth = new Date(year, monthIndex, 1)
  const leadingDays = firstOfMonth.getDay()
  const startDate = new Date(year, monthIndex, 1 - leadingDays)
  
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7
  const endDate = new Date(year, monthIndex, totalCells - leadingDays)

  return {
    startDateStr: toIsoDate(startDate),
    endDateStr: toIsoDate(endDate),
  }
}

export default function AttendanceCalendar({
  studentProfile,
  studentId,
  userId,
  clockNow = new Date(),
  activeSemester = null,
  onMonthChange,
  onRecordsLoaded,
  isProfileLoading = false,
}) {
  const [viewDate, setViewDate] = useState(() => new Date(clockNow.getFullYear(), clockNow.getMonth(), 1))
  const [monthlyRecords, setMonthlyRecords] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [fetchError, setFetchError] = useState(null)

  const activeStudentId = studentId || studentProfile?.id

  // Fetch attendance records from Supabase when month view or studentId changes
  useEffect(() => {
    if (isProfileLoading) {
      return
    }

    let isMounted = true

    async function fetchMonthlyRecords() {
      setIsLoading(true)
      setFetchError(null)

      const { startDateStr: gridStartStr, endDateStr: gridEndStr } = getGridBounds(viewDate)

      // Clamp the lower query bound to the semester start so records before the semester
      // are never loaded into the map — disabled tiles must stay empty.
      const effectiveStartStr =
        activeSemester?.startDate && activeSemester.startDate > gridStartStr
          ? activeSemester.startDate
          : gridStartStr

      // Clamp the upper query bound to the semester end similarly.
      const effectiveEndStr =
        activeSemester?.endDate && activeSemester.endDate < gridEndStr
          ? activeSemester.endDate
          : gridEndStr

      try {
        let queryStudentId = activeStudentId

        // Fallback: If studentId isn't directly passed, find student_id from students table via user_id
        if (!queryStudentId && userId) {
          const { data: studentData } = await supabase
            .from('students')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()
          
          if (studentData?.id) {
            queryStudentId = studentData.id
          }
        }

        let query = supabase
          .from('attendance_logs')
          .select('id, student_id, date, status, time_in, time_out, location_name_in, location')
          .gte('date', effectiveStartStr)
          .lte('date', effectiveEndStr)

        if (queryStudentId) {
          query = query.eq('student_id', queryStudentId)
        }

        const { data, error } = await query

        if (!isMounted) return

        if (error) {
          console.warn('Error fetching monthly attendance records:', error.message)
          setFetchError('Unable to load attendance logs for this month.')
        } else if (data) {
          const recordsMap = {}
          data.forEach((rec) => {
            recordsMap[rec.date] = rec
          })
          setMonthlyRecords(recordsMap)
          if (onRecordsLoaded) {
            onRecordsLoaded(data)
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch attendance logs:', err)
          setFetchError('Failed to connect to database.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchMonthlyRecords()

    if (onMonthChange) {
      onMonthChange(viewDate)
    }

    return () => {
      isMounted = false
    }
  }, [viewDate, activeStudentId, userId, activeSemester?.id, activeSemester?.startDate, activeSemester?.endDate, isProfileLoading])

  const attendanceStatusMap = useMemo(() => {
    const map = {}
    Object.entries(monthlyRecords).forEach(([date, rec]) => {
      map[date] = rec.status
    })
    return map
  }, [monthlyRecords])

  const calendar = useMemo(
    () => generateCalendar(studentProfile, viewDate, attendanceStatusMap, clockNow, activeSemester),
    [studentProfile, viewDate, attendanceStatusMap, clockNow, activeSemester],
  )

  const isCurrentMonthView =
    viewDate.getFullYear() === clockNow.getFullYear() && viewDate.getMonth() === clockNow.getMonth()

  const handlePrevMonth = () => {
    setSelectedDate(null)
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setSelectedDate(null)
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleResetToCurrentMonth = () => {
    setSelectedDate(null)
    setViewDate(new Date(clockNow.getFullYear(), clockNow.getMonth(), 1))
  }

  return (
    <div className="attendance-calendar-container">
      <header className="calendar-nav-header">
        <div className="calendar-nav-controls">
          <button
            type="button"
            className="calendar-nav-btn calendar-nav-btn--prev"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            title="Previous month"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>

          <div className="calendar-title-group">
            <h1 className="calendar-month-title">{calendar.monthLabel}</h1>
            {!isCurrentMonthView && (
              <button
                type="button"
                className="calendar-today-btn"
                onClick={handleResetToCurrentMonth}
                title="Return to current month"
              >
                Today
              </button>
            )}
          </div>

          <button
            type="button"
            className="calendar-nav-btn calendar-nav-btn--next"
            onClick={handleNextMonth}
            aria-label="Next month"
            title="Next month"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </header>

      {isLoading && <div className="calendar-loading-bar" aria-label="Loading month data..." />}
      {fetchError && <div className="calendar-error-notice">{fetchError}</div>}

      <div className="weekday-row" aria-hidden="true">
        {calendar.weekdayLabels.map((weekday) => (
          <span key={weekday} className="weekday-pill">
            {weekday.slice(0, 3)}
          </span>
        ))}
      </div>

      <div className={`calendar-grid ${isLoading ? 'calendar-grid--loading' : ''}`}>
        {calendar.weeks.flatMap((week, weekIndex) =>
          week.map((tile) => {
            const record = monthlyRecords[tile.isoDate]
            const hasRecord = Boolean(record)
            const isSelected = selectedDate === tile.isoDate
            const renderedDuration = getRenderedDuration(record)

            return (
              <button
                type="button"
                key={`${weekIndex}-${tile.isoDate}`}
                className={`calendar-tile calendar-tile--${tile.status}${
                  tile.isCurrentDay ? ' calendar-tile--current' : ''
                }${hasRecord ? ' calendar-tile--has-record' : ''}${isSelected ? ' calendar-tile--selected' : ''}`}
                onClick={tile.isDisabled ? undefined : () => setSelectedDate(isSelected ? null : tile.isoDate)}
                disabled={tile.isDisabled}
                aria-disabled={tile.isDisabled || undefined}
                aria-expanded={hasRecord && !tile.isDisabled ? isSelected : undefined}
                aria-label={
                  tile.isDisabled
                    ? `${tile.isoDate}: outside semester`
                    : hasRecord
                      ? `Attendance record for ${tile.isoDate}: ${record.status}`
                      : `${tile.isoDate}: ${tile.status}`
                }
              >
                <span className="calendar-number">{tile.dayNumber}</span>
                {hasRecord ? (
                  <span className="calendar-record" aria-hidden={!isSelected}>
                    <span>
                      <b>Time in</b>
                      {formatTime(record.time_in)}
                    </span>
                    <span>
                      <b>Time out</b>
                      {formatTime(record.time_out)}
                    </span>
                    <span>
                      <b>Status</b>
                      {record.status}
                    </span>
                    <span>
                      <b>Rendered</b>
                      {record.time_out ? formatDuration(renderedDuration) : 'In progress'}
                    </span>
                  </span>
                ) : null}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}
