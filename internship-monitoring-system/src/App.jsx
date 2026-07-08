import { useEffect, useState } from 'react'
import AuthPage from './components/Auth/AuthPage'
import Dashboard from './components/Dashboard/Dashboard'
import ProfileSettings from './components/ProfileSettings/ProfileSettings'
import { studentProfile } from './data/studentProfile'
import { supabase } from './supabaseClient'

function App() {
  const [currentPage, setCurrentPage] = useState(() => (window.location.hash === '#profile' ? 'profile' : 'dashboard'))
  const [activeProfilePanel, setActiveProfilePanel] = useState('profile')
  const [profile, setProfile] = useState(studentProfile)
  const [session, setSession] = useState(null)
  const [isInitializingAuth, setIsInitializingAuth] = useState(true)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isAuthBusy, setIsAuthBusy] = useState(false)
  const [authMode, setAuthMode] = useState('sign-in')
  const [authNotice, setAuthNotice] = useState('')
  const [requiresProfileCompletion, setRequiresProfileCompletion] = useState(false)

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
        ...previousProfile.hte,
        name: data.hte || previousProfile.hte?.name,
      },
    }))
  }

  function applyCalendarRecords(records) {
    const attendance = Object.fromEntries(records.map((record) => [record.date, record.status]))

    setProfile((previousProfile) => ({
      ...previousProfile,
      schedule: {
        ...previousProfile.schedule,
        attendance,
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
        setProfile(studentProfile)
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
        .select('id, student_number, name, program, section, hte, phone_number, email_address, current_location')
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
        setRequiresProfileCompletion(true)
        setIsLoadingProfile(false)
        return
      }

      setRequiresProfileCompletion(false)
      applyStudentProfile(data)

      const { data: records, error: recordsError } = await supabase
        .from('attendance_logs')
        .select('date, status')
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
    const { error } = await supabase
      .from('students')
      .upsert(
        {
          user_id: userId,
          student_number: payload.studentNumber,
          name: payload.fullName,
          program: payload.program,
          section: payload.section,
          hte: payload.hte,
          phone_number: payload.phoneNumber,
          email_address: payload.email,
        },
        { onConflict: 'user_id' },
      )

    if (error) {
      throw error
    }
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
        return
      }

      if (!data?.user) {
        setFormMessage('Unable to create the account right now.')
        return
      }

      if (!data.session) {
        setAuthNotice('Account created. Check your email for the verification link, then log in.')
        setAuthMode('sign-in')
        return
      }

      await upsertStudentProfile(data.user.id, {
        email,
        fullName,
        studentNumber,
        program,
        section,
        hte,
        phoneNumber,
      })
    } catch (error) {
      setFormMessage(error.message || 'Unable to create your student account right now.')
    } finally {
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
        hte,
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
        onLogout={handleLogout}
        onPanelChange={setActiveProfilePanel}
        studentProfile={profile}
      />
    )
  }

  return <Dashboard onOpenProfile={openProfile} studentProfile={profile} />
}

export default App
