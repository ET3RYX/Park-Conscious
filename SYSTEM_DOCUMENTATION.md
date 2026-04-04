# Park Conscious: Technical Architecture & API Documentation

This document provides a comprehensive deep dive into the Park Conscious platform, explaining how the backend, frontend components, and AI engine interact to provide a seamless parking and event management experience.

---

## 1. System Architecture Overview

Park Conscious is built using a **Serverless Micro-modular Architecture** designed for high scalability and low maintenance, primarily hosted on **Vercel**.

### Hybrid Runtime Environment
-   **Node.js (API Layer)**: The primary API handling auth, events, bookings, and discussions is written in Node.js. It uses a "Catch-all" routing strategy in `api/[...route].js`.
-   **Python (AI Engine)**: Performance-critical and logic-heavy operations (like parking slot allocation) are handled by a Python-based engine (`api/engine/allocator.py`).
-   **Database**: A global **MongoDB** cluster stores all persistent data, including users, events, parkings, and bookings.
-   **Media Storage**: **Cloudinary** is integrated for high-performance image hosting (event posters, user pictures).

---

## 2. API Reference (Detailed)

All API requests are prefixed with `/api`. Most stateful operations require a **JWT session cookie** for authentication.

### 🔐 Authentication (`/api/auth/*`)
| Endpoint | Method | Purpose | Payload Examples |
| :--- | :--- | :--- | :--- |
| `/auth/signup` | POST | Register a new user | `{ "name", "email", "password" }` |
| `/auth/login` | POST | Authenticate user/admin | `{ "email", "password" }` |
| `/auth/google` | POST | Google OAuth sign-in | `{ "email", "name", "googleId" }` |
| `/auth/me` | GET | Verify current session | Returns user/role data from JWT |
| `/auth/logout` | POST | Clear session cookie | N/A |

### 📅 Events Management (`/api/events/*`)
| Endpoint | Method | Purpose | Details |
| :--- | :--- | :--- | :--- |
| `/events` | GET | Fetch published events | Sorted by date. |
| `/events/admin/all` | GET | Fetch all events (Admin) | Includes drafts and cancelled. |
| `/events` | POST | Create new event | Requires Admin/Organizer role. |
| `/events/[id]` | PUT | Update event details | Managed via Admin Panel. |
| `/events/upload` | POST | Upload event image | Multipart form -> Cloudinary. |
| `/tickets` | GET | Fetch event pricing protocols | Returns `regularPrice` and `vipPrice`. |

### 💳 Payments & Bookings (`/api/pay`, `/api/bookings`)
| Endpoint | Method | Purpose | Flow |
| :--- | :--- | :--- | :--- |
| `/pay` | POST | Initiate PhonePe Payment | Creates "Initiated" booking, returns redirect. |
| `/payment-callback` | GET/POST | PhonePe Webhook | Verifies status, confirms booking, decrements capacity. |
| `/bookings/[userId]` | GET | Get user's confirmed tickets | Populates event details (title, location). |
| `/bookings/check-in` | POST | QR Code Check-in | Marks `attended: true` in database. |

### 🤖 AI Parking Engine (`/api/engine/allocator`)
*Note: This is a Python-powered endpoint.*
| Action (POST) | Purpose | Logic |
| :--- | :--- | :--- |
| `status` | Query Parking Lot | Uses Python `ParkingLot` model to calculate free vs total slots. |
| `park` | Allocate Spot | AI-powered allocation based on vehicle size and proximity. |

---

## 3. Data Flow & Component Interaction

### The "Events Portal" Flow (`events.parkconscious.in`)
1.  **Discovery**: React frontend fetches published events from `/api/events`.
2.  **Auth**: User logs in (Email/Google). API issues a cross-subdomain cookie (`.parkconscious.in`).
3.  **Booking**:
    -   User clicks "Book Ticket".
    -   Frontend calls `/api/pay`.
    -   User is redirected to **PhonePe Secure Page**.
    -   After payment, PhonePe calls `/api/payment-callback`.
    -   Backend updates DB, generates a unique `ticketId`, and redirects user to `.../payment-success`.

### The "Admin & Owner" Interaction
-   **Admin Panel**: A dedicated React dashboard that calls `/api/admin/*` to manage system-wide events and view global booking statistics.
-   **Owner Dashboard**: Static HTML/JS pages (`/owner/`) where parking owners can:
    -   Add/Remove parking lots (`/api/owner/[id]/parkings`).
    -   View real-time access logs from scanning devices (`/api/logs`).

---

## 4. Database Schema (MongoDB/Mongoose)

### Key Collections:
-   **User / Owner**: Stores credentials, roles (admin/owner/user), and auth IDs.
-   **Event**: Contains spatial data (coordinates), capacity constraints, and status.
    -   Includes `regularPrice` and `vipPrice` for multi-tier ticketing.
-   **Parking**: Defines logic for slots, price per hour, and authority types.
-   **Booking**: The "Glue" record linking Users, Events/Parking, and Transactions.
    -   Includes `ticketId` (for QR) and `attended` (for check-in).
-   **Discussion / Comment**: Power the community forum and movie review system.

---

## 5. Security & Technical Implementation
-   **JWT Cookies**: Secure, `httpOnly`, and `sameSite: lax` cookies ensure sessions persist across `www`, `events`, and `admin` subdomains.
-   **CORS**: Strict allow-lists for subdomains prevent unauthorized cross-origin requests.
-   **Atomic Operations**: Event capacity is decremented using Mongoose `$inc` to prevent overbooking during high-traffic sales.
-   **Cloudinary Integration**: Images are streamed directly from the client/server to Cloudinary to keep the Vercel function footprint small.

---

> [!IMPORTANT]
> **Production Note**: Ensure your environment variables for `JWT_SECRET`, `PHONEPE_MERCHANT_ID`, and `CLOUDINARY_URL` are correctly set in the Vercel dashboard for all features to function in production.
