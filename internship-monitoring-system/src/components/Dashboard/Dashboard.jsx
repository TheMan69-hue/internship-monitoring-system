import { useEffect, useMemo, useState } from 'react'
import './Dashboard.css'
import { studentProfile as defaultStudentProfile } from '../../data/studentProfile'
import { generateCalendar } from '../../utils/generateCalendar'
import AttendanceTracker from './AttendanceTracker'

function Dashboard({ onOpenProfile, studentProfile = defaultStudentProfile }) {
  const [clockNow, setClockNow] = useState(new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClockNow(new Date())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const displayTime = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(clockNow),
    [clockNow],
  )

  const displayDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      }).format(clockNow),
    [clockNow],
  )

  const calendar = useMemo(() => generateCalendar(studentProfile, clockNow), [studentProfile, clockNow])

  return (
    <main className="dashboard-shell">
      <header className="top-bar" aria-label="Student dashboard header">
        <div className="identity-group">
          <button type="button" className="avatar" onClick={onOpenProfile} aria-label="Open profile settings">
            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
              <path d="M12 13.2c-3.2 0-5.8 2.6-5.8 5.8v1h11.6v-1c0-3.2-2.6-5.8-5.8-5.8Zm0-1.8a4.5 4.5 0 1 0 0-9 4.5 4.5 4.5 0 0 0 0 9Z" />
            </svg>
          </button>
          <span className="role-label">{studentProfile.role}</span>
        </div>

        <div className="status-group">
          <div className="location-pill" aria-label="Current geolocation status">
            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
              <path d="M12 2.5a8.5 8.5 0 0 0-8.5 8.5c0 6.3 8.5 10.5 8.5 10.5S20.5 17.3 20.5 11A8.5 8.5 0 0 0 12 2.5Zm0 11.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z" />
            </svg>
            <span>{studentProfile.location}</span>
          </div>

          <div className="timestamp" aria-label={`Server synchronized time ${displayTime}, ${displayDate}`}>
            <strong>{displayTime}</strong>
            <span>{displayDate}</span>
          </div>
        </div>
      </header>

      <section className="tracker-card" aria-label="Daily time record tracker">
        <h1>{calendar.monthLabel}</h1>

        <div className="weekday-row" aria-hidden="true">
          {calendar.weekdayLabels.map((weekday) => (
            <span key={weekday} className="weekday-pill">
              {weekday}
            </span>
          ))}
        </div>

        <div className="calendar-grid" role="presentation" aria-hidden="true">
          {calendar.weeks.flatMap((week, weekIndex) =>
            week.map((tile) => (
              <span
                key={`${weekIndex}-${tile.isoDate}`}
                className={`calendar-tile calendar-tile--${tile.status}${tile.isCurrentDay ? ' calendar-tile--current' : ''}`}
              >
                <span className="calendar-number">{tile.dayNumber}</span>
              </span>
            )),
          )}
        </div>
      </section>

      <AttendanceTracker clockNow={clockNow} />
    </main>
  )
}
export default Dashboard
