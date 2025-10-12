package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"testing"

	"github.com/rhellwege/task-social/internal/api/handlers"
	"github.com/rhellwege/task-social/internal/api/services"
	"github.com/rhellwege/task-social/internal/db/repository"
	"github.com/stretchr/testify/assert"
)

func TestCreateClub(t *testing.T) {
	app := SetupTestApp()

	// Create a test user
	username := "testuser"
	email := "test@example.com"
	password := "Password123!@"
	_, err := CreateTestUser(app, username, email, password)
	assert.NoError(t, err)

	// Login the test user
	token, err := LoginUser(app, &username, nil, password)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	testCases := []struct {
		name        string
		clubName    string
		description *string
		isPublic    bool
		expected    int
	}{
		{
			name:        "Valid public club",
			clubName:    "Public Club",
			description: StringToPtr("A public club for everyone"),
			isPublic:    true,
			expected:    http.StatusCreated,
		},
		{
			name:        "Valid private club",
			clubName:    "Private Club",
			description: StringToPtr("A private club for members only"),
			isPublic:    false,
			expected:    http.StatusCreated,
		},
		{
			name:     "Missing club name",
			expected: http.StatusBadRequest,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			reqBody := services.CreateClubRequest{
				Name:        tc.clubName,
				Description: tc.description,
				IsPublic:    tc.isPublic,
			}
			jsonBody, err := json.Marshal(reqBody)
			assert.NoError(t, err)
			req, err := NewProtectedRequest("POST", "/api/club", token, bytes.NewBuffer(jsonBody))
			assert.NoError(t, err)

			resp, err := app.Test(req)
			assert.NoError(t, err)
			assert.Equal(t, tc.expected, resp.StatusCode)

			if tc.expected == http.StatusCreated {
				var createdResp handlers.CreatedResponse
				respBody, err := io.ReadAll(resp.Body)
				assert.NoError(t, err)
				json.Unmarshal(respBody, &createdResp)
				assert.NotEmpty(t, createdResp.ID)
				assert.Equal(t, "Club created successfully", createdResp.Message)
			}
		})
	}
}

func TestGetPublicClubs(t *testing.T) {
	app := SetupTestApp()

	// Create a test user
	username := "testuser"
	email := "test@example.com"
	password := "Password123!@"
	_, err := CreateTestUser(app, username, email, password)
	assert.NoError(t, err)

	// Login the test user
	token, err := LoginUser(app, &username, nil, password)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	// Create some clubs
	_, err = CreateTestClub(app, token, "Public Club 1", StringToPtr(""), true)
	assert.NoError(t, err)
	_, err = CreateTestClub(app, token, "Public Club 2", StringToPtr(""), true)
	assert.NoError(t, err)
	_, err = CreateTestClub(app, token, "Private Club 1", StringToPtr(""), false)
	assert.NoError(t, err)

	req, err := NewProtectedRequest("GET", "/api/clubs", token, nil)
	assert.NoError(t, err)

	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var clubs []repository.Club
	respBody, err := io.ReadAll(resp.Body)
	assert.NoError(t, err)
	json.Unmarshal(respBody, &clubs)

	assert.Len(t, clubs, 2)
	assert.Equal(t, "Public Club 1", clubs[0].Name)
	assert.Equal(t, "Public Club 2", clubs[1].Name)
}

