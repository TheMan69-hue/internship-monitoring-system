# Project Feature Summary

## Authentication and Account Access

- Email and password sign-in — Students can log in with their registered email address and password.
- Student account registration — Students can create an account by providing their identity, academic, contact, and host-training-establishment information.
- Email verification flow — Newly registered students without an active session are directed to verify their email before logging in.
- Google sign-in — Students can authenticate through a Google account.
- Password reset — Students can request a password-reset link by email.
- Profile-completion onboarding — Authenticated users without a student profile must complete their required profile details before accessing the dashboard.
- Logout — Students can end their active session from profile settings.

## Student and Internship Profile Management

- Student profile display — Students can view their student number, program, section, name, phone number, and email address.
- Editable personal details — Students can update their name, phone number, and email address.
- HTE profile management — Students can view and update their host training establishment's name, address, required completion time, work schedule, and daily working time.
- Program selection — Registration and onboarding present available academic programs from the system's program list.
- HTE company selection — Registration and onboarding present available host training establishments; the selected company's stored address is loaded into HTE details.
- Section assignment — Students can select a year and group combination to form their academic section.

## Attendance Recording

- GPS-assisted time-in — Students can record a daily time-in after granting location access; the system records the server timestamp, GPS coordinates, and a resolved location name.
- GPS-assisted time-out — Timed-in students can record a time-out, with its timestamp and GPS coordinates added to the same daily attendance record.
- Daily attendance records — The system maintains one attendance log per student per calendar day and prevents time-out before a valid time-in.
- Active attendance timer — After time-in, students see an elapsed-time counter and the interface retains their same-day timing state locally.
- Time-out availability countdown — The interface temporarily locks time-out after time-in and shows the remaining wait time.
- GPS status and location preview — The dashboard displays current location information when available and explains when GPS access is blocked or unavailable.

## Attendance Dashboard and Monitoring

- Monthly attendance calendar — Students can view the current month's calendar with attendance, current-day, day-off, and inferred-absence states.
- Work-schedule day-off calculation — The system derives non-working days from the HTE work-schedule text and reflects them in the calendar.
- Attendance-record details — Selecting a date with a record reveals its time-in, time-out, attendance status, and rendered duration.
- Internship-hours progress — Students can see total rendered hours, required hours, percentage complete, and remaining time based on completed attendance records and the HTE time-completion target.
- Live date and time display — The dashboard presents the current date and time while monitoring attendance.
