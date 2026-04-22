# Park Conscious Development Guide

This guide ensures technical stability and consistent coding practices for the Park Conscious platform.

---

## 1. Project Architecture

The project is structured as a **Monorepo** with three primary components:
1.  **Root API (`/api/index.js`)**: The monolithic backend handling all routes (`/api/*`).
2.  **Events Frontend (`/Events`)**: The React-based event platform.
3.  **Admin Panel (`/AdminPanel`)**: The administrative dashboard.

### Why Monolithic?
To resolve CORS and redirect issues on Vercel, we have consolidated all backend logic into a single serverless function at `/api/index.js`. This prevents cross-domain preflight failures and simplifies routing.

---

## 2. Coding Standards

### Backend (Node.js)
- **Always use `api/index.js`**: Do not create new modular route files in `backend/routes/`. All new endpoints must be added to the main handler switch.
- **DB Connection**: Always use `await connectDB()` at the start of the handler.
- **Model Synchronization**: When adding fields to a Mongoose model, update `api/lib/models.js` and ensure both Admin (POST/PUT) and Events (GET) agree on the field names.
- **Absolute Fallbacks**: When referencing the API from the frontend, use the hardcoded `https://www.parkconscious.in` fallback to bypass apex-to-www redirects.

### Frontend (React)
- **Normalization**: Since the database may contain legacy records, always use the `normalized` object pattern in your pages:
  ```javascript
  const normalized = {
    displayTitle: data.title || data.name || "Untitled",
    displayPrice: data.price ?? 0,
    // ...
  };
  ```

---

## 3. Deployment Workflow

> [!IMPORTANT]
> **Manual Overrides:** Due to stalled GitHub-to-Vercel webhooks, always use the Vercel CLI for production updates.

### Production Push Command
To update all components at once, run this from the project root:
```bash
# Link & Deploy Admin
cd AdminPanel && vercel link --project admin-events-park-conscious --yes && vercel deploy --prod --yes && cd ..

# Link & Deploy Events
cd Events && vercel link --project park_conscious_events --yes && vercel deploy --prod --yes && cd ..

# Link & Deploy Root (API)
vercel link --project park-conscious --yes && vercel deploy --prod --yes
```

---

## 4. Environment Variables

All critical keys must be duplicated across projects (especially the Root project):
- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY`, `PHONEPE_SALT_INDEX`, `PHONEPE_BASE_URL`
- `JWT_SECRET`

---

## 5. Troubleshooting Common Issues

### 500 Internal Server Error
- Check if `MONGODB_URI` is missing in the Vercel project settings.
- Ensure the requested model is exported in `api/lib/models.js`.

### UNTITLED EXPERIENCE (Events)
- This occurs when the API returns an array instead of a single object for `/api/events/:id`. Ensure the `GET` handler in `index.js` correctly splits the ID from the URL.

---

*Last Updated: 2026-04-01 // Build: v2.0.8-DOCS*