func TestJoinAndLeaveClub(t *testing.T) {
	app := SetupTestApp()

	// Create a test user
	usernameA := "testuserA"
	emailA := "testA@example.com"
	passwordA := "Password123!@"
	tokenA, err := CreateTestUser(app, usernameA, emailA, passwordA)
	assert.NoError(t, err)

	// Create a test user
	usernameB := "testuserB"
	emailB := "testB@example.com"
	passwordB := "Password123!@"
	tokenB, err := CreateTestUser(app, usernameB, emailB, passwordB)
	assert.NoError(t, err)

	// Create a club using user A
	club, err := CreateTestClub(app, tokenA, "Test Club", StringToPtr(""), true)
	assert.NoError(t, err)

	// Join the club using user B
	joinReq, err := NewProtectedRequest("POST", fmt.Sprintf("/api/club/%s/join", club.ID), tokenB, nil)
	assert.NoError(t, err)
	joinResp, err := app.Test(joinReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, joinResp.StatusCode)

	// check user B's joined clubs
	userClubsReq, err := NewProtectedRequest("GET", "/api/user/clubs", tokenB, nil)
	assert.NoError(t, err)
	userClubsRes, err := app.Test(userClubsReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, userClubsRes.StatusCode)
	var userClubs []repository.GetUserClubsRow
	body, err := io.ReadAll(userClubsRes.Body)
	assert.NoError(t, err)
	json.Unmarshal(body, &userClubs)
	assert.Len(t, userClubs, 1)

	// Leave the club
	leaveReq, err := NewProtectedRequest("POST", fmt.Sprintf("/api/club/%s/leave", club.ID), tokenB, nil)
	assert.NoError(t, err)
	leaveResp, err := app.Test(leaveReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, leaveResp.StatusCode)

	// check user B's joined clubs
	userClubsReq, err = NewProtectedRequest("GET", "/api/user/clubs", tokenB, nil)
	assert.NoError(t, err)
	userClubsRes, err = app.Test(userClubsReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, userClubsRes.StatusCode)
	body, err = io.ReadAll(userClubsRes.Body)
	assert.NoError(t, err)
	json.Unmarshal(body, &userClubs)
	assert.Len(t, userClubs, 0)
}

func TestDeleteClub(t *testing.T) {
	app := SetupTestApp()

	// Create a test user
	username := "testuser"
	email := "test@example.com"
	password := "Password123!@"
	token, err := CreateTestUser(app, username, email, password)
	assert.NoError(t, err)

	// Create a club
	club, err := CreateTestClub(app, token, "Test Club", StringToPtr(""), true)
	assert.NoError(t, err)

	// Delete the club
	deleteReq, err := NewProtectedRequest("DELETE", fmt.Sprintf("/api/club/%s", club.ID), token, nil)
	assert.NoError(t, err)
	deleteResp, err := app.Test(deleteReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, deleteResp.StatusCode)

	// check get club
	getClubReq, err := NewProtectedRequest("GET", fmt.Sprintf("/api/club/%s", club.ID), token, nil)
	assert.NoError(t, err)
	resp, err := app.Test(getClubReq)
	assert.NoError(t, err)
	assert.NotEqual(t, http.StatusOK, resp.StatusCode)

	// check user's joined clubs
	userClubsReq, err := NewProtectedRequest("GET", "/api/user/clubs", token, nil)
	assert.NoError(t, err)
	userClubsRes, err := app.Test(userClubsReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, userClubsRes.StatusCode)
	body, err := io.ReadAll(userClubsRes.Body)
	var userClubs []repository.GetUserClubsRow
	assert.NoError(t, err)
	json.Unmarshal(body, &userClubs)
	assert.Len(t, userClubs, 0)

	// check club leaderboard
	leaderboardReq, err := NewProtectedRequest("GET", fmt.Sprintf("/api/club/%s/leaderboard", club.ID), token, nil)
	assert.NoError(t, err)
	leaderboardRes, err := app.Test(leaderboardReq)
	assert.NoError(t, err)
	assert.NotEqual(t, http.StatusOK, leaderboardRes.StatusCode)
}

func TestUserNotMemberFail(t *testing.T) {
	app := SetupTestApp()

	// Create a test user
	usernameA := "testuserA"
	emailA := "testA@example.com"
	passwordA := "Password123!@"
	tokenA, err := CreateTestUser(app, usernameA, emailA, passwordA)
	assert.NoError(t, err)

	// create a public club using user a
	publicClubResp, err := CreateTestClub(app, tokenA, "Test Club", StringToPtr(""), true)
	assert.NoError(t, err)
	publicClubID := publicClubResp.ID

	// create a private club using user a
	privateClubResp, err := CreateTestClub(app, tokenA, "Test Club", StringToPtr(""), false)
	assert.NoError(t, err)
	privateClubID := privateClubResp.ID

	// Create a test user
	usernameB := "testuserB"
	emailB := "testB@example.com"
	passwordB := "Password123!@"
	tokenB, err := CreateTestUser(app, usernameB, emailB, passwordB)
	assert.NoError(t, err)

	// test get public club
	getClubReq, err := NewProtectedRequest("GET", fmt.Sprintf("/api/club/%s", publicClubID), tokenB, nil)
	assert.NoError(t, err)
	getClubRes, err := app.Test(getClubReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, getClubRes.StatusCode)

	// test get private club
	getClubReq, err = NewProtectedRequest("GET", fmt.Sprintf("/api/club/%s", privateClubID), tokenB, nil)
	assert.NoError(t, err)
	getClubRes, err = app.Test(getClubReq)
	assert.NoError(t, err)
	assert.NotEqual(t, http.StatusOK, getClubRes.StatusCode)
}

