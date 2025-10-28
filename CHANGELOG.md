# Changelog

## 2025-09-17

### ✨ Features & Improvements

- **Authentication Refactor (`controller/authentication.js`):**
  - Separated standard login and Google OAuth logic into distinct `login` and `googleLogin` functions for improved clarity and maintainability.
  - Enhanced security by modifying the JWT payload to only include the `userId`, reducing data exposure.
  - Added helper functions (`findUser`, `createNotification`) to reduce code duplication and improve readability.
  - Standardized error handling to provide more specific and informative error messages.

- **Production-Ready `index.js`:**
  - **Dependencies:** Added `helmet` for security and `morgan` for request logging.
  - **Structure:** Reorganized the file into logical sections for the database connection, middleware, routes, error handling, and server initialization.
  - **Configuration:** Moved hardcoded values like the MongoDB URI and port to a `.env` file.
  - **Security:** 
    - Integrated `helmet` to set secure HTTP headers.
    - Configured a stricter `cors` policy for production environments.
    - Replaced the deprecated `body-parser` with `express.json()` and `express.urlencoded()`, setting a reasonable payload limit of `10mb`.
  - **Logging:** Added `morgan` for detailed HTTP request logging.
  - **Database:** Created a dedicated `connectDB` function with robust error handling.
  - **API Versioning:** Prefixed all routes with `/api/v1` for better version management.
  - **Graceful Shutdown:** Implemented a graceful shutdown mechanism to ensure the server and database connections close properly.

- **Improved Error Handling (`middleware/handlerror.js`):**
  - The error handler now masks detailed errors in production for better security, sending a generic message to the user while logging the full stack trace for debugging.

### 🐛 Bug Fixes

- **Authentication (`controller/authentication.js`):**
  - Fixed a critical bug where the application would crash if a user created via a social provider (e.g., Google) tried to log in with a password. The system now checks for a password and provides a user-friendly error message.

### ⚙️ Other

- **Routes (`routes/user.js`):**
  - Added a new `/google-login` route to handle Google authentication separately.
- **Environment (`.env`):**
  - Created a `.env` file to store all environment variables, separating configuration from the codebase.
