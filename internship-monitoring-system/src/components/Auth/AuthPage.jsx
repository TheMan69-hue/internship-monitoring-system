import { useMemo, useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import './AuthPage.css'

function AuthPage({
  authMode,
  authUser,
  authNotice,
  onSignIn,
  onSignUp,
  onGoogleSignIn,
  onForgotPassword,
  onCompleteProfile,
  onSwitchToSignIn,
  onSwitchToSignUp,
  isBusy,
}) {
  const [email, setEmail] = useState(authUser?.email ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [fullName, setFullName] = useState(authUser?.user_metadata?.full_name ?? '')
  const [studentNumber, setStudentNumber] = useState('')
  
  const [programsList, setProgramsList] = useState([])
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false)

  const [sectionsList, setSectionsList] = useState([])
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [isLoadingSections, setIsLoadingSections] = useState(false)

  const [selectedHteId, setSelectedHteId] = useState('')
  const [hteCompaniesList, setHteCompaniesList] = useState([])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [formMessage, setFormMessage] = useState('')

  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoadingPrograms(true)
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('id, program_name')
          .order('program_name', { ascending: true })

        if (error) throw error

        setProgramsList(data ?? [])
      } catch (err) {
        console.warn('Failed to fetch programs:', err)
      } finally {
        setIsLoadingPrograms(false)
      }
    }

    fetchPrograms()

    const fetchHteCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('hte_companies')
          .select('id, company_name')
          .order('company_name', { ascending: true })

        if (error) throw error

        if (data) {
          setHteCompaniesList(data)

          if (data.length > 0 && !selectedHteId) {
            setSelectedHteId(data[0].id)
          }
        }
      } catch (err) {
        console.warn('Failed to fetch HTE companies:', err)
      }
    }

    fetchHteCompanies()
  }, [])

  useEffect(() => {
    if (!selectedProgramId) {
      setSectionsList([])
      setSelectedSectionId('')
      return
    }

    const fetchSections = async () => {
      setIsLoadingSections(true)
      try {
        const { data, error } = await supabase
          .from('sections')
          .select('id, section_name')
          .eq('program_id', selectedProgramId)
          .order('section_name', { ascending: true })

        if (error) throw error
        setSectionsList(data ?? [])
      } catch (err) {
        console.warn('Failed to fetch sections:', err)
        setSectionsList([])
      } finally {
        setIsLoadingSections(false)
      }
    }

    fetchSections()
  }, [selectedProgramId])

  const title = useMemo(() => {
    if (authMode === 'sign-up') {
      return 'CREATE YOUR ACCOUNT'
    }

    if (authMode === 'onboarding') {
      return 'COMPLETE YOUR PROFILE'
    }

    return 'LOG IN YOUR ACCOUNT'
  }, [authMode])

  const handleProgramChange = (e) => {
    setSelectedProgramId(e.target.value)
    setSelectedSectionId('')
  }

  const handleSignInSubmit = async (event) => {
    event.preventDefault()
    setFormMessage('')

    if (!email || !password) {
      setFormMessage('Email and password are required.')
      return
    }

    await onSignIn({ email, password, setFormMessage })
  }

  const handleSignUpSubmit = async (event) => {
    event.preventDefault()
    setFormMessage('')

    const selectedProgramObj = programsList.find((p) => p.id === selectedProgramId)
    const selectedSectionObj = sectionsList.find((s) => s.id === selectedSectionId)
    const selectedHteObj = hteCompaniesList.find((h) => h.id === selectedHteId)

    if (
      !fullName ||
      !studentNumber ||
      !selectedProgramId ||
      !selectedSectionId ||
      !selectedHteId ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setFormMessage('Please complete all required fields.')
      return
    }

    if (password !== confirmPassword) {
      setFormMessage('Passwords do not match.')
      return
    }

    await onSignUp({
      email,
      password,
      fullName,
      studentNumber,
      program: selectedProgramObj?.program_name ?? '',
      programId: selectedProgramId,
      section: selectedSectionObj?.section_name ?? '',
      sectionId: selectedSectionId,
      hte: selectedHteObj?.company_name ?? '',
      hteId: selectedHteId,
      phoneNumber,
      setFormMessage,
    })
  }

  const handleOnboardingSubmit = async (event) => {
    event.preventDefault()
    setFormMessage('')

    const selectedProgramObj = programsList.find((p) => p.id === selectedProgramId)
    const selectedSectionObj = sectionsList.find((s) => s.id === selectedSectionId)
    const selectedHteObj = hteCompaniesList.find((h) => h.id === selectedHteId)

    if (!fullName || !studentNumber || !selectedProgramId || !selectedSectionId || !selectedHteId || !email) {
      setFormMessage('Please complete all required fields.')
      return
    }

    await onCompleteProfile({
      email,
      fullName,
      studentNumber,
      program: selectedProgramObj?.program_name ?? '',
      programId: selectedProgramId,
      section: selectedSectionObj?.section_name ?? '',
      sectionId: selectedSectionId,
      hte: selectedHteObj?.company_name ?? '',
      hteId: selectedHteId,
      phoneNumber,
      setFormMessage,
    })
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setFormMessage('Enter your email first so we can send the reset link.')
      return
    }

    await onForgotPassword({ email, setFormMessage })
  }

  const isSignIn = authMode === 'sign-in'
  const isSignUp = authMode === 'sign-up'
  const isOnboarding = authMode === 'onboarding'

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-label="Student authentication">
        {isSignUp || isOnboarding ? (
          <button
            type="button"
            className="auth-back-button"
            onClick={onSwitchToSignIn}
            aria-label="Back to login page"
          >
            ← Back to Login
          </button>
        ) : null}

        <h1>{title}</h1>

        {authNotice ? (
          <p className="auth-message" role="status">
            {authNotice}
          </p>
        ) : null}

        {isSignIn ? (
          <form className="auth-form" onSubmit={handleSignInSubmit}>
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />

            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />

            <button type="button" className="auth-link" onClick={handleForgotPassword} disabled={isBusy}>
              Forgot My Password
            </button>

            <button type="submit" className="auth-button" disabled={isBusy}>
              {isBusy ? 'PROCESSING...' : 'LOG IN'}
            </button>

            <p className="auth-divider">or</p>

            <button type="button" className="auth-button auth-button--google" onClick={onGoogleSignIn} disabled={isBusy}>
              <span className="auth-google-dot" aria-hidden="true" />
              Continue with Google
            </button>

            {formMessage ? (
              <p className="auth-message" role="status">
                {formMessage}
              </p>
            ) : null}
          </form>
        ) : null}

        {isSignUp ? (
          <form className="auth-form" onSubmit={handleSignUpSubmit}>
            <label htmlFor="sign-up-name">Full Name</label>
            <input id="sign-up-name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} />

            <label htmlFor="sign-up-number">Student Number</label>
            <input
              id="sign-up-number"
              type="text"
              value={studentNumber}
              onChange={(event) => setStudentNumber(event.target.value)}
            />

            <label htmlFor="sign-up-program">Program</label>
            <select
              id="sign-up-program"
              value={selectedProgramId}
              onChange={handleProgramChange}
              disabled={isLoadingPrograms}
            >
              <option value="">
                {isLoadingPrograms ? 'Loading programs...' : '-- Select program --'}
              </option>
              {programsList.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.program_name}
                </option>
              ))}
            </select>

            <label htmlFor="sign-up-section">Section</label>
            <select
              id="sign-up-section"
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
              disabled={!selectedProgramId || isLoadingSections || sectionsList.length === 0}
            >
              <option value="">
                {!selectedProgramId
                  ? '-- Select a program first --'
                  : isLoadingSections
                  ? 'Loading sections...'
                  : sectionsList.length === 0
                  ? '-- No sections available --'
                  : '-- Select section --'}
              </option>
              {sectionsList.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.section_name}
                </option>
              ))}
            </select>

            <label htmlFor="sign-up-hte">HTE</label>
            <select 
              id="sign-up-hte" 
              value={selectedHteId} 
              onChange={(event) => setSelectedHteId(event.target.value)}
            >
              <option value="">-- Select HTE Company --</option>
              {hteCompaniesList.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>

            <label htmlFor="sign-up-email">Email Address</label>
            <input
              id="sign-up-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />

            <label htmlFor="sign-up-phone">Phone Number (Optional)</label>
            <input
              id="sign-up-phone"
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Optional"
            />

            <label htmlFor="sign-up-password">Password</label>
            <div className="auth-password-field">
              <input id="sign-up-password" type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
              <button type="button" className="auth-password-toggle" onClick={() => setIsPasswordVisible((visible) => !visible)}>{isPasswordVisible ? 'Hide' : 'Show'}</button>
            </div>

            <label htmlFor="sign-up-confirm-password">Confirm Password</label>
            <div className="auth-password-field">
              <input id="sign-up-confirm-password" type={isPasswordVisible ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
              <button type="button" className="auth-password-toggle" onClick={() => setIsPasswordVisible((visible) => !visible)}>{isPasswordVisible ? 'Hide' : 'Show'}</button>
            </div>

            <button type="submit" className="auth-button" disabled={isBusy}>
              {isBusy ? 'PROCESSING...' : 'CREATE ACCOUNT'}
            </button>

            {formMessage ? (
              <p className="auth-message" role="status">
                {formMessage}
              </p>
            ) : null}
          </form>
        ) : null}

        {isOnboarding ? (
          <form className="auth-form" onSubmit={handleOnboardingSubmit}>
            <label htmlFor="onboarding-name">Full Name</label>
            <input
              id="onboarding-name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />

            <label htmlFor="onboarding-number">Student Number</label>
            <input
              id="onboarding-number"
              type="text"
              value={studentNumber}
              onChange={(event) => setStudentNumber(event.target.value)}
            />

            <label htmlFor="onboarding-program">Program</label>
            <select
              id="onboarding-program"
              value={selectedProgramId}
              onChange={handleProgramChange}
              disabled={isLoadingPrograms}
            >
              <option value="">
                {isLoadingPrograms ? 'Loading programs...' : '-- Select program --'}
              </option>
              {programsList.map((option) => (
                <option key={`onboarding-${option.id}`} value={option.id}>
                  {option.program_name}
                </option>
              ))}
            </select>

            <label htmlFor="onboarding-section">Section</label>
            <select
              id="onboarding-section"
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
              disabled={!selectedProgramId || isLoadingSections || sectionsList.length === 0}
            >
              <option value="">
                {!selectedProgramId
                  ? '-- Select a program first --'
                  : isLoadingSections
                  ? 'Loading sections...'
                  : sectionsList.length === 0
                  ? '-- No sections available --'
                  : '-- Select section --'}
              </option>
              {sectionsList.map((option) => (
                <option key={`onboarding-${option.id}`} value={option.id}>
                  {option.section_name}
                </option>
              ))}
            </select>

            <label htmlFor="onboarding-hte">HTE</label>
            <select 
              id="onboarding-hte" 
              value={selectedHteId} 
              onChange={(event) => setSelectedHteId(event.target.value)}
            >
              <option value="">-- Select HTE Company --</option>
              {hteCompaniesList.map((company) => (
                <option key={`onboard-hte-${company.id}`} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
            <label htmlFor="onboarding-email">Email Address</label>
            <input
              id="onboarding-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />

            <label htmlFor="onboarding-phone">Phone Number (Optional)</label>
            <input
              id="onboarding-phone"
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Optional"
            />

            <button type="submit" className="auth-button" disabled={isBusy}>
              {isBusy ? 'SAVING...' : 'SAVE PROFILE'}
            </button>

            {formMessage ? (
              <p className="auth-message" role="status">
                {formMessage}
              </p>
            ) : null}
          </form>
        ) : null}

        {isOnboarding ? null : (
          <p className="auth-switch">
            {isSignIn ? 'No account? ' : 'Already have an account? '}
            <button
              type="button"
              className="auth-link"
              onClick={isSignIn ? onSwitchToSignUp : onSwitchToSignIn}
            >
              {isSignIn ? 'Create account' : 'Log in'}
            </button>
          </p>
        )}
      </section>
    </main>
  )
}

export default AuthPage
