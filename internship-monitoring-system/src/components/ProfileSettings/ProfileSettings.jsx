import { useState } from 'react'
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

function ProfileSettings({ activePanel, onPanelChange, onLogout, onSaveProfile, studentProfile }) {
  const isProfilePanel = activePanel === 'profile'
  const hte = studentProfile.hte ?? {}
  const [formValue, setFormValue] = useState({
    name: studentProfile.name ?? '',
    phoneNumber: studentProfile.phoneNumber ?? '',
    emailAddress: studentProfile.emailAddress ?? '',
  })
  const [editingField, setEditingField] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const hteRows = [
    ['Name', hte.name],
    ['Address', hte.address],
    ['Time Completion', hte.timeCompletion],
    ['Work Schedule', hte.workSchedule],
    ['Working Time (Daily)', hte.workingTime],
  ]

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
    setSaveMessage('')

    try {
      await onSaveProfile({
        name: formValue.name.trim(),
        phoneNumber: formValue.phoneNumber.trim(),
        emailAddress: formValue.emailAddress.trim(),
      })

      setSaveMessage('Profile saved successfully.')
    } catch (error) {
      setSaveMessage(error?.message || 'Unable to save profile changes.')
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

  return (
    <main className="profile-settings-shell">
      <aside className="profile-sidebar" aria-label="Profile settings navigation">
        <div className="profile-sidebar__identity">
          <div className="profile-sidebar__avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path d={avatarPath} />
            </svg>
          </div>
          <strong>{studentProfile.name}</strong>
        </div>

        <nav className="profile-tabs" aria-label="Profile sections">
          <button
            type="button"
            className={isProfilePanel ? 'profile-tabs__button profile-tabs__button--active' : 'profile-tabs__button'}
            onClick={() => onPanelChange('profile')}
          >
            Profile
          </button>
          <button
            type="button"
            className={!isProfilePanel ? 'profile-tabs__button profile-tabs__button--active' : 'profile-tabs__button'}
            onClick={() => onPanelChange('hte')}
          >
            HTE
          </button>
        </nav>

        <button type="button" className="profile-logout" onClick={onLogout}>
          <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
            <path d="M4 3.5h8v2H6v13h6v2H4v-17Zm12.3 4.2 5.1 5.1-5.1 5.1-1.4-1.4 2.7-2.7H10v-2h7.6l-2.7-2.7 1.4-1.4Z" />
          </svg>
          <span>Log Out</span>
        </button>
      </aside>

      <section className="profile-settings-content" aria-label={isProfilePanel ? 'Profile details' : 'HTE details'}>
        <div className="profile-detail-card">
          <h1>{isProfilePanel ? 'Profile Details' : 'HTE Details'}</h1>
          {isProfilePanel ? (
            <form className="profile-detail-form" onSubmit={handleSave}>
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
                {saveMessage ? <p className="profile-save-status" role="status">{saveMessage}</p> : null}
              </div>
            </form>
          ) : (
            <div className="profile-detail-list">
              {hteRows.map(([label, value]) => (
                <DetailRow key={label} label={label} value={value} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default ProfileSettings
