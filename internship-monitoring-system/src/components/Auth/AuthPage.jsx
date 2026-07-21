import { useMemo, useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import './AuthPage.css'

const DIGIT_OPTIONS = ['1', '2', '3', '4', '5']

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
  const [program, setProgram] = useState('')
  const [programOptions, setProgramOptions] = useState([])
  const [sectionYear, setSectionYear] = useState('1')
  const [sectionGroup, setSectionGroup] = useState('1')
  const [hte, setHte] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [formMessage, setFormMessage] = useState('')

  const [hteCompaniesList, setHteCompaniesList] = useState([])

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data, error } = await supabase.from('programs').select('program_name').order('program_name')
        if (error) throw error

        const names = (data ?? []).map((item) => item.program_name).filter(Boolean)
        setProgramOptions(names)
        if (names.length > 0) setProgram((current) => current || names[0])
      } catch (err) {
        console.warn('Failed to fetch programs:', err)
      }
    }

    fetchPrograms()

    const fetchHteCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('hte_companies')
          .select('company_name')
          .order('company_name', { ascending: true })

        if (error) throw error

        if (data) {
          const names = data.map(item => item.company_name)
          setHteCompaniesList(names)
          
          // Pre-select the first HTE in the list if empty
          if (names.length > 0 && !hte) {
            setHte(names[0])
          }
        }
      } catch (err) {
        console.warn('Failed to fetch HTE companies:', err)
      }
    }

    fetchHteCompanies()
  }, [])

  const section = `${program} ${sectionYear} - ${sectionGroup}`

  const title = useMemo(() => {
    if (authMode === 'sign-up') {
      return 'CREATE YOUR ACCOUNT'
    }

    if (authMode === 'onboarding') {
      return 'COMPLETE YOUR PROFILE'
    }

    return 'LOG IN YOUR ACCOUNT'
  }, [authMode])

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

    if (!fullName || !studentNumber || !program || !hte || !email || !phoneNumber || !password || !confirmPassword) {
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
      program,
      section,
      hte,
      phoneNumber,
      setFormMessage,
    })
  }

  const handleOnboardingSubmit = async (event) => {
    event.preventDefault()
    setFormMessage('')

    if (!fullName || !studentNumber || !program || !hte || !email || !phoneNumber) {
      setFormMessage('Please complete all required fields.')
      return
    }

    await onCompleteProfile({
      email,
      fullName,
      studentNumber,
      program,
      section,
      hte,
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
            <select id="sign-up-program" value={program} onChange={(event) => setProgram(event.target.value)}>
              <option value="">-- Select program --</option>
              {programOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label>Section</label>
            <div className="auth-section-picker">
              <span>{program}</span>
              <select value={sectionYear} onChange={(event) => setSectionYear(event.target.value)}>
                {DIGIT_OPTIONS.map((option) => (
                  <option key={`year-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span>-</span>
              <select value={sectionGroup} onChange={(event) => setSectionGroup(event.target.value)}>
                {DIGIT_OPTIONS.map((option) => (
                  <option key={`group-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <label htmlFor="sign-up-hte">HTE</label>
            <select 
              id="sign-up-hte" 
              value={hte} 
              onChange={(event) => setHte(event.target.value)}
            >
              <option value="">-- Select HTE Company --</option>
              {hteCompaniesList.map((company) => (
                <option key={company} value={company}>
                  {company}
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

            <label htmlFor="sign-up-phone">Phone Number</label>
            <input
              id="sign-up-phone"
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
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
            <select id="onboarding-program" value={program} onChange={(event) => setProgram(event.target.value)}>
              <option value="">-- Select program --</option>
              {programOptions.map((option) => (
                <option key={`onboarding-${option}`} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label>Section</label>
            <div className="auth-section-picker">
              <span>{program}</span>
              <select value={sectionYear} onChange={(event) => setSectionYear(event.target.value)}>
                {DIGIT_OPTIONS.map((option) => (
                  <option key={`onboarding-year-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span>-</span>
              <select value={sectionGroup} onChange={(event) => setSectionGroup(event.target.value)}>
                {DIGIT_OPTIONS.map((option) => (
                  <option key={`onboarding-group-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <label htmlFor="onboarding-hte">HTE</label>
            <select 
              id="onboarding-hte" 
              value={hte} 
              onChange={(event) => setHte(event.target.value)}
            >
              <option value="">-- Select HTE Company --</option>
              {hteCompaniesList.map((company) => (
                <option key={`onboard-hte-${company}`} value={company}>
                  {company}
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

            <label htmlFor="onboarding-phone">Phone Number</label>
            <input
              id="onboarding-phone"
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
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
