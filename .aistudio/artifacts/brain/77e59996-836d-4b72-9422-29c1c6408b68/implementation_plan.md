# High-Fidelity Gallery, Universal Viewport Responsiveness & Workflow Hardening

This plan delivers a comprehensive visual and architectural upgrade for **Kamal Hotel**: generating authentic Himalayan boutique room and rooftop terrace photography via AI Studio's image engine, engineering fluid mobile-to-laptop responsive geometry with an ergonomic mobile bottom navigation bar, auditing and equipping all dialogs and modals with standardized dismiss controls (top-right close icon, backdrop tap, and ESC key listener), and hardening all guest-to-staff operational workflows to ensure complete end-to-end execution.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1 clarification and strictly governed implementation:

- **Confirmed Decision 1 (Photography Style)**: Authentic Himalayan heritage with warm teak woodwork, hand-loomed textiles, ambient candlelit rooftop dining, and panoramic views of the Kathmandu valley and mountain skyline.
- **Confirmed Decision 2 (Responsiveness Architecture)**: Fluid adaptive layout pairing a mobile-first bottom navigation bar and touch targets ($\ge 44\text{px}$) on smartphone viewports with multi-column side-by-side matrices and 1440px desktop baselines.
- **Confirmed Decision 3 (Dialog & Modal Dismissal)**: Every popup, drawer, and modal must feature a distinct top-right close icon (`✕`), click-outside/backdrop tap dismissal, and global `Escape` key listeners with body scroll-locking.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Generates authentic, high-resolution photography assets (`16:9` hero backdrop, `4:3` rooftop terrace restaurant, `4:3` Executive Suite, `4:3` Presidential Suite) and links them seamlessly across the public landing page, room catalog, and CMS image manager.
  2. Overhauls layout geometry to ensure zero viewport clipping, horizontal overflows, or layout shifts across both narrow smartphones ($375\text{px}$–$430\text{px}$) and wide laptops ($1024\text{px}$–$1440\text{px}$).
  3. Equips all modals across the app (Room Booking Checkout, Staff Login, Guest Passcode Generation, Invoice Print Preview, Voucher Creation, Staff Add/Edit, Review Form, FAQ Form, and PWA Install Guide) with uniform dismissal controls.
  4. Tests and hardens every workflow till completion: direct booking reservation, promo coupon redemption, dining tray dispatch, staff two-way intercom messaging, and guest checkout session purge.
- **Target Audience / Persona**:
  - *Leisure & Boutique Travelers*: Exploring Kathmandu from mobile devices or laptops, looking for high-resolution authentic room photography, seamless booking checkout, and keyless in-room ordering.
  - *Hotel Operations Team (Super Admin, Manager, Reception, Chef, Waiter)*: Managing daily room folios, live guest requests, table service, and marketing vouchers on laptop dashboards and handheld tablets.

---

## 2. Completed Milestones & Architecture

- [x] **Milestone 1: High-Fidelity Photography Generation & CMS Gallery**
  - Generated 4 high-resolution photography assets:
    - `hero_himalayan_boutique_1793983309553.jpg` (16:9 twilight boutique facade)
    - `rooftop_candlelight_dining_1793983310740.jpg` (4:3 candlelit terrace restaurant)
    - `suite_himalayan_deluxe_1793983311349.jpg` (4:3 teak king suite with valley view balcony)
    - `suite_presidential_living_1793983311442.jpg` (4:3 Newari lattice living suite with soaking tub)
  - Mirrored assets into `/public/assets/images/` and `/public/images/`.
  - Updated `HotelContext.tsx` defaults and CMS `MediaGalleryManager.tsx` presets.

- [x] **Milestone 2: Fluid Mobile & Laptop Responsiveness**
  - Built `MobileBottomNav.tsx` with thumb-zone ergonomics for smartphone viewports (`Explore`, `Rooms`, `Dining`, `In-Room`, `Reserve` / `PMS`).
  - Added responsive bottom padding (`pb-20 md:pb-0`) to `App.tsx` ensuring zero content occlusion.
  - Verified laptop matrices ($1024\text{px}$–$1440\text{px}$) render clean multi-column layouts without horizontal scrollbars.

- [x] **Milestone 3: Universal Modal Dismissal Architecture**
  - Created `src/components/Common/ModalDismissHandler.tsx` with `useModalDismiss` (handles ESC key listener, document body scroll-locking) and `ModalDismissButton` ($\ge 44\text{px}$ touch target with hover/focus states).
  - Equipped all modals across the app:
    - `BookingCheckoutModal.tsx`
    - `StaffLoginModal.tsx`
    - `GuestKeycardQrModal.tsx`
    - `InvoicePrintModal.tsx`
    - `CouponManager.tsx`
    - `MasterBillingManager.tsx`
    - `StaffDashboard.tsx` (Add Room, Add Staff, Change Password, Add Review, Add FAQ)
    - `RoomCatalog.tsx` (Room detail modal)
    - `InventoryStockManager.tsx` (Adjust Stock, Add Item)
    - `RestaurantBillingManager.tsx` (Add Menu Item)
    - `PWAInstallButton.tsx` (iOS & General Browser Install Dialogs)

- [x] **Milestone 4: End-to-End Operational Workflow Hardening**
  - Direct room booking with promo coupon code validation (`WELCOME2026`).
  - Kitchen dining orders with live status updates and room billing folios.
  - Front desk two-way live intercom messaging between guests and staff.
  - Automatic keyless PIN expiration and session purge upon guest checkout.
  - Compilation and TypeScript linting passed with 0 errors (`compile_applet` & `lint_applet`).