func TestClubVisibility(t *testing.T) {
	app := SetupTestApp()

	// Create a test user
	username := "testuser"
	email := "test@example.com"
	password := "Password123!@"
	token, err := CreateTestUser(app, username, email, password)
	assert.NoError(t, err)

	// Create a club
	publicClub, err := CreateTestClub(app, token, "Test Club", StringToPtr(""), true)
	assert.NoError(t, err)

	// Get public clubs
	getPublicClubsReq, err := NewProtectedRequest("GET", "/api/clubs", token, nil)
	assert.NoError(t, err)
	getPublicClubsRes, err := app.Test(getPublicClubsReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, getPublicClubsRes.StatusCode)
	var publicClubs []repository.Club
	body, err := io.ReadAll(getPublicClubsRes.Body)
	assert.NoError(t, err)
	err = json.Unmarshal(body, &publicClubs)
	assert.NoError(t, err)
	assert.Len(t, publicClubs, 1)
	assert.Equal(t, publicClub.ID, publicClubs[0].ID)

	// create a private club
	privateClub, err := CreateTestClub(app, token, "Private Club", StringToPtr(""), false)
	assert.NoError(t, err)

	// Get private clubs
	getPrivateClubsReq, err := NewProtectedRequest("GET", "/api/clubs", token, nil)
	assert.NoError(t, err)
	getPrivateClubsRes, err := app.Test(getPrivateClubsReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, getPrivateClubsRes.StatusCode)
	publicClubs = nil
	body, err = io.ReadAll(getPrivateClubsRes.Body)
	assert.NoError(t, err)
	err = json.Unmarshal(body, &publicClubs)
	assert.NoError(t, err)
	assert.Len(t, publicClubs, 1)
	assert.NotEqual(t, privateClub.ID, publicClubs[0].ID)
}

func TestUpdateClub(t *testing.T) {
	app := SetupTestApp()

	// Create a test user
	username := "testuser"
	email := "test@example.com"
	password := "Password123!@"
	token, err := CreateTestUser(app, username, email, password)
	assert.NoError(t, err)

	// Create a club
	club, err := CreateTestClub(app, token, "Test Club", StringToPtr(""), true)
	assert.NoError(t, err)

	// Update the club
	newName := "Updated Club Name"
	reqBody := handlers.UpdateClubRequest{
		Name: &newName,
	}
	jsonBody, err := json.Marshal(reqBody)
	assert.NoError(t, err)
	updateReq, err := NewProtectedRequest("PUT", fmt.Sprintf("/api/club/%s", club.ID), token, bytes.NewBuffer(jsonBody))
	assert.NoError(t, err)
	updateResp, err := app.Test(updateReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, updateResp.StatusCode)

	// check updated club name
	getClubReq, err := NewProtectedRequest("GET", fmt.Sprintf("/api/club/%s", club.ID), token, nil)
	assert.NoError(t, err)
	getClubResp, err := app.Test(getClubReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, getClubResp.StatusCode)
	var updatedClub repository.Club
	err = json.NewDecoder(getClubResp.Body).Decode(&updatedClub)
	assert.NoError(t, err)
	assert.Equal(t, newName, updatedClub.Name)
}

