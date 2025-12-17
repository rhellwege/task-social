package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/fasthttp/websocket"
	"github.com/rhellwege/task-social/internal/api/handlers"
	"github.com/rhellwege/task-social/internal/db/repository"
	"github.com/stretchr/testify/assert"
)

// 1. create a user
// 2. use the use jwt token to create a websocket client
// 3. test the client by sending a message
// 4. close the connection
func TestWebsocketBasic(t *testing.T) {
	app := SetupTestApp()
	assert.NotNil(t, app)

	token, err := CreateTestUser(app, "user1", "user1@email.com", "Password123!@")
	assert.NoError(t, err)

	dialer := websocket.Dialer{}
	headers := make(http.Header)
	headers.Set("Authorization", token)

	testServerAddr := ":1111"
	wsEndpoint := fmt.Sprintf("ws://localhost%s/ws", testServerAddr)

	// we have to do this because we need a real tcp connection
	go func() {
		err := app.Listen(testServerAddr)
		assert.NoError(t, err)
	}()

	t.Run("Websocket client connection with JWT", func(t *testing.T) {
		conn, _, err := dialer.Dial(wsEndpoint, headers)
		assert.NoError(t, err)
		defer conn.Close()
	})

	t.Run("Websocket client send echo", func(t *testing.T) {
		conn, _, err := dialer.Dial(wsEndpoint, headers)
		assert.NoError(t, err)
		defer conn.Close()
		// websocket send acts as an echo server, chat messages go through the API
		err = conn.WriteMessage(websocket.TextMessage, []byte("Hello, world!"))
		assert.NoError(t, err)

		_, message, err := conn.ReadMessage()
		assert.NoError(t, err)
		assert.Equal(t, "Hello, world!", string(message))
	})

	t.Run("Multiple users echo", func(t *testing.T) {
		token2, err := CreateTestUser(app, "user2", "user2@email.com", "Password123!@")
		assert.NoError(t, err)

		headers2 := make(http.Header)
		headers2.Set("Authorization", token2)

		conn1, _, err := dialer.Dial(wsEndpoint, headers)
		assert.NoError(t, err)
		defer conn1.Close()

		conn2, _, err := dialer.Dial(wsEndpoint, headers2)
		assert.NoError(t, err)
		defer conn2.Close()

		err = conn1.WriteMessage(websocket.TextMessage, []byte("Hello, user1!"))
		assert.NoError(t, err)

		_, message, err := conn1.ReadMessage()
		assert.NoError(t, err)
		assert.Equal(t, "Hello, user1!", string(message))

		err = conn2.WriteMessage(websocket.TextMessage, []byte("Hello, user2!"))
		assert.NoError(t, err)

		_, message, err = conn2.ReadMessage()
		assert.NoError(t, err)
		assert.Equal(t, "Hello, user2!", string(message))
	})
}

//  1. create test users
//  2. connect all users
//  3. create a test club using one of the users
//  4. have all users join the club
//  5. have a user send a message through the club api
//  6. read each user's connection (including the sender)
//  7. verify the structure and content of the message
//     (should be club type event, include the club id, and the user id)
func TestClubWebsockets(t *testing.T) {
	type userInfo struct {
		username string
		token    string
		conn     *websocket.Conn
	}
	var users []userInfo

	testServerAddr := ":1112"

	app := SetupTestApp()
	assert.NotNil(t, app)

	dialer := websocket.Dialer{}

	go func() {
		err := app.Listen(testServerAddr)
		assert.NoError(t, err)
	}()
	wsEndpoint := fmt.Sprintf("ws://localhost%s/ws", testServerAddr)

	// 3. Create a test club using one of the users
	clubOwnerToken, err := CreateTestUser(app, "clubOwner", "clubOwner@email.com", "Password123!@")
	headers := http.Header{}
	headers.Set("Authorization", clubOwnerToken)
	clubOwnerConn, _, err := dialer.Dial(wsEndpoint, headers)
	assert.NoError(t, err)
	assert.NotNil(t, clubOwnerConn)
	defer clubOwnerConn.Close()
	assert.NoError(t, err)
	resp, err := CreateTestClub(app, clubOwnerToken, "Websocket Club", StringToPtr("description"), true)
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	clubID := resp.ID

	for i := range 10 {
		// 1. create test users
		username := fmt.Sprintf("user%d", i)
		email := fmt.Sprintf("user%d@email.com", i)
		password := "Password123%!@"
		token, err := CreateTestUser(app, username, email, password)
		headers := make(http.Header)
		headers.Set("Authorization", token)
		// 2. Connect each user to the websocket server
		conn, _, err := dialer.Dial(wsEndpoint, headers)
		assert.NoError(t, err)
		assert.NotNil(t, conn)
		users = append(users, userInfo{
			username: username,
			conn:     conn,
			token:    token,
		})
		// 4. Have all users join the club
		joinReq, err := NewProtectedRequest("POST", fmt.Sprintf("/api/club/%s/join", clubID), token, nil, "application/json")
		assert.NoError(t, err)
		joinResp, err := app.Test(joinReq)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, joinResp.StatusCode)
	}

	t.Run("Club message broadcasts to all joined users", func(t *testing.T) {
		// 5. Send a message from one user to the club
		message := handlers.ClubPostRequest{
			TextContent: "Hello, everyone!",
		}
		jsonBody, err := json.Marshal(message)
		assert.NoError(t, err)
		sendReq, err := NewProtectedRequest("POST", fmt.Sprintf("/api/club/%s/post", clubID), users[0].token, bytes.NewBuffer(jsonBody), "application/json")
		assert.NoError(t, err)
		sendResp, err := app.Test(sendReq)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, sendResp.StatusCode)

		// 6. Verify that all users receive the message
		for _, user := range users {
			var myMessage struct {
				Event   string              `json:"event"`
				Payload repository.ClubPost `json:"payload"`
			}
			for myMessage.Event != "new_post" {
				_, msg, err := user.conn.ReadMessage()
				assert.NoError(t, err)
				// read into message
				err = json.Unmarshal(msg, &myMessage)
				assert.NoError(t, err)
			}
			assert.Equal(t, "new_post", myMessage.Event)
			assert.Equal(t, message.TextContent, myMessage.Payload.Content)
		}
		// 6. including sender (club owner)
		var myMessage struct {
			Event   string              `json:"event"`
			Payload repository.ClubPost `json:"payload"`
		}
		for myMessage.Event != "new_post" {
			_, msg, err := clubOwnerConn.ReadMessage()
			assert.NoError(t, err)
			// read into message
			err = json.Unmarshal(msg, &myMessage)
			assert.NoError(t, err)
		}
		assert.Equal(t, "new_post", myMessage.Event)
		assert.Equal(t, message.TextContent, myMessage.Payload.Content)
	})
}
