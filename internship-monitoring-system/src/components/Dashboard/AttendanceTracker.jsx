import { useMemo, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { getCurrentLocation, reverseGeocodeLocation } from '../../utils/geolocation'

function getAttendanceMessage(error) {
  if (error?.code === error?.PERMISSION_DENIED) {
    return 'Location permission is required before timing in or out.'
  }

  if (error?.message) {
    return error.message
  }

  return 'Unable to record attendance right now.'
}

function AttendanceTracker({ clockNow }) {
  const [isTimedIn, setIsTimedIn] = useState(false)
  const [timeInAt, setTimeInAt] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attendanceMessage, setAttendanceMessage] = useState('')

  const elapsedTime = useMemo(() => {
    if (!isTimedIn || !timeInAt) {
      return '00:00:00'
    }

    const elapsedMs = clockNow.getTime() - timeInAt.getTime()
    const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const seconds = String(totalSeconds % 60).padStart(2, '0')

    return `${hours}:${minutes}:${seconds}`
  }, [clockNow, isTimedIn, timeInAt])

  const handleTimeAction = async () => {
    const action = isTimedIn ? 'Time-out' : 'Time-in'

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
        throw error
      }

      if (action === 'Time-in') {
        setIsTimedIn(true)
        setTimeInAt(data?.time_in ? new Date(data.time_in) : new Date())
      } else {
        setIsTimedIn(false)
        setTimeInAt(null)
      }
    } catch (error) {
      setAttendanceMessage(getAttendanceMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`time-action ${isTimedIn ? 'time-action--active' : ''}`} aria-label="Time attendance controls">
      <button type="button" className="time-button" onClick={handleTimeAction} disabled={isSubmitting}>
        <span className="time-button__label">{isTimedIn ? 'Time Out' : 'Time In'}</span>
        <span className="time-button__timer" aria-live="polite">
          {isSubmitting ? 'Saving...' : elapsedTime}
        </span>
      </button>
      {attendanceMessage ? (
        <p className="attendance-message" role="status">
          {attendanceMessage}
        </p>
      ) : null}
    </section>
  )
}

export default AttendanceTracker