func TestGetClubLeaderboard(t *testing.T) {
	app := SetupTestApp()

	// Create a test user
	username := "testuser"
	email := "test@example.com"
	password := "Password123!@"
	token, err := CreateTestUser(app, username, email, password)
	assert.NoError(t, err)

	// Create a club
	club, err := CreateTestClub(app, token, "Test Club", StringToPtr(""), true)
	assert.NoError(t, err)

	// Get the club leaderboard
	leaderboardReq, err := NewProtectedRequest("GET", fmt.Sprintf("/api/club/%s/leaderboard", club.ID), token, nil)
	assert.NoError(t, err)
	leaderboardResp, err := app.Test(leaderboardReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, leaderboardResp.StatusCode)
	// check that the user is in the leaderboard
	var leaderboard []repository.GetClubLeaderboardRow
	body, err := io.ReadAll(leaderboardResp.Body)
	assert.NoError(t, err)
	err = json.Unmarshal(body, &leaderboard)
	assert.NoError(t, err)
	assert.Len(t, leaderboard, 1)
	leaderboardEntry := leaderboard[0]
	assert.Equal(t, username, leaderboardEntry.Username)
	assert.Equal(t, 0.0, leaderboardEntry.UserPoints)
	assert.Equal(t, int64(0), leaderboardEntry.UserStreak)
}

func TestClubPosts(t *testing.T) {
	app := SetupTestApp()

	// Create a test user
	username := "testuser"
	email := "test@example.com"
	password := "Password123!@"
	token, err := CreateTestUser(app, username, email, password)
	assert.NoError(t, err)

	// Create a club
	club, err := CreateTestClub(app, token, "Test Club", StringToPtr(""), true)
	assert.NoError(t, err)

	// Create a post
	postContent := "This is a test post."
	reqBody := handlers.ClubPostRequest{
		TextContent: postContent,
	}
	jsonBody, err := json.Marshal(reqBody)
	assert.NoError(t, err)
	createPostReq, err := NewProtectedRequest("POST", fmt.Sprintf("/api/club/%s/post", club.ID), token, bytes.NewBuffer(jsonBody))
	assert.NoError(t, err)
	createPostResp, err := app.Test(createPostReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, createPostResp.StatusCode)
	var createdPost handlers.CreatedResponse
	err = json.NewDecoder(createPostResp.Body).Decode(&createdPost)
	assert.NoError(t, err)

	// Get the post
	getPostReq, err := NewProtectedRequest("GET", fmt.Sprintf("/api/club/%s/post/%s", club.ID, createdPost.ID), token, nil)
	assert.NoError(t, err)
	getPostResp, err := app.Test(getPostReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, getPostResp.StatusCode)
	var fetchedPost repository.ClubPost
	err = json.NewDecoder(getPostResp.Body).Decode(&fetchedPost)
	assert.NoError(t, err)
	assert.Equal(t, createdPost.ID, fetchedPost.ID)
	assert.Equal(t, postContent, fetchedPost.Content)

	// Get all posts
	getAllPostsReq, err := NewProtectedRequest("GET", fmt.Sprintf("/api/club/%s/posts", club.ID), token, nil)
	assert.NoError(t, err)
	getAllPostsResp, err := app.Test(getAllPostsReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, getAllPostsResp.StatusCode)
	var fetchedPosts []repository.ClubPost
	err = json.NewDecoder(getAllPostsResp.Body).Decode(&fetchedPosts)
	assert.NoError(t, err)
	assert.Len(t, fetchedPosts, 1)
	assert.Equal(t, createdPost.ID, fetchedPosts[0].ID)

	// Delete the post
	deletePostReq, err := NewProtectedRequest("DELETE", fmt.Sprintf("/api/club/%s/post/%s", club.ID, createdPost.ID), token, nil)
	assert.NoError(t, err)
	deletePostResp, err := app.Test(deletePostReq)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, deletePostResp.StatusCode)

	// Get the post again
	getPostReq, err = NewProtectedRequest("GET", fmt.Sprintf("/api/club/%s/post/%s", club.ID, createdPost.ID), token, nil)
	assert.NoError(t, err)
	getPostResp, err = app.Test(getPostReq)
	assert.NoError(t, err)
	assert.NotEqual(t, http.StatusOK, getPostResp.StatusCode)
}
