# HustleGrad Launch Architecture Report

## Current Diagnosis

The submitted brief mentioned a Java Spring Boot backend, but this repository currently runs a Node/Express API with PostgreSQL and a React frontend. The production refactor therefore improves the application that is actually present while preserving the same product behavior: student auth, marketplace browsing, listings, bookings, messaging, reviews, admin, and seller dashboards.

### High-Risk Issues Found

| Area | Finding | Launch Risk | Fix Applied |
| --- | --- | --- | --- |
| Authentication | Frontend trusted stale localStorage without server revalidation after refresh. | A presenter could appear logged in locally while the API rejects them, causing abrupt redirects. | Added `/api/auth/me`, auth bootstrap, global unauthorized event, friendly login notice, and longer configurable JWT lifetime. |
| API routing | `/api/listings/:id` was registered before `/api/listings/my/dashboard`. | Dashboard requests could be treated as listing id `my`. | Moved protected dashboard route before the dynamic id route. |
| User profiles | No `profile_picture_url` column or upload flow. | Profiles looked incomplete and could not persist avatars. | Added schema column, upload controller, storage adapter, and dashboard file picker. |
| Listings | No localized pickup/meeting data. | Listings lacked campus context. | Added constrained `campus_zone` field and frontend dropdown/filter. |
| Payments | No buyer-side payment story for the demo. | Buy flow felt unfinished. | Added high-fidelity M-PESA STK Push simulation and escrow success state. |
| Metrics | Seller metrics query risked duplicate counts through multi-joins. | Dashboard numbers could inflate as messages/bookings grew. | Replaced with aggregate subqueries using indexed columns. |
| Seed data | `schema.sql` had invalid trailing SQL and sparse data. | Database reset could fail before the presentation. | Rebuilt re-runnable schema with 15 realistic listings and demo accounts. |

## Clean Architecture Target

The codebase is now safer, but the ideal next step is to move from "routes/controllers/services" toward explicit Clean Architecture boundaries.

```text
hustlegrad/
  backend/
    src/
      domain/
        entities/
          Hustler.js
          Listing.js
          CampusZone.js
          EscrowPayment.js
        policies/
          canCreateListing.js
          canReleaseEscrow.js
      application/
        use-cases/
          AuthenticateSessionUseCase.js
          UpdateProfilePictureUseCase.js
          CreateListingUseCase.js
          SearchListingsUseCase.js
          GetSellerHustleMetricsUseCase.js
          ProcessMockEscrowPaymentUseCase.js
        ports/
          UserRepository.js
          ListingRepository.js
          ObjectStorage.js
      infrastructure/
        database/
          PostgresUserRepository.js
          PostgresListingRepository.js
        storage/
          LocalProfilePictureStorage.js
          SupabaseProfilePictureStorage.js
        http/
          controllers/
          routes/
          middleware/
      main/
        server.js
        container.js
  frontend/
    src/
      app/
        routes/
        providers/
      domain/
        types/
          listing.ts
          user.ts
          payment.ts
        constants/
          campusZones.ts
      features/
        auth/
        marketplace/
        dashboard/
        messaging/
        admin/
      shared/
        api/
        ui/
        hooks/
        styles/
```

## Boundary Responsibilities

### Domain Layer

Owns pure business concepts and rules. Examples: `Hustler`, `Listing`, `CampusZone`, and an `EscrowPayment` state machine. This layer should not import Express, React, PostgreSQL, Axios, or Supabase. It should answer questions like "is this campus zone valid?" and "can this seller update this listing?"

### Use Case Layer

Coordinates application actions such as `UpdateProfilePictureUseCase`, `CreateListingUseCase`, `SearchListingsUseCase`, and `ProcessMockEscrowPaymentUseCase`. Use cases depend on ports/interfaces, not concrete databases or storage providers. This removes duplicate validation and keeps controllers thin.

### Infrastructure / Adapter Layer

Implements the outside world: Express controllers, PostgreSQL repositories, JWT middleware, file storage, optional Supabase storage, and frontend UI components. These adapters translate external input into use-case requests and translate use-case results back to HTTP or UI state.

## Refactoring Strategy

1. Keep current routes stable and extract one use case at a time, starting with profile picture upload and listing creation.
2. Introduce repository modules for users, listings, messages, bookings, and metrics. Move raw SQL out of controllers.
3. Move campus zones into a shared constant or generated contract so backend validation and frontend dropdowns cannot drift.
4. Replace inline component state for large workflows with feature hooks such as `useListingsSearch`, `useSellerDashboard`, and `useProfilePictureUpload`.
5. Add integration tests around auth refresh, protected routes, listing creation, and seller metrics before deeper rewrites.
6. If migrating to Spring Boot later, map the same boundaries to packages: `domain`, `application`, `infrastructure.persistence`, `infrastructure.web`, and `configuration`.

## Production Notes

- For millions of users, move profile images from local disk to Supabase Storage or S3-compatible object storage behind the same `ObjectStorage` port.
- Keep listing search indexed with PostgreSQL full text search initially; graduate to OpenSearch only when ranking, typo tolerance, or analytics demand it.
- Add pagination to marketplace search before production traffic. The current demo query orders all matching listings.
- Use short-lived access tokens plus refresh tokens for real production. The current configurable seven-day JWT improves demo stability but is not the final auth model.
- Add row-level authorization tests for every booking, message, listing, and admin action.

## What Improved Now

The launch branch now has session revalidation, route guards that fail gracefully, profile picture persistence, campus-local listing metadata, realistic M-PESA escrow presentation flow, fixed schema/seed data, and safer seller metrics. The refactor reduced duplicate frontend API handling, made unauthorized states user-friendly, and moved storage concerns behind a small service adapter so Supabase or another bucket can replace local storage without changing UI behavior.
