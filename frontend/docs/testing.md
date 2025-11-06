# End-to-End (E2E) Testing

This document outlines the end-to-end testing strategy for the frontend application using Detox and Jest.

## Overview

E2E tests are designed to simulate real user scenarios by running the full application on a simulator or device and interacting with it as a user would. This helps us catch bugs in the application flow, UI, and integration with the backend.

Our E2E test suite is built with:
-   **Detox:** A gray box E2E testing and automation library for mobile apps.
-   **Jest:** The test runner that executes our Detox tests.

## Running the Tests

To run the E2E tests locally, use the following command from the `frontend` directory:

```bash
detox test --configuration ios.sim.debug
```

The test setup automatically handles cleaning up state (like stored login tokens) between test runs to ensure tests are isolated.

## Current Test Scenarios

The following scenarios are currently covered by our E2E test suite, located in `e2e/main.test.js`.

### 1. Authentication Flow Navigation

-   **Test:** `should go to login page and back to register page`
-   **Description:** This test validates the basic navigation between the authentication screens. It taps the "Login" link on the registration page, verifies that the login page is displayed, then taps the "Register" link on the login page to ensure it successfully navigates back.

### 2. Successful User Registration

-   **Test:** `should register a new user and redirect to main page`
-   **Description:** This test covers the full "happy path" for user registration. It types a username, email, and password into the input fields, submits the form, and asserts that the user is successfully logged in by navigating to the profile page and checking for the correct username.

3. Successful Login
-   **Test:** `should login with registered user and redirect to main page`
-   **Description:** This test covers the full "happy path" for user login. It types an email and password into the input fields, submits the form, and asserts that the user is successfully logged in by navigating to the profile page and checking for the correct username.
- **Note:** This test assumes that the user has already registered  in the backend which should be the case during this testing.

## Future Test Scenarios

To improve our test coverage and ensure application stability, the following E2E tests should be added:

### User Authentication

-   **Failed Registration (Validation):** A user cannot register with invalid data (e.g., invalid email format, password too short) and is shown appropriate error messages.
-   **Failed Registration (Conflict):** A user cannot register with an email or username that is already in use.
-   **Successful Login:** A registered user can log in with correct credentials and is taken to the main dashboard.
-   **Failed Login:** A user cannot log in with incorrect credentials and is shown an error message.
-   **Logout:** A logged-in user can successfully log out and is returned to the authentication screen.

### Core App Functionality

-   **Task Management:**
    -   View the list of tasks.
    -   Create a new task.
    -   Mark a task as complete.
    -   Delete a task.
-   **Club Management:**
    -   View the list of clubs.
    -   Join a club.
    -   Leave a club.
    -   View a club's details and members.
-   **Profile:**
    -   View the user's own profile information.
    -   Edit and save profile information.
