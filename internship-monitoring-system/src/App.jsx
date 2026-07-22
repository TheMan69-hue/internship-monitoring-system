import { useEffect, useRef, useState } from 'react'
import AuthPage from './components/Auth/AuthPage'
import Dashboard from './components/Dashboard/Dashboard'
import ProfileSettings from './components/ProfileSettings/ProfileSettings'
import { supabase } from './supabaseClient'

const emptyStudentProfile = {
  name: '',
  role: 'Intern',
  studentNumber: '',
  program: '',
  section: '',
  phoneNumber: '',
  emailAddress: '',
  location: '',
  hte: {
    name: '',
    address: '',
    timeCompletion: '',
    workSchedule: '',
    workingTime: '',
  },
  schedule: {
    attendance: {},
    records: {},
    daysOff: [],
  },
}

const weekdayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function expandWeekdayRange(startDay, endDay) {
  const startIndex = weekdayOrder.indexOf(startDay)
  const endIndex = weekdayOrder.indexOf(endDay)

  if (startIndex === -1 || endIndex === -1) {
    return []
  }

  if (startIndex <= endIndex) {
    return weekdayOrder.slice(startIndex, endIndex + 1)
  }

  return [...weekdayOrder.slice(startIndex), ...weekdayOrder.slice(0, endIndex + 1)]
}

function parseWorkScheduleToDaysOff(workSchedule) {
  const normalizedSchedule = workSchedule?.trim().toLowerCase()

  if (!normalizedSchedule) {
    return []
  }

  const workDays = new Set()
  const rangeMatches = normalizedSchedule.matchAll(
    /\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b\s*(?:-|to|through)\s*\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/g,
  )

  for (const match of rangeMatches) {
    expandWeekdayRange(match[1], match[2]).forEach((day) => workDays.add(day))
  }

  normalizedSchedule
    .split(/[^a-z]+/)
    .filter(Boolean)
    .forEach((token) => {
      if (weekdayOrder.includes(token)) {
        workDays.add(token)
      }
    })

  if (workDays.size === 0) {
    return []
  }

  return weekdayOrder
    .map((day, dayIndex) => ({ day, dayIndex }))
    .filter(({ day }) => !workDays.has(day))
    .map(({ dayIndex }) => dayIndex)
}

function getDaysOffFromProfile(profile) {
  const daysOff = parseWorkScheduleToDaysOff(profile?.hte?.workSchedule)

  if (daysOff.length > 0) {
    return daysOff
  }

  return profile?.schedule?.daysOff ?? []
}

