# TelecomPro Frontend Refresh

Back up your existing `frontend/src` first. Extract this ZIP and copy the included `src` folder plus `index.html`, `package.json`, and `vite.config.js` into your existing `frontend` folder, replacing matching files. Run `npm install` then `npm run dev` from the frontend folder.

This is a frontend-only demo using a shared localStorage dataset under `telecomProDataV1`. It does not yet call Spring Boot or MySQL. Provisioning and activation are simulated. Existing old localStorage keys are not modified; this refreshed version starts with its own sample data on first launch.