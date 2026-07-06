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

function ProfileSettings({ activePanel, onPanelChange, onLogout, studentProfile }) {
  const isProfilePanel = activePanel === 'profile'
  const hte = studentProfile.hte ?? {}

  const profileRows = [
    ['Name', studentProfile.name],
    ['Student Number', studentProfile.studentNumber],
    ['Program', studentProfile.program],
    ['Section', studentProfile.section],
    ['Phone Number', studentProfile.phoneNumber],
    ['Email Address', studentProfile.emailAddress],
  ]

  const hteRows = [
    ['Name', hte.name],
    ['Address', hte.address],
    ['Time Completion', hte.timeCompletion],
    ['Work Schedule', hte.workSchedule],
    ['Working Time (Daily)', hte.workingTime],
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
          <strong>{studentProfile.role}</strong>
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
          <div className="profile-detail-list">
            {(isProfilePanel ? profileRows : hteRows).map(([label, value]) => (
              <DetailRow key={label} label={label} value={value} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default ProfileSettings
