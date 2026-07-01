const weekdayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getMonthLabel(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)
}

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

export function generateCalendar(studentProfile, referenceDate = new Date()) {
  const year = referenceDate.getFullYear()
  const monthIndex = referenceDate.getMonth()
  const daysInMonth = getDaysInMonth(year, monthIndex)
  const firstOfMonth = new Date(year, monthIndex, 1)
  const leadingDays = firstOfMonth.getDay()
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7
  const referenceIsoDate = toIsoDate(referenceDate)
  const attendance = studentProfile.schedule?.attendance ?? {}
  const daysOff = studentProfile.schedule?.daysOff ?? []
  const weeks = []

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
      const isCurrentDay = isoDate === referenceIsoDate

      let status = 'present'

      if (!isWithinMonth) {
        status = 'outside'
      } else if (attendanceStatus) {
        status = attendanceStatus
      } else if (isCurrentDay) {
        status = 'current'
      } else if (daysOff.includes(dayOfWeek)) {
        status = 'off'
      } else if (currentDate < referenceDate) {
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