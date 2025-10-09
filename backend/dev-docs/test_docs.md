Club Test Suite Documentation

This document outlines the test cases for the club functionality in the backend.

### TestCreateClub

This test verifies the functionality of creating new clubs.

**Steps:**

1.  A test user is created and logged in to obtain an authentication token.
2.  A series of test cases are run to attempt to create clubs with different attributes.
    *   **Valid public club:**
        *   **Action:** A POST request is made to `/api/club` with a valid club name, description, and `isPublic` set to `true`.
        *   **Expected Result:** The club is created successfully, returning a `201 Created` status. The response body contains the new club's ID and a success message.
    *   **Valid private club:**
        *   **Action:** A POST request is made to `/api/club` with a valid club name, description, and `isPublic` set to `false`.
        *   **Expected Result:** The club is created successfully, returning a `201 Created` status. The response body contains the new club's ID and a success message.
    *   **Missing club name:**
        *   **Action:** A POST request is made to `/api/club` with a missing club name.
        *   **Expected Result:** The request fails with a `400 Bad Request` status.

### TestGetPublicClubs

This test ensures that only public clubs are returned when fetching the list of public clubs.

**Steps:**

1.  A test user is created and logged in.
2.  Two public clubs and one private club are created.
3.  A GET request is made to `/api/clubs`.
4.  **Expected Result:** The response returns a `200 OK` status and a JSON array containing only the two public clubs.

### TestJoinAndLeaveClub

This test verifies that a user can join and subsequently leave a club.

**Steps:**

1.  Two test users (User A and User B) are created.
2.  User A creates a public club.
3.  User B sends a POST request to `/api/club/{clubId}/join` to join the club.
    *   **Expected Result:** The request is successful, returning a `200 OK` status.
4.  A GET request is made to `/api/user/clubs` for User B.
    *   **Expected Result:** The response returns a `200 OK` status and a JSON array containing the club that User B just joined.
5.  User B sends a POST request to `/api/club/{clubId}/leave` to leave the club.
    *   **Expected Result:** The request is successful, returning a `200 OK` status.
6.  A GET request is made to `/api/user/clubs` for User B again.
    *   **Expected Result:** The response returns a `200 OK` status and an empty JSON array, indicating User B is no longer a member of any clubs.

### TestDeleteClub

This test ensures that a club can be deleted by its owner.

**Steps:**

1.  A test user is created and logged in.
2.  The user creates a club.
3.  A DELETE request is made to `/api/club/{clubId}`.
    *   **Expected Result:** The request is successful, returning a `200 OK` status.
4.  A GET request is made to `/api/club/{clubId}` to verify the club is gone.
    *   **Expected Result:** The request fails with a status other than `200 OK`.
5.  A GET request is made to `/api/user/clubs` for the user.
    *   **Expected Result:** The response returns a `200 OK` status and an empty JSON array.
6.  A GET request is made to `/api/club/{clubId}/leaderboard`.
    *   **Expected Result:** The request fails with a status other than `200 OK`.

### TestUserNotMemberFail

This test verifies that a user cannot access a private club's details if they are not a member.

**Steps:**

1.  User A is created and creates both a public and a private club.
2.  User B is created.
3.  User B makes a GET request to `/api/club/{publicClubId}`.
    *   **Expected Result:** The request is successful with a `200 OK` status.
4.  User B makes a GET request to `/api/club/{privateClubId}`.
    *   **Expected Result:** The request fails with a status other than `200 OK`.

### TestClubVisibility

This test ensures that the public club list (`/api/clubs`) only ever contains public clubs.

**Steps:**

1.  A test user is created and logged in.
2.  The user creates a public club.
3.  A GET request is made to `/api/clubs`.
    *   **Expected Result:** The response returns a `200 OK` status and a JSON array containing the public club.
4.  The user creates a private club.
5.  A GET request is made to `/api/clubs` again.
    *   **Expected Result:** The response returns a `200 OK` status and a JSON array containing only the public club, not the private one.

### TestUpdateClub

This test verifies that a club's details can be updated by its owner.

**Steps:**

1.  A test user is created and logged in.
2.  The user creates a club.
3.  A PUT request is made to `/api/club/{clubId}` with a new name for the club.
    *   **Expected Result:** The request is successful, returning a `200 OK` status.
4.  A GET request is made to `/api/club/{clubId}`.
    *   **Expected Result:** The response returns a `200 OK` status and the club data with the updated name.

