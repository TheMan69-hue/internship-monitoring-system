import { useEffect, useMemo, useState } from 'react'
import './Dashboard.css'
import { generateCalendar } from '../../utils/generateCalendar'
import { getCurrentLocation, reverseGeocodeLocation } from '../../utils/geolocation'
import AttendanceTracker from './AttendanceTracker'

const getReadableAddress = (locationData) => {
  if (!locationData) return '';

  // Case A: If it's a raw full-address text string
  if (typeof locationData === 'string') {
    const parts = locationData.split(',').map(p => p.trim());
    const uniqueParts = [];
    
    parts.forEach(part => {
      // Aggressively checks for overlaps (like catching "San Agustin 1" vs "San Agustin")
      const isRedundant = uniqueParts.some(existing => {
        const normalExisting = existing.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalPart = part.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalExisting.includes(normalPart) || normalPart.includes(normalExisting);
      });
      
      if (!isRedundant) uniqueParts.push(part);
    });
    
    // Grab the first 3 uniquely identified pieces
    return uniqueParts.slice(0, 3).join(', ');
  }

  // Case B: If it's a raw object fetched from OpenStreetMap / Nominatim API
  if (typeof locationData === 'object') {
    const addr = locationData.address || locationData;
    const components = [
      addr.university || addr.college || addr.school || addr.building || addr.amenity,
      addr.road || addr.street,
      addr.residential || addr.subdivision,
      addr.neighbourhood || addr.suburb || addr.village || addr.barrio || addr.barangay,
      addr.city || addr.town || addr.municipality
    ].filter(Boolean);

    const uniqueParts = [];
    components.forEach(item => {
      const cleanItem = item.trim();
      const isRedundant = uniqueParts.some(existing => {
        const normalExisting = existing.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalClean = cleanItem.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalExisting.includes(normalClean) || normalClean.includes(normalExisting);
      });
      
      if (!isRedundant) uniqueParts.push(cleanItem);
    });

    return uniqueParts.slice(0, 3).join(', ');
  }

  return String(locationData);
};

function formatDuration(durationMs) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000))
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

function parseRequiredHours(value) {
  if (typeof value === 'number') return Math.max(0, value)
  if (!value) return 0

  const normalizedValue = String(value).trim().toLowerCase()
  const hoursAndMinutes = normalizedValue.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)?\s*(?::|hours?\s*)\s*(\d+)\s*(?:m|min|mins|minute|minutes)?/)

  if (hoursAndMinutes) {
    return Number(hoursAndMinutes[1]) + Number(hoursAndMinutes[2]) / 60
  }

  const firstNumber = normalizedValue.match(/\d+(?:\.\d+)?/)
  return firstNumber ? Number(firstNumber[0]) : 0
}

function getRenderedDuration(record) {
  if (!record?.time_in || !record?.time_out) return 0

  return Math.max(0, new Date(record.time_out).getTime() - new Date(record.time_in).getTime())
}

