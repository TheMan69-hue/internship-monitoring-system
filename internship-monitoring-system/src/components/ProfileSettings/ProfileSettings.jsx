import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import './ProfileSettings.css'

const avatarPath =
  'M12 13.2c-3.2 0-5.8 2.6-5.8 5.8v1h11.6v-1c0-3.2-2.6-5.8-5.8-5.8Zm0-1.8a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z'

function DetailRow({ label, value }) {
  return (
    <div className="profile-detail-row">
      <span>{label}:</span>
      <strong>{value || '-'}</strong>
    </div>
  )
}

function EditableField({ label, name, value, onChange, type = 'text', onEdit, isEditing }) {
  return (
    <div className="profile-detail-row profile-detail-row--editable">
      <span>{label}:</span>
      {isEditing ? (
        <input
          className="profile-detail-row__input"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={name}
        />
      ) : (
        <strong>{value || '-'}</strong>
      )}
      <button type="button" className="profile-edit-button" onClick={onEdit} aria-label={`Edit ${label}`}>
        <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
          <path d="M3 17.3V21h3.7L18.8 8.9l-3.7-3.7L3 17.3Zm18-10.8a1 1 0 0 0 0-1.4l-2.1-2.1a1 1 0 0 0-1.4 0l-1.6 1.6 3.7 3.7 1.4-1.8Z" />
        </svg>
      </button>
    </div>
  )
}

function PasswordField({ label, name, value, onChange, type = 'password', autoComplete }) {
  return (
    <label className="profile-password-field" htmlFor={name}>
      <span>{label}</span>
      <input
        id={name}
        className="profile-password-field__input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
    </label>
  )
}