### TestGetClubLeaderboard

This test verifies that a club's leaderboard can be retrieved.

**Steps:**

1.  A test user is created and logged in.
2.  The user creates a club.
3.  A GET request is made to `/api/club/{clubId}/leaderboard`.
    *   **Expected Result:** The request is successful, returning a `200 OK` status. The response body is a JSON array containing the user who created the club, with 0 points and a 0-day streak.

User Test Suite Documentation

This document outlines the test cases for the user functionality in the backend.

### TestRegisterUser

This test verifies the user registration process.

**Steps:**

1.  A series of test cases are run to attempt to register users with different attributes.
    *   **Valid registration:**
        *   **Action:** A POST request is made to `/api/register` with a unique username, a valid email address, and a strong password.
        *   **Expected Result:** The user is created successfully, returning a `201 Created` status. The response body contains an authentication token.
    *   **Weak password:**
        *   **Action:** A POST request is made to `/api/register` with a unique username, a valid email address, and a weak password.
        *   **Expected Result:** The request fails with a `500 Internal Server Error` status, indicating a validation failure on the server side.

### TestRegisterUserDuplicates

This test ensures that the system prevents the registration of users with duplicate usernames or email addresses.

**Steps:**

1.  An initial test user is created.
2.  **Duplicate username:**
    *   **Action:** An attempt is made to create a new user with the same username as the initial user but a different email address.
    *   **Expected Result:** The registration fails, and an error is returned.
3.  **Duplicate email:**
    *   **Action:** An attempt is made to create a new user with a different username but the same email address as the initial user.
    *   **Expected Result:** The registration fails, and an error is returned.

### TestLoginUser

This test verifies the user login process.

**Steps:**

1.  A series of test cases are run to attempt to log in with different credentials.
    *   **Valid login with username:**
        *   **Action:** A test user is created. A POST request is made to `/api/login` with the correct username and password.
        *   **Expected Result:** The login is successful, returning a `200 OK` status. The response body contains an authentication token.
    *   **Valid login with email:**
        *   **Action:** A test user is created. A POST request is made to `/api/login` with the correct email and password.
        *   **Expected Result:** The login is successful, returning a `200 OK` status. The response body contains an authentication token.
    *   **Invalid password:**
        *   **Action:** A test user is created. A POST request is made to `/api/login` with the correct username but an incorrect password.
        *   **Expected Result:** The login fails, returning a `401 Unauthorized` status.
    *   **User not found:**
        *   **Action:** A POST request is made to `/api/login` with a username that does not exist in the database.
        *   **Expected Result:** The login fails, returning a `401 Unauthorized` status.

### TestGetUser

This test verifies the process of fetching a user's own data.

**Steps:**

1.  A series of test cases are run to attempt to fetch user data.
    *   **Valid token:**
        *   **Action:** A test user is created and logged in to obtain a token. A GET request is made to `/api/user` with the valid token in the `Authorization` header.
        *   **Expected Result:** The request is successful, returning a `200 OK` status. The response body contains the user's data (username, etc.).
    *   **Invalid token:**
        *   **Action:** A GET request is made to `/api/user` with an invalid token in the `Authorization` header.
        *   **Expected Result:** The request fails, returning a `401 Unauthorized` status.
    *   **No token:**
        *   **Action:** A GET request is made to `/api/user` with no `Authorization` header.
        *   **Expected Result:** The request fails, returning a `401 Unauthorized` status.

### TestUpdateUser

This test verifies the process of updating a user's data.

**Steps:**

1.  A series of test cases are run to attempt to update user data.
    *   **Valid update:**
        *   **Action:** A test user is created and logged in. A PUT request is made to `/api/user` with a new username in the request body and a valid token in the `Authorization` header.
        *   **Expected Result:** The request is successful, returning a `200 OK` status.
    *   **Invalid token:**
        *   **Action:** A PUT request is made to `/api/user` with an invalid token in the `Authorization` header.
        *   **Expected Result:** The request fails, returning a `401 Unauthorized` status.
    *   **No token:**
        *   **Action:** A PUT request is made to `/api/user` with no `Authorization` header.
        *   **Expected Result:** The request fails, returning a `401 Unauthorized` status.

Auth Service Test Suite Documentation

This document outlines the test cases for the authentication service.

### TestAuthService

This suite tests the core functionalities of the `AuthService`.

#### HashPassword and VerifyPassword

This test verifies that password hashing and verification work as expected.

**Steps:**

