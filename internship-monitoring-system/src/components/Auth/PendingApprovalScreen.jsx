import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../supabaseClient'
import './PendingApprovalScreen.css'

/**
 * PendingApprovalScreen
 *
 * Displayed to students who signed up with a non-CvSU email and whose
 * registration status is still 'Pending' in the student_registrations table.
 *
 * Features:
 * - Shows the required review message.
 * - "Check Status" button for manual status re-fetch.
 * - Supabase Realtime subscription that auto-redirects when the OJT Coordinator
 *   approves the registration (status changes to 'Approved').
 */
function PendingApprovalScreen({ userEmail, onApproved, onSignOut }) {
  const [statusMessage, setStatusMessage] = useState('Listening for updates from your OJT Coordinator...')
  const [statusType, setStatusType] = useState('idle') // 'idle' | 'checking' | 'approved' | 'error'
  const [isChecking, setIsChecking] = useState(false)
  const channelRef = useRef(null)

  // ── Realtime subscription ────────────────────────────────────────────────────
  useEffect(() => {
    if (!userEmail) return

    const channel = supabase
      .channel('pending-approval-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'student_registrations',
          filter: `email_address=eq.${userEmail}`,
        },
        (payload) => {
          const newStatus = payload.new?.status
          if (newStatus === 'Approved') {
            setStatusMessage('✅ Your registration has been approved! Redirecting to dashboard...')
            setStatusType('approved')
            // Give the user a moment to read the message, then redirect
            setTimeout(() => {
              if (onApproved) onApproved()
            }, 2000)
          } else if (newStatus === 'Rejected') {
            setStatusMessage('Your registration was not approved. Please contact your OJT Coordinator.')
            setStatusType('error')
          }
        },
      )
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === 'SUBSCRIBED') {
          setStatusMessage('Listening for updates from your OJT Coordinator...')
          setStatusType('idle')
        } else if (subscribeStatus === 'CHANNEL_ERROR') {
          setStatusMessage('Unable to connect to real-time updates. Use the button below to check manually.')
          setStatusType('error')
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userEmail, onApproved])

  // ── Manual status check ──────────────────────────────────────────────────────
  async function handleCheckStatus() {
    if (!userEmail || isChecking) return

    setIsChecking(true)
    setStatusType('checking')
    setStatusMessage('Checking your registration status...')

    try {
      const { data, error } = await supabase
        .from('student_registrations')
        .select('status')
        .eq('email_address', userEmail)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        setStatusMessage('No registration record found. Please contact your OJT Coordinator.')
        setStatusType('error')
        return
      }

      if (data.status === 'Approved') {
        setStatusMessage('✅ Your registration has been approved! Redirecting to dashboard...')
        setStatusType('approved')
        setTimeout(() => {
          if (onApproved) onApproved()
        }, 2000)
      } else if (data.status === 'Rejected') {
        setStatusMessage('Your registration was not approved. Please contact your OJT Coordinator.')
        setStatusType('error')
      } else {
        setStatusMessage(`Status: ${data.status}. Still waiting for OJT Coordinator approval.`)
        setStatusType('idle')
      }
    } catch (err) {
      console.warn('Error checking registration status:', err)
      setStatusMessage('Unable to check status right now. Please try again.')
      setStatusType('error')
    } finally {
      setIsChecking(false)
    }
  }

  // ── Status icon helper ───────────────────────────────────────────────────────
  function getStatusIcon() {
    if (statusType === 'checking') return '🔄'
    if (statusType === 'approved') return '✅'
    if (statusType === 'error') return '⚠️'
    return '📡'
  }

  return (
    <main className="pending-shell">
      <div className="pending-card">
        {/* Icon */}
        <div className="pending-icon-wrapper" aria-hidden="true">
          <span className="pending-icon">⏳</span>
        </div>

        {/* Badge */}
        <div className="pending-badge">
          <span className="pending-badge-dot" aria-hidden="true" />
          Pending Approval
        </div>

        {/* Title */}
        <h1 className="pending-title">Under Review</h1>

        {/* Required message */}
        <p className="pending-message">
          Your registration is currently under review by your OJT Coordinator.
          You will gain access to the dashboard once approved.
        </p>

        {/* Realtime status feedback */}
        <div className="pending-status-area" role="status" aria-live="polite">
          <span className="pending-status-icon" aria-hidden="true">{getStatusIcon()}</span>
          <span className={`pending-status-text${statusType === 'checking' ? ' is-checking' : ''}${statusType === 'approved' ? ' is-approved' : ''}${statusType === 'error' ? ' is-error' : ''}`}>
            {statusMessage}
          </span>
        </div>

        {/* Actions */}
        <div className="pending-actions">
          <button
            id="pending-check-status-btn"
            className="pending-btn pending-btn--primary"
            onClick={handleCheckStatus}
            disabled={isChecking || statusType === 'approved'}
            aria-label="Check your registration status"
          >
            {isChecking ? 'Checking...' : '🔍 Check Status'}
          </button>

          <div className="pending-divider">or</div>

          <button
            id="pending-sign-out-btn"
            className="pending-btn pending-btn--ghost"
            onClick={onSignOut}
            disabled={statusType === 'approved'}
            aria-label="Sign out of your account"
          >
            Sign Out
          </button>
        </div>

        {/* Realtime note */}
        <p className="pending-realtime-note" aria-hidden="true">
          <span className="pending-realtime-dot" />
          Real-time updates active — you&apos;ll be redirected automatically when approved
        </p>
      </div>
    </main>
  )
}

export default PendingApprovalScreen