function ProfileSettings({
  activePanel,
  onOpenDashboard,
  onPanelChange,
  onLogout,
  onSaveProfile,
  onSaveHte,
  onChangePassword,
  studentProfile,
}) {
  const isProfilePanel = activePanel === 'profile'
  const isChangePasswordPanel = activePanel === 'change-password'
  const hte = studentProfile.hte ?? {}
  const [formValue, setFormValue] = useState({
    name: studentProfile.name ?? '',
    phoneNumber: studentProfile.phoneNumber ?? '',
    emailAddress: studentProfile.emailAddress ?? '',
  })
  const [passwordFormValue, setPasswordFormValue] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [hteFormValue, setHteFormValue] = useState({
    name: hte.name ?? '',
    address: hte.address ?? '',
    timeCompletion: hte.timeCompletion ?? '',
    workSchedule: hte.workSchedule ?? '',
    workingTime: hte.workingTime ?? '',
  })
  const [editingField, setEditingField] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [profileStatusMessage, setProfileStatusMessage] = useState('')
  const [passwordStatusMessage, setPasswordStatusMessage] = useState('')
  const [activeSemester, setActiveSemester] = useState(null)

  useEffect(() => {
    const fetchActiveSemester = async () => {
      try {
        // 1. Query semesters directly (avoids PostgREST join failure)
        const { data: semData, error: semError } = await supabase
          .from('semesters')
          .select('id, name, start_date, school_year_id')
          .eq('is_active', true)
          .maybeSingle()

        if (semError) {
          console.error('❌ [Semesters Query Error]:', semError.message)
          return
        }

        if (!semData) {
          console.warn('⚠️ [Semesters]: No row found with is_active = true')
          return
        }

        // 2. Extract year directly from start_date string (e.g., '2025-06-01' -> '2025')
        let dynamicYear = semData.start_date ? String(semData.start_date).split('-')[0] : ''

        // 3. Try fetching school_years table if school_year_id exists
        if (semData.school_year_id) {
          const { data: syData, error: syError } = await supabase
            .from('school_years')
            .select('*')
            .eq('id', semData.school_year_id)
            .maybeSingle()

          if (!syError && syData) {
            // Check common column names in school_years table
            dynamicYear = syData.year || syData.name || syData.school_year || dynamicYear
          } else if (syError) {
            console.warn('⚠️ [School Years RLS/Query Error]:', syError.message)
          }
        }

        // Format name (e.g. 'midyear' -> 'Midyear')
        const formattedName = semData.name
          ? String(semData.name).charAt(0).toUpperCase() + String(semData.name).slice(1)
          : ''

        setActiveSemester({
          name: formattedName,
          year: dynamicYear,
        })
      } catch (err) {
        console.error('❌ [fetchActiveSemester Exception]:', err)
      }
    }

    fetchActiveSemester()
  }, [])

  useEffect(() => {
    const fetchHteDetails = async () => {
      const studentHteName = typeof studentProfile.hte === 'object'
        ? studentProfile.hte?.name
        : studentProfile.hte

      if (!studentHteName) return

      try {
        const { data, error } = await supabase
          .from('hte_companies')
          .select('company_name, address')
          .eq('company_name', studentHteName)
          .single()

        if (error) throw error

        if (data) {
          setHteFormValue((prev) => ({
            ...prev,
            name: data.company_name,
            address: data.address || '',
          }))
        }
      } catch (err) {
        console.warn('Failed to fetch matched company details:', err)
      }
    }

    fetchHteDetails()
  }, [typeof studentProfile.hte === 'object' ? studentProfile.hte?.name : studentProfile.hte])

  const handleFieldChange = (event) => {
    const { name, value } = event.target

    setFormValue((previousValue) => ({
      ...previousValue,
      [name]: value,
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setProfileStatusMessage('')

    try {
      await onSaveProfile({
        name: formValue.name.trim(),
        phoneNumber: formValue.phoneNumber.trim(),
        emailAddress: formValue.emailAddress.trim(),
      })

      setProfileStatusMessage('Profile saved successfully.')
    } catch (error) {
      setProfileStatusMessage(error?.message || 'Unable to save profile changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target

    setPasswordFormValue((previousValue) => ({
      ...previousValue,
      [name]: value,
    }))
  }

  const handleOpenChangePasswordPanel = () => {
    setPasswordStatusMessage('')
    onPanelChange('change-password')
  }

  const handleCancelPasswordChange = () => {
    setPasswordFormValue({
      newPassword: '',
      confirmPassword: '',
    })
    setPasswordStatusMessage('')
    onPanelChange('profile')
  }

  const handlePasswordSave = async (event) => {
    event.preventDefault()
    setPasswordStatusMessage('')

    if (!passwordFormValue.newPassword || !passwordFormValue.confirmPassword) {
      setPasswordStatusMessage('Please fill out both password fields.')
      return
    }

    if (passwordFormValue.newPassword !== passwordFormValue.confirmPassword) {
      setPasswordStatusMessage('Passwords do not match.')
      return
    }

    setIsSaving(true)

    try {
      await onChangePassword(passwordFormValue.newPassword)
      setPasswordFormValue({
        newPassword: '',
        confirmPassword: '',
      })
      setProfileStatusMessage('Password updated successfully')
      onPanelChange('profile')
    } catch (error) {
      setPasswordStatusMessage(error?.message || 'Unable to update password.')
    } finally {
      setIsSaving(false)
    }
  }

  const editableRows = [
    {
      label: 'Name',
      name: 'name',
      value: formValue.name,
      type: 'text',
    },
    {
      label: 'Phone Number',
      name: 'phoneNumber',
      value: formValue.phoneNumber,
      type: 'tel',
    },
    {
      label: 'Email Address',
      name: 'emailAddress',
      value: formValue.emailAddress,
      type: 'email',
    },
  ]

  const hteEditableRows = [
    {
      label: 'Name',
      name: 'name',
      value: hteFormValue.name,
      type: 'text',
    },
    {
      label: 'Address',
      name: 'address',
      value: hteFormValue.address,
      type: 'text',
    },
    {
      label: 'Time Completion',
      name: 'timeCompletion',
      value: hteFormValue.timeCompletion,
      type: 'text',
    },
    {
      label: 'Work Schedule',
      name: 'workSchedule',
      value: hteFormValue.workSchedule,
      type: 'text',
    },
    {
      label: 'Working Time (Daily)',
      name: 'workingTime',
      value: hteFormValue.workingTime,
      type: 'text',
    },
  ]

  const handleHteFieldChange = (event) => {
    const { name, value } = event.target

    setHteFormValue((previousValue) => ({
      ...previousValue,
      [name]: value,
    }))
  }

  const handleHteSave = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setSaveMessage('')

    try {
      await onSaveHte({
        name: hteFormValue.name.trim(),
        address: hteFormValue.address.trim(),
        timeCompletion: hteFormValue.timeCompletion.trim(),
        workSchedule: hteFormValue.workSchedule.trim(),
        workingTime: hteFormValue.workingTime.trim(),
      })

      setSaveMessage('HTE details saved successfully.')
    } catch (error) {
      setSaveMessage(error?.message || 'Unable to save HTE details.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="profile-settings-shell">
      <aside className="profile-sidebar" aria-label="Profile settings navigation">
        <div className="profile-sidebar__identity">
          <strong>{studentProfile.name || 'Student'}</strong>
          <span>Student</span>
        </div>

        <nav className="profile-tabs" aria-label="Profile sections">
          <button type="button" className="profile-tabs__button" onClick={onOpenDashboard}>
            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
              <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
            </svg>
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            className={isProfilePanel ? 'profile-tabs__button profile-tabs__button--active' : 'profile-tabs__button'}
            onClick={() => onPanelChange('profile')}
          >
            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
              <path d={avatarPath} />
            </svg>
            <span>Profile</span>
          </button>
          <button
            type="button"
            className={!isProfilePanel ? 'profile-tabs__button profile-tabs__button--active' : 'profile-tabs__button'}
            onClick={() => onPanelChange('hte')}
          >
            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
              <path d="M5 20V7l7-4 7 4v13h-5v-5H10v5H5Zm3-9h2V9H8v2Zm0 3h2v-2H8v2Zm6-3h2V9h-2v2Zm0 3h2v-2h-2v2Z" />
            </svg>
            <span>HTE Details</span>
          </button>
        </nav>

        <button type="button" className="profile-logout" onClick={onLogout}>
          <span className="profile-logout__avatar" aria-hidden="true">{studentProfile.name?.trim()?.charAt(0)?.toUpperCase() || 'S'}</span>
          <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
            <path d="M4 3.5h8v2H6v13h6v2H4v-17Zm12.3 4.2 5.1 5.1-5.1 5.1-1.4-1.4 2.7-2.7H10v-2h7.6l-2.7-2.7 1.4-1.4Z" />
          </svg>
          <span>Log Out</span>
        </button>
      </aside>

      <section className="profile-main-area" aria-label={isProfilePanel ? 'Profile details' : 'HTE details'}>
        <header className="profile-page-header">
          <div>
            <h1>{isProfilePanel ? 'Profile Settings' : 'HTE Details'}</h1>
            <p>{isProfilePanel ? 'View and manage your account details' : 'View and manage your host training establishment details'}</p>
          </div>
          <div className="profile-header-meta">
            <span>Academic Year</span>
            <strong>
              {activeSemester
                ? `${(activeSemester.name || '').charAt(0).toUpperCase() + (activeSemester.name || '').slice(1)} ${activeSemester.school_years?.year || ''}`
                : '-'}
            </strong>
          </div>
        </header>

        <div className="profile-settings-content">
          <div className="profile-detail-card">
            {isProfilePanel ? (
              <form className="profile-detail-form" onSubmit={handleSave}>
                <h2>Profile Details</h2>
                <div className="profile-detail-list profile-detail-list--profile" aria-label="Profile details">
                  <DetailRow label="Student Number" value={studentProfile.studentNumber} />
                  <DetailRow label="Program" value={studentProfile.program} />
                  <DetailRow label="Section" value={studentProfile.section} />
                  {editableRows.map((row) => (
                    <EditableField
                      key={row.name}
                      label={row.label}
                      name={row.name}
                      value={row.value}
                      type={row.type}
                      onChange={handleFieldChange}
                      onEdit={() => setEditingField(row.name)}
                      isEditing={editingField === row.name}
                    />
                  ))}
                </div>

                <div className="profile-actions">
                  <button type="submit" className="profile-save" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="profile-change-password" onClick={handleOpenChangePasswordPanel}>
                    Change Password
                  </button>
                  {profileStatusMessage ? <p className="profile-save-status" role="status">{profileStatusMessage}</p> : null}
                </div>
              </form>
            ) : isChangePasswordPanel ? (
              <form className="profile-detail-form profile-detail-form--password" onSubmit={handlePasswordSave}>
                <h2>Change Password</h2>
                <p className="profile-panel-subtitle">Change Your Password</p>
                <div className="profile-password-card">
                  <div className="profile-password-fields">
                    <PasswordField
                      label="New Password"
                      name="newPassword"
                      value={passwordFormValue.newPassword}
                      onChange={handlePasswordFieldChange}
                      autoComplete="new-password"
                    />
                    <PasswordField
                      label="Confirm Password"
                      name="confirmPassword"
                      value={passwordFormValue.confirmPassword}
                      onChange={handlePasswordFieldChange}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="profile-actions">
                    <button type="submit" className="profile-save" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Confirm'}
                    </button>
                    <button type="button" className="profile-cancel" onClick={handleCancelPasswordChange}>
                      Cancel
                    </button>
                    {passwordStatusMessage ? <p className="profile-save-status" role="status">{passwordStatusMessage}</p> : null}
                  </div>
                </div>
              </form>
            ) : (
              <form className="profile-detail-form" onSubmit={handleHteSave}>
                <h2>HTE Details</h2>
                <div className="profile-detail-list profile-detail-list--profile" aria-label="HTE details">
                  {hteEditableRows.map((row) => (
                    <EditableField
                      key={row.name}
                      label={row.label}
                      name={row.name}
                      value={row.value}
                      type={row.type}
                      onChange={handleHteFieldChange}
                      onEdit={() => setEditingField(row.name)}
                      isEditing={editingField === row.name}
                    />
                  ))}
                </div>

                <div className="profile-actions">
                  <button type="submit" className="profile-save" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {profileStatusMessage ? <p className="profile-save-status" role="status">{profileStatusMessage}</p> : null}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default ProfileSettings