1.  A test password ("password123") is defined.
2.  The `HashPassword` method is called with the test password.
    *   **Expected Result:** The method returns a hashed password without any error.
3.  The `VerifyPassword` method is called with the original test password and the hashed password.
    *   **Expected Result:** The verification is successful and returns no error.
4.  The `VerifyPassword` method is called with an incorrect password ("wrongpassword") and the hashed password.
    *   **Expected Result:** The verification fails and returns an error.

#### GenerateToken and VerifyToken

This test verifies the generation and verification of JWT tokens.

**Steps:**

1.  A test user ID ("test-user-id") is defined.
2.  The `GenerateToken` method is called with the user ID.
    *   **Expected Result:** The method returns a JWT token string without any error.
3.  The `VerifyToken` method is called with the generated token string.
    *   **Expected Result:** The token is verified successfully, and a parsed token object is returned. The subject (user ID) of the parsed token matches the original test user ID.

#### Corrupt Token

This test ensures that the system correctly handles and rejects corrupt or invalid tokens.

**Steps:**

1.  A valid token is generated.
2.  **Corrupt token:**
    *   **Action:** The `VerifyToken` method is called with the valid token string appended with extra characters ("garbage").
    *   **Expected Result:** The verification fails, and an error is returned.
3.  **Invalid token:**
    *   **Action:** The `VerifyToken` method is called with a completely invalid token string ("invalid-token").
    *   **Expected Result:** The verification fails, and an error is returned.

#### Token expiration

This test verifies that token expiration is handled correctly.

**Steps:**

1.  **Expired token:**
    *   **Action:** A token is manually created with an expiration time set in the past. The `VerifyToken` method is called with this token.
    *   **Expected Result:** The verification fails, and an error is returned, indicating the token is expired.
2.  **Valid token:**
    *   **Action:** A token is manually created with an expiration time set in the future. The `VerifyToken` method is called with this token.
    *   **Expected Result:** The verification is successful, and no error is returned.

#### Password Strength

This test verifies the password strength validation logic.

**Steps:**

A series of test cases are run with different passwords to check the `ValidatePasswordStrength` method.

*   **Weak password - too short:**
    *   **Action:** Validate "pass".
    *   **Expected Result:** Fails with an error.
*   **Weak password - only letters:**
    *   **Action:** Validate "password".
    *   **Expected Result:** Fails with an error.
*   **Weak password - only numbers:**
    *   **Action:** Validate "123456789".
    *   **Expected Result:** Fails with an error.
*   **Weak password - only symbols:**
    *   **Action:** Validate "!@#$%^&*".
    *   **Expected Result:** Fails with an error.
*   **Strong password:**
    *   **Action:** Validate "j3U*1)5nO".
    *   **Expected Result:** Succeeds with no error.
*   **Strong password - long:**
    *   **Action:** Validate "*#4ricIo0vmMI$0C0wkc940thoncnCNEFHOej0g(&#$*@(#98".
    *   **Expected Result:** Succeeds with no error.

WebSocket Test Suite Documentation

This document outlines the test cases for the WebSocket functionality in the backend.

### TestWebsocketBasic

This test verifies the basic functionality of the WebSocket endpoint.

**Steps:**

1.  A test user is created and logged in to obtain an authentication token.
2.  A WebSocket connection is established with the server using the obtained token.
3.  A message is sent to the server, which should echo the message back.
4.  The connection is closed.

*   **Websocket client connection with JWT:**
    *   **Action:** A WebSocket connection is attempted with a valid JWT.
    *   **Expected Result:** The connection is successful.
*   **Websocket client send echo:**
    *   **Action:** A message is sent to the WebSocket server.
    *   **Expected Result:** The server echoes the message back to the client.
*   **Multiple users echo:**
    *   **Action:** Multiple users connect to the WebSocket server and send messages.
    *   **Expected Result:** Each user receives their own echoed message.

### TestClubWebsockets

This test verifies that WebSocket messages are broadcast to all members of a club.

**Steps:**

1.  A club owner and several other users are created.
2.  All users connect to the WebSocket server.
3.  The club owner creates a new club.
4.  All other users join the club.
5.  One user sends a message to the club via the API.
6.  **Expected Result:** The message is broadcast to all members of the club, including the sender.

*   **Club message broadcasts to all joined users:**
    *   **Action:** A user sends a message to a club they are a member of.
    *   **Expected Result:** All members of the club receive the message via their WebSocket connection.