function App() {
  const [currentPage, setCurrentPage] = useState(() => (window.location.hash === '#profile' ? 'profile' : 'dashboard'))
  const [activeProfilePanel, setActiveProfilePanel] = useState('profile')
  const [profile, setProfile] = useState(emptyStudentProfile)
  const [session, setSession] = useState(null)
  const [isInitializingAuth, setIsInitializingAuth] = useState(true)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isAuthBusy, setIsAuthBusy] = useState(false)
  const [authMode, setAuthMode] = useState('sign-in')
  const [authNotice, setAuthNotice] = useState('')
  const [requiresProfileCompletion, setRequiresProfileCompletion] = useState(false)
  const isProvisioningProfileRef = useRef(false)

  function applyStudentProfile(data) {
    setProfile((previousProfile) => ({
      ...previousProfile,
      name: data.name,
      role: previousProfile.role || 'Intern',
      studentNumber: data.student_number,
      program: data.program,
      section: data.section,
      phoneNumber: data.phone_number,
      emailAddress: data.email_address,
      location: data.current_location || previousProfile.location,
      hte: {
        name: data.hte_name || data.hte || previousProfile.hte?.name || '',
        address: data.hte_address || previousProfile.hte?.address || '',
        timeCompletion: data.hte_time_completion || previousProfile.hte?.timeCompletion || '',
        workSchedule: data.hte_work_schedule || previousProfile.hte?.workSchedule || '',
        workingTime: data.hte_working_time || previousProfile.hte?.workingTime || '',
      },
      schedule: {
        ...previousProfile.schedule,
        daysOff: parseWorkScheduleToDaysOff(data.hte_work_schedule || data.hte || previousProfile.hte?.workSchedule || ''),
      },
    }))
  }

  function applyCalendarRecords(records) {
    const attendance = Object.fromEntries(records.map((record) => [record.date, record.status]))
    const attendanceRecords = Object.fromEntries(records.map((record) => [record.date, record]))

    setProfile((previousProfile) => ({
      ...previousProfile,
      schedule: {
        ...previousProfile.schedule,
        attendance,
        records: attendanceRecords,
        daysOff: getDaysOffFromProfile(previousProfile),
      },
    }))
  }

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash === '#profile' ? 'profile' : 'dashboard')
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.warn('Unable to initialize Supabase auth:', error.message)
      }

      if (!isMounted) {
        return
      }

      setSession(currentSession ?? null)
      setIsInitializingAuth(false)
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)

      if (!nextSession) {
        setRequiresProfileCompletion(false)
        setIsLoadingProfile(false)
        setProfile(emptyStudentProfile)
        setCurrentPage('dashboard')
        setAuthMode('sign-in')
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadStudentProfile() {
      const user = session?.user

      if (!user) {
        return
      }

      setIsLoadingProfile(true)
      setAuthNotice('')

      const { data, error } = await supabase
        .from('students')
        .select(
          'id, student_number, name, program, section, hte, hte_name, hte_address, hte_time_completion, hte_work_schedule, hte_working_time, phone_number, email_address, current_location',
        )
        .eq('user_id', user.id)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      if (error) {
        console.warn('Unable to load the signed-in student profile:', error.message)
        setAuthNotice('Unable to load your student profile right now.')
        setIsLoadingProfile(false)
        return
      }

      if (!data) {
        if (isProvisioningProfileRef.current) {
          return
        }

        setRequiresProfileCompletion(true)
        setIsLoadingProfile(false)
        return
      }

      setRequiresProfileCompletion(false)
      applyStudentProfile(data)

      const { data: records, error: recordsError } = await supabase
        .from('attendance_logs')
        .select('date, status, time_in, time_out')
        .eq('student_id', data.id)
        .order('date', { ascending: true })

      if (!isMounted) {
        return
      }

      if (recordsError) {
        console.warn('Unable to load student attendance logs:', recordsError.message)
      } else {
        applyCalendarRecords(records ?? [])
      }

      setIsLoadingProfile(false)
    }

    loadStudentProfile()

    return () => {
      isMounted = false
    }
  }, [session])

  async function upsertStudentProfile(userId, payload) {
    const studentRecord = {
      user_id: userId,
      student_number: payload.studentNumber,
      name: payload.fullName,
      program: payload.program,
      section: payload.section,
      phone_number: payload.phoneNumber,
      email_address: payload.email,
    }

    const hteName = payload.hteName ?? (typeof payload.hte === 'string' ? payload.hte : payload.hte?.name)

    if (hteName !== undefined) {
      studentRecord.hte = hteName
      studentRecord.hte_name = hteName
    }

    if (payload.hteDetails) {
      if (payload.hteDetails.address !== undefined) {
        studentRecord.hte_address = payload.hteDetails.address
      }

      if (payload.hteDetails.timeCompletion !== undefined) {
        studentRecord.hte_time_completion = payload.hteDetails.timeCompletion
      }

      if (payload.hteDetails.workSchedule !== undefined) {
        studentRecord.hte_work_schedule = payload.hteDetails.workSchedule
      }

      if (payload.hteDetails.workingTime !== undefined) {
        studentRecord.hte_working_time = payload.hteDetails.workingTime
      }
    }

    const { error } = await supabase.from('students').upsert(studentRecord, { onConflict: 'user_id' })

    if (error) {
      throw error
    }
  }

  function handleProfileSave(updates) {
    const nextProfile = {
      ...profile,
      name: updates.name,
      phoneNumber: updates.phoneNumber,
      emailAddress: updates.emailAddress,
    }

    setProfile(nextProfile)

    return upsertStudentProfile(session?.user?.id, {
      email: updates.emailAddress,
      fullName: updates.name,
      studentNumber: nextProfile.studentNumber,
      program: nextProfile.program,
      section: nextProfile.section,
      phoneNumber: updates.phoneNumber,
    })
  }

  function handleHteSave(updates) {
    const nextHte = {
      name: updates.name,
      address: updates.address,
      timeCompletion: updates.timeCompletion,
      workSchedule: updates.workSchedule,
      workingTime: updates.workingTime,
    }

    setProfile((previousProfile) => ({
      ...previousProfile,
      hte: nextHte,
      schedule: {
        ...previousProfile.schedule,
        daysOff: parseWorkScheduleToDaysOff(nextHte.workSchedule),
      },
    }))

    return upsertStudentProfile(session?.user?.id, {
      email: profile.emailAddress,
      fullName: profile.name,
      studentNumber: profile.studentNumber,
      program: profile.program,
      section: profile.section,
      phoneNumber: profile.phoneNumber,
      hteName: nextHte.name,
      hteDetails: nextHte,
    })
  }

  async function handleSignIn({ email, password, setFormMessage }) {
    setIsAuthBusy(true)
    setAuthNotice('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setFormMessage(error.message)
      }
    } finally {
      setIsAuthBusy(false)
    }
  }

  async function handleSignUp({
    email,
    password,
    fullName,
    studentNumber,
    program,
    section,
    hte,
    phoneNumber,
    setFormMessage,
  }) {
    setIsAuthBusy(true)
    setAuthNotice('')
    isProvisioningProfileRef.current = true

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            student_number: studentNumber,
            program,
            section,
            hte,
            phone_number: phoneNumber,
          },
        },
      })

      if (error) {
        setFormMessage(error.message)
        isProvisioningProfileRef.current = false
        return
      }

      if (!data?.user) {
        setFormMessage('Unable to create the account right now.')
        isProvisioningProfileRef.current = false
        return
      }

      if (!data.session) {
        setAuthNotice('Account created. Check your email for the verification link, then log in.')
        setAuthMode('sign-in')
        isProvisioningProfileRef.current = false
        return
      }

      await upsertStudentProfile(data.user.id, {
        email,
        fullName,
        studentNumber,
        program,
        section,
        hteName: hte,
        phoneNumber,
      })
      setRequiresProfileCompletion(false)
      setCurrentPage('dashboard')
      setSession({ ...data.session })
    } catch (error) {
      setFormMessage(error.message || 'Unable to create your student account right now.')
    } finally {
      isProvisioningProfileRef.current = false
      setIsAuthBusy(false)
    }
  }

  async function handleForgotPassword({ email, setFormMessage }) {
    setIsAuthBusy(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}`,
      })

      if (error) {
        setFormMessage(error.message)
        return
      }

      setFormMessage('Password reset link sent. Please check your email.')
    } finally {
      setIsAuthBusy(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsAuthBusy(true)
    setAuthNotice('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      })

      if (error) {
        setAuthNotice(error.message)
      }
    } finally {
      setIsAuthBusy(false)
    }
  }

  async function handleCompleteProfile({
    email,
    fullName,
    studentNumber,
    program,
    section,
    hte,
    phoneNumber,
    setFormMessage,
  }) {
    const userId = session?.user?.id

    if (!userId) {
      setFormMessage('Your session expired. Please sign in again.')
      return
    }

    setIsAuthBusy(true)

    try {
      await upsertStudentProfile(userId, {
        email,
        fullName,
        studentNumber,
        program,
        section,
        hteName: hte,
        phoneNumber,
      })

      setRequiresProfileCompletion(false)
      setAuthNotice('')
    } catch (error) {
      setFormMessage(error.message || 'Unable to save your profile.')
    } finally {
      setIsAuthBusy(false)
    }
  }

  const openProfile = () => {
    window.location.hash = 'profile'
    setCurrentPage('profile')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.hash = ''
    setCurrentPage('dashboard')
  }

  if (isInitializingAuth) {
    return <main style={{ padding: '2rem' }}>Loading authentication...</main>
  }

  if (!session) {
    return (
      <AuthPage
        authMode={authMode}
        authNotice={authNotice}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
        onForgotPassword={handleForgotPassword}
        onCompleteProfile={handleCompleteProfile}
        onSwitchToSignIn={() => {
          setAuthMode('sign-in')
          setAuthNotice('')
        }}
        onSwitchToSignUp={() => {
          setAuthMode('sign-up')
          setAuthNotice('')
        }}
        isBusy={isAuthBusy}
      />
    )
  }

  if (requiresProfileCompletion) {
    return (
      <AuthPage
        authMode="onboarding"
        authUser={session.user}
        authNotice="Complete your student profile to continue to your dashboard."
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
        onForgotPassword={handleForgotPassword}
        onCompleteProfile={handleCompleteProfile}
        onSwitchToSignIn={() => {}}
        onSwitchToSignUp={() => {}}
        isBusy={isAuthBusy}
      />
    )
  }

  if (isLoadingProfile) {
    return <main style={{ padding: '2rem' }}>Loading dashboard...</main>
  }

  if (currentPage === 'profile') {
    return (
      <ProfileSettings
        activePanel={activeProfilePanel}
        onOpenDashboard={() => {
          window.location.hash = ''
          setCurrentPage('dashboard')
        }}
        onLogout={handleLogout}
        onPanelChange={setActiveProfilePanel}
        onSaveProfile={handleProfileSave}
        onSaveHte={handleHteSave}
        studentProfile={profile}
      />
    )
  }

  return <Dashboard onOpenProfile={openProfile} studentProfile={profile} userId={session.user.id} />
}

export default App
