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

export function generateCalendar(studentProfile, referenceDate = new Date(), customAttendance = null, clockNow = new Date()) {
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

      let status = 'present'

      if (attendanceStatus) {
        // Database statuses are stored as text; normalize them before using
        // them as CSS modifier names (for example, INCOMPLETE -> incomplete).
        const normalizedStatus = String(attendanceStatus).toLowerCase()
        status = !isWithinMonth
          ? 'recorded-outside'
          : normalizedStatus === 'present'
            ? 'recorded'
            : normalizedStatus
      } else if (!isWithinMonth) {
        status = 'outside'
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
