## Plan: Finish Coordinator and Admin Modules

  

### Goal

Make the coordinator and admin modules both functional, role-aware, and properly separated while sharing the same foundation. The coordinator module should become complete for its scoped responsibilities, and the admin module should move from mock-driven UI to real Supabase-backed workflows.

  

### 1. Establish the shared foundation

- Create a common auth-and-role layer for both modules.

- Standardize how each module resolves the current user, profile, role, and assigned scope.

- Reuse shared UI primitives such as layout, tables, forms, filters, modals, and cards.

- Centralize Supabase access through the existing server/client wrappers instead of duplicating queries in pages.

  

### 2. Resolve the schema gaps first

- Add the missing academic structure to the database model before wiring the admin UI to live data.

- Introduce the following tables and relationships:

- school_years: id, name, start_date, end_date, is_active, created_at, updated_at

- semesters: id, school_year_id, name, start_date, end_date, is_active, created_at, updated_at

- academic_terms (optional if we want a more flexible model): id, school_year_id, semester_id, name, status

- Link existing admin screens to those tables instead of relying on hardcoded years/semesters.

- Keep the current programs and sections tables, but ensure they can be queried by school_year and semester through the admin services.

  

### 3. Complete the coordinator module first

- Replace incomplete service logic with real, role-scoped business rules.

- Ensure coordinator queries only return data within assigned programs/sections.

- Implement missing workflows for dashboard metrics, attendance summaries, student records, schedules, registrations, and rejections.

- Remove debug logging and temporary placeholder values.

- Add consistent error handling and empty-state behavior.

  

### 4. Replace admin mock data with real services

- Identify the admin screens that currently rely on mock datasets from files such as the admin dashboard and registration pages.

- Build real Supabase service functions for admin data retrieval and admin-only actions.

- Connect admin workflows to the same auth and role model used by the coordinator module.

- Implement broader admin views for system-wide oversight, assignments, approvals, and institutional reporting.

  

### 5. Separate responsibilities cleanly

- Keep coordinator logic scoped to assigned students, attendance, and coordinator-facing workflows.

- Keep admin logic scoped to system-wide governance, user/program/section oversight, and cross-module reporting.

- Avoid placing admin-specific business rules inside coordinator services and vice versa.

- Use shared services only for common infrastructure, not for role-specific behavior.

  

### 6. Reuse and repurpose components deliberately

- Retain shared components such as layout shells, tables, search bars, forms, and modals.

- Reuse data-mapping and type definitions across both modules.

- Repurpose existing dashboard and list-style components so they support both role contexts.

- Remove or replace outdated mock-driven components once real services are wired in.

  

### 7. Define completion criteria

- Coordinator complete when its pages work with real Supabase data, enforce proper scope, and support the expected workflows without placeholders.

- Admin complete when its pages load live data, support admin actions, and no longer depend on mock data for core functionality.

- Separation is correct when each module only exposes the data and actions appropriate to its role and when shared code is infrastructure-only.

  

### Schema-first implementation sequence

1. Create the academic schema objects in Supabase:

- school_years

- semesters

- optional link columns to programs/sections or students if needed

2. Add RLS policies for the new tables so admin users can manage them and coordinators can read the active academic context.

3. Create admin services for academic data access in a new folder such as lib/services/admin/academic.ts.

4. Replace mock values in the admin registration and archive pages with live queries from those services.

5. Rework the UI types so they use the new schema fields rather than the current ad-hoc mock shape.

6. Verify that the admin screens can list, filter, and update academic years and semesters from Supabase.

  

### Answers to the key questions

  

#### What does coordinator lack?

- Real business-rule coverage for its workflows.

- Cleaner service abstraction and better role enforcement.

- Full data completeness for attendance, student records, schedules, and registration handling.

- Removal of placeholder values and debug output.

  

#### What does admin lack?

- Real Supabase-backed services.

- Live data retrieval for dashboards and management screens.

- Admin-specific actions and authorization rules.

- Replacement of mock datasets with actual system data.

  

#### How are they connected?

- They share the same authentication, session, Supabase client layer, UI primitives, and overall app structure.

- They should also share common types and some reusable component patterns.

  

#### What do they currently share?

- The same app shell and routing structure.

- Shared frontend components such as tables, forms, search, and modal patterns.

- The same Supabase client foundation.

  

#### How different should they be?

- They should differ mainly in scope and permissions.

- Coordinator views should be narrower and assignment-based.

- Admin views should be broader and system-wide.

  

#### What should be retained, removed, reused, or repurposed?

- Retain: shared layout, forms, tables, search, modal patterns, and common types.

- Remove: hardcoded mock data usage, placeholder UI logic, and debug-only code.

- Reuse: the existing Supabase service architecture and shared data mapping helpers.

- Repurpose: dashboard cards, list components, and management screens so they can fit both roles with different data sources.

  

#### How can we tell if coordinator is complete?

- All expected pages load real data from Supabase.

- Access is limited to the coordinator’s assigned scope.

- Core workflows succeed without placeholders or manual mock fallback.

- Error states and empty states behave properly.

  

#### How can we tell if admin is complete?

- Admin screens are populated from live Supabase data.

- Admin-only actions work end to end.

- The module supports broad oversight and management without mock records.

- Role checks prevent unauthorized access.

  

#### How can we tell if we properly separated them?

- Coordinator services do not contain admin-only business rules.

- Admin services do not rely on coordinator-specific assumptions.

- Shared code is limited to infrastructure and presentation, not role-specific logic.

- A coordinator account cannot perform admin-only actions, and an admin account can access the broader system view.
