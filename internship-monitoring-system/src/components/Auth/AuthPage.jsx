import { useMemo, useState } from 'react'
import './AuthPage.css'

const PROGRAM_OPTIONS = ['BSCS', 'BSIT', 'BSCpE', 'BSARCH', 'BSCE', 'BSEE', 'BSIE']
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
  const [fullName, setFullName] = useState(authUser?.user_metadata?.full_name ?? '')
  const [studentNumber, setStudentNumber] = useState('')
  const [program, setProgram] = useState(PROGRAM_OPTIONS[0])
  const [sectionYear, setSectionYear] = useState('1')
  const [sectionGroup, setSectionGroup] = useState('1')
  const [hte, setHte] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [formMessage, setFormMessage] = useState('')

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

    if (!fullName || !studentNumber || !program || !hte || !email || !phoneNumber || !password) {
      setFormMessage('Please complete all required fields.')
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
              {PROGRAM_OPTIONS.map((option) => (
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
            <input id="sign-up-hte" type="text" value={hte} onChange={(event) => setHte(event.target.value)} />

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
            <input
              id="sign-up-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />

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
              {PROGRAM_OPTIONS.map((option) => (
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
            <input id="onboarding-hte" type="text" value={hte} onChange={(event) => setHte(event.target.value)} />

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
