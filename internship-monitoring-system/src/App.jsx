import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard/Dashboard'
import ProfileSettings from './components/ProfileSettings/ProfileSettings'
import { studentProfile } from './data/studentProfile'
import { supabase } from './supabaseClient'

function App() {
  const [currentPage, setCurrentPage] = useState(() => (window.location.hash === '#profile' ? 'profile' : 'dashboard'))
  const [activeProfilePanel, setActiveProfilePanel] = useState('profile')
  const [profile, setProfile] = useState(studentProfile)

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash === '#profile' ? 'profile' : 'dashboard')
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    let isMounted = true

    function applyStudentProfile(data) {
      setProfile((previousProfile) => ({
        ...previousProfile,
        name: data.name,
        studentNumber: data.student_number,
        program: data.program,
        section: data.section,
        phoneNumber: data.phone_number,
        emailAddress: data.email_address,
        location: data.current_location || previousProfile.location,
      }))
    }

    function applyCalendarRecords(records) {
      const attendance = Object.fromEntries(
        records.map((record) => [record.date, record.status]),
      )

      setProfile((previousProfile) => ({
        ...previousProfile,
        schedule: {
          ...previousProfile.schedule,
          attendance,
        },
      }))
    }

    async function loadStudentProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.warn('Unable to check Supabase auth session:', userError.message)
      }

      if (!isMounted) {
        return
      }

      if (user) {
        const { data, error } = await supabase
          .from('students')
          .select('id, student_number, name, program, section, phone_number, email_address, current_location')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) {
          console.warn('Unable to load the signed-in student profile:', error.message)
        }

        if (!isMounted) {
          return
        }

        if (data) {
          applyStudentProfile(data)

          const { data: records, error: recordsError } = await supabase
            .from('attendance_logs')
            .select('date, status')
            .eq('student_id', data.id)
            .order('date', { ascending: true })

          if (recordsError) {
            console.warn('Unable to load the signed-in student attendance logs:', recordsError.message)
            return
          }

          if (isMounted) {
            applyCalendarRecords(records ?? [])
          }

          return
        }
      }

      const { data, error } = await supabase.rpc('get_latest_student_profile').maybeSingle()

      if (error) {
        console.warn('Unable to load the development student profile:', error.message)
        return
      }

      if (!isMounted || !data) {
        return
      }

      applyStudentProfile(data)

      const { data: records, error: recordsError } = await supabase.rpc('get_latest_student_attendance_logs')

      if (recordsError) {
        console.warn('Unable to load the development student attendance logs:', recordsError.message)
        return
      }

      if (isMounted) {
        applyCalendarRecords(records ?? [])
      }
    }

    loadStudentProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const openProfile = () => {
    window.location.hash = 'profile'
    setCurrentPage('profile')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.hash = ''
    setCurrentPage('dashboard')
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
