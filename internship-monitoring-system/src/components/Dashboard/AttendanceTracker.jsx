import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { getCurrentLocation, reverseGeocodeLocation } from '../../utils/geolocation'

function getAttendanceMessage(error) {
  if (error?.code === 1) {
    return 'Location permission is required before timing in or out.'
  }

  if (error?.message) {
    return error.message
  }

  return 'Unable to record attendance right now.'
}

function readStoredAttendance(storageKey) {
  if (typeof window === 'undefined') {
    return { timeInAt: null, timeOutAvailableAt: null }
  }

  const storedState = window.localStorage.getItem(storageKey)

  if (!storedState) {
    return { timeInAt: null, timeOutAvailableAt: null }
  }

  try {
    const parsedState = JSON.parse(storedState)

    return {
      timeInAt: parsedState?.timeInAt ?? null,
      timeOutAvailableAt: parsedState?.timeOutAvailableAt ?? null,
    }
  } catch (error) {
    console.warn('Failed to restore attendance state:', error)
    return { timeInAt: null, timeOutAvailableAt: null }
  }
}

function AttendanceTracker({ clockNow, gpsPermissionState }) {
  const [storageKey] = useState(() => `attendance-state-${new Date().toISOString().slice(0, 10)}`)
  const [attendanceState, setAttendanceState] = useState(() => readStoredAttendance(storageKey))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attendanceMessage, setAttendanceMessage] = useState('')
  const [isGpsBlockedByAction, setIsGpsBlockedByAction] = useState(false)
  const isGpsBlocked = gpsPermissionState === 'denied' || isGpsBlockedByAction

  const isTimedIn = Boolean(attendanceState.timeInAt)
  const timeInAt = attendanceState.timeInAt ? new Date(attendanceState.timeInAt) : null
  const timeOutAvailableAt = attendanceState.timeOutAvailableAt ? new Date(attendanceState.timeOutAvailableAt) : null

  useEffect(() => {
    if (!attendanceState.timeInAt) {
      window.localStorage.removeItem(storageKey)
      return
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        timeInAt: attendanceState.timeInAt,
        timeOutAvailableAt: attendanceState.timeOutAvailableAt,
      }),
    )
  }, [attendanceState, storageKey])

  let elapsedTime = '00:00:00'

  if (isTimedIn && timeInAt) {
    const elapsedMs = clockNow.getTime() - timeInAt.getTime()
    const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const seconds = String(totalSeconds % 60).padStart(2, '0')

    elapsedTime = `${hours}:${minutes}:${seconds}`
  }

let timeOutLockRemaining = ''

if (isTimedIn && timeOutAvailableAt) {
  const remainingMs = timeOutAvailableAt.getTime() - clockNow.getTime()

  if (remainingMs > 0) {
    const totalSeconds = Math.ceil(remainingMs / 1000)
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const seconds = String(totalSeconds % 60).padStart(2, '0')

    timeOutLockRemaining = `${hours}:${minutes}:${seconds}`
  }
}

  const isTimeOutLocked = isTimedIn && timeOutAvailableAt && (timeOutAvailableAt.getTime() - clockNow.getTime() > 0);
  const isButtonDisabled = isSubmitting || (!isTimedIn && isGpsBlocked) || (isTimedIn && isTimeOutLocked)

  const handleTimeAction = async () => {
    const action = isTimedIn ? 'Time-out' : 'Time-in'

    if (!isTimedIn && isGpsBlocked) {
      setAttendanceMessage('Location permission is required before timing in.')
      return
    }

    setIsSubmitting(true)
    setAttendanceMessage('')

    try {
      const location = await getCurrentLocation()
      let locationNameIn = null

      if (action === 'Time-in') {
        try {
          locationNameIn = await reverseGeocodeLocation(location)
        } catch (error) {
          console.warn('Failed to fetch location name:', error)
        }
      }

      const { data, error } = await supabase.rpc('record_student_attendance', {
        p_action: action,
        p_location: location,
        p_location_name_in: locationNameIn,
      })

      if (error) {
        if (error.code === 1) {
          setIsGpsBlockedByAction(true)
        }

        throw error
      }

      if (action === 'Time-in') {
        // Use server time for the permanent record
        const serverTimeIn = data?.time_in ? new Date(data.time_in) : new Date();
  
        // Use local client time ONLY to anchor the visual 1-hour UI lock
        const localNow = new Date();
        const localTimeOutAvailable = new Date(localNow.getTime() + 0.1 * 60 * 1000);

        setAttendanceState({
        timeInAt: serverTimeIn.toISOString(), // Kept as server time for elapsedTime counter
        timeOutAvailableAt: localTimeOutAvailable.toISOString(), // Anchored locally so clockNow compares perfectly
  });
} else {
        setAttendanceState({
          timeInAt: null,
          timeOutAvailableAt: null,
        })
      }
    } catch (error) {
      if (error.code === 1) {
        setIsGpsBlockedByAction(true)
      }

      setAttendanceMessage(getAttendanceMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`time-action ${isTimedIn ? 'time-action--active' : ''}`} aria-label="Time attendance controls">
      <button type="button" className="time-button" onClick={handleTimeAction} disabled={isButtonDisabled}>
        <span className="time-button__label">{isTimedIn ? 'Time Out' : 'Time In'}</span>
        <span className="time-button__timer" aria-live="polite">
          {isSubmitting ? 'Saving...' : elapsedTime}
        </span>
      </button>
      {!isTimedIn && isGpsBlocked ? (
        <p className="attendance-message" role="status">
          Allow GPS access to enable time in.
        </p>
      ) : null}
      {isTimeOutLocked && timeOutLockRemaining ? (
        <p className="attendance-message" role="status">
          Time out unlocks in {timeOutLockRemaining}.
        </p>
      ) : null}
      {attendanceMessage ? (
        <p className="attendance-message" role="status">
          {attendanceMessage}
        </p>
      ) : null}
    </section>
  )
}

export default AttendanceTracker
