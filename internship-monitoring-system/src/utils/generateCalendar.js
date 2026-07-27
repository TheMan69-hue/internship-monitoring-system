const weekdayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getMonthLabel(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

export function generateCalendar(studentProfile, referenceDate = new Date(), customAttendance = null, clockNow = new Date(), activeSemester = null) {
  const year = referenceDate.getFullYear()
  const monthIndex = referenceDate.getMonth()
  const daysInMonth = getDaysInMonth(year, monthIndex)
  const firstOfMonth = new Date(year, monthIndex, 1)
  const leadingDays = firstOfMonth.getDay()
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7
  const todayIsoDate = toIsoDate(clockNow)
  const attendance = customAttendance ?? studentProfile?.schedule?.attendance ?? {}
  const daysOff = studentProfile?.schedule?.daysOff ?? []
  const weeks = []

  // Resolve semester boundaries (inclusive) into midnight Date objects for comparison
  const semesterStart = activeSemester?.startDate ? new Date(activeSemester.startDate + 'T00:00:00') : null
  const semesterEnd = activeSemester?.endDate ? new Date(activeSemester.endDate + 'T00:00:00') : null

  // Create start-of-day comparison for past/future check relative to clockNow
  const todayStart = new Date(clockNow.getFullYear(), clockNow.getMonth(), clockNow.getDate())

  for (let cellIndex = 0; cellIndex < totalCells; cellIndex += 7) {
    const week = []

    for (let offset = 0; offset < 7; offset += 1) {
      const absoluteCellIndex = cellIndex + offset
      const calendarDayOffset = absoluteCellIndex - leadingDays + 1
      const currentDate = new Date(year, monthIndex, calendarDayOffset)
      const isWithinMonth = currentDate.getMonth() === monthIndex
      const dayNumber = currentDate.getDate()
      const isoDate = toIsoDate(currentDate)
      const attendanceStatus = attendance[isoDate]
      const dayOfWeek = currentDate.getDay()
      const isCurrentDay = isoDate === todayIsoDate

      // Days outside the active semester boundary are marked disabled —
      // they are not counted as absent and cannot have records.
      const isBeforeSemester = semesterStart && currentDate < semesterStart
      const isAfterSemester = semesterEnd && currentDate > semesterEnd
      const isOutsideSemester = isWithinMonth && (isBeforeSemester || isAfterSemester)

      let status = 'present'

      if (!isWithinMonth) {
        // Days spilling into adjacent months are always 'outside' (or 'recorded-outside' if they have a record).
        status = attendanceStatus ? 'recorded-outside' : 'outside'
      } else if (isOutsideSemester) {
        // Semester boundary takes absolute priority — never count these as absent, recorded, or current
        // even if a stale DB record happens to exist for this date.
        status = 'disabled'
      } else if (attendanceStatus) {
        // Database statuses are stored as text; normalize them before using
        // them as CSS modifier names (for example, INCOMPLETE -> incomplete).
        const normalizedStatus = String(attendanceStatus).toLowerCase()
        status = normalizedStatus === 'present' ? 'recorded' : normalizedStatus
      } else if (isCurrentDay) {
        status = 'current'
      } else if (daysOff.includes(dayOfWeek)) {
        status = 'off'
      } else if (currentDate < todayStart) {
        status = 'absent'
      }

      week.push({
        dayNumber,
        isoDate,
        isCurrentDay,
        status,
        isDisabled: isOutsideSemester,
      })
    }

    weeks.push(week)
  }

  return {
    monthLabel: getMonthLabel(referenceDate),
    weekdayLabels,
    weeks,
  }
}