function Dashboard({ onOpenProfile, studentProfile }) {
  const [clockNow, setClockNow] = useState(new Date())
  const [liveLocation, setLiveLocation] = useState('')
  const [gpsPermissionState, setGpsPermissionState] = useState('prompt')
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClockNow(new Date())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadLiveLocationPreview() {
      try {
        if (navigator.permissions?.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })

          if (!isMounted) {
            return
          }

          setGpsPermissionState(permissionStatus.state)

          if (permissionStatus.state === 'denied') {
            return
          }
        }

        const location = await getCurrentLocation()

        if (!isMounted) {
          return
        }

        try {
          const locationLabel = await reverseGeocodeLocation(location)

          if (isMounted) {
            setLiveLocation(locationLabel)
          }
        } catch (reverseGeocodeError) {
          console.warn('Failed to resolve live location preview:', reverseGeocodeError)

          if (isMounted) {
            setLiveLocation(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`)
          }
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        if (error?.code === 1) {
          setGpsPermissionState('denied')
          setLiveLocation('GPS access blocked')
          return
        }

        setLiveLocation('Unable to load live location')
      }
    }

    loadLiveLocationPreview()

    return () => {
      isMounted = false
    }
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
  const progress = useMemo(() => {
    const records = Object.values(studentProfile?.schedule?.records ?? {})
    const renderedMs = records.reduce((total, record) => total + getRenderedDuration(record), 0)
    const requiredHours = parseRequiredHours(studentProfile?.hte?.timeCompletion)
    const requiredMs = requiredHours * 60 * 60 * 1000
    const remainingMs = Math.max(0, requiredMs - renderedMs)
    const percent = requiredMs ? Math.min(100, (renderedMs / requiredMs) * 100) : 0

    return { renderedMs, requiredMs, remainingMs, percent }
  }, [studentProfile])

  return (
    <main className="dashboard-shell">
      <header className="top-bar" aria-label="Student dashboard header">
        <div className="identity-group">
          <button type="button" className="avatar" onClick={onOpenProfile} aria-label="Open profile settings">
            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
              <circle cx="12" cy="8.2" r="4.2" />
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8H4Z" />
            </svg>
          </button>
          <span className="role-label">{studentProfile.name}</span>
        </div>

        <div className="status-group">
          <div className="location-pill" aria-label="Current geolocation status">
            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
              <path d="M12 2.5a8.5 8.5 0 0 0-8.5 8.5c0 6.3 8.5 10.5 8.5 10.5S20.5 17.3 20.5 11A8.5 8.5 0 0 0 12 2.5Zm0 11.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z" />
            </svg>
            <span>
              {liveLocation 
                ? getReadableAddress(liveLocation) 
                : (gpsPermissionState === 'denied' 
                    ? 'GPS access blocked' 
                    : getReadableAddress(studentProfile?.location)
                  )
              }
            </span>
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

        <div className="calendar-grid">
          {calendar.weeks.flatMap((week, weekIndex) =>
            week.map((tile) => {
              const record = studentProfile?.schedule?.records?.[tile.isoDate]
              const hasRecord = Boolean(record)
              const isSelected = selectedDate === tile.isoDate
              const renderedDuration = getRenderedDuration(record)

              return (
              <button
                type="button"
                key={`${weekIndex}-${tile.isoDate}`}
                className={`calendar-tile calendar-tile--${tile.status}${tile.isCurrentDay ? ' calendar-tile--current' : ''}${hasRecord ? ' calendar-tile--has-record' : ''}${isSelected ? ' calendar-tile--selected' : ''}`}
                onClick={() => setSelectedDate(isSelected ? null : tile.isoDate)}
                aria-expanded={hasRecord ? isSelected : undefined}
                aria-label={hasRecord ? `Show attendance record for ${tile.isoDate}` : `${tile.isoDate}: ${tile.status}`}
              >
                <span className="calendar-number">{tile.dayNumber}</span>
                {hasRecord ? (
                  <span className="calendar-record" aria-hidden={!isSelected}>
                    <span><b>Time in</b>{formatTime(record.time_in)}</span>
                    <span><b>Time out</b>{formatTime(record.time_out)}</span>
                    <span><b>Status</b>{record.status}</span>
                    <span><b>Rendered</b>{record.time_out ? formatDuration(renderedDuration) : 'In progress'}</span>
                  </span>
                ) : null}
              </button>
              )
            }),
          )}
        </div>

        <section className="hours-progress" aria-label="Internship hours progress">
          <div className="hours-progress__heading">
            <div>
              <h2>Internship hours</h2>
              <p>{progress.requiredMs ? `${formatDuration(progress.renderedMs)} rendered of ${formatDuration(progress.requiredMs)}` : 'Set your Time Completion in HTE Details to track your progress.'}</p>
            </div>
            {progress.requiredMs ? <strong>{Math.round(progress.percent)}%</strong> : null}
          </div>
          <div className="hours-progress__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress.percent)}>
            <span style={{ width: `${progress.percent}%` }} />
          </div>
          {progress.requiredMs ? <p className="hours-progress__remaining">{progress.remainingMs ? `${formatDuration(progress.remainingMs)} remaining` : 'Required hours completed'}</p> : null}
        </section>
      </section>

      <AttendanceTracker clockNow={clockNow} gpsPermissionState={gpsPermissionState} />
    </main>
  )
}
export default Dashboard
