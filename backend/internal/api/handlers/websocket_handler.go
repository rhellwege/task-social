package handlers

import (
	"log"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rhellwege/task-social/internal/api/services"
)

func WebSocketHandler(wsService *services.WebSocketService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		return websocket.New(func(conn *websocket.Conn) {
			userID, ok := conn.Locals("userID").(string)
			if !ok {
				log.Println("Unauthorized WebSocket connection")
				conn.Close()
				return
			}

			jwtToken, ok := conn.Locals("jwt").(*jwt.Token)
			if !ok {
				log.Println("Unauthorized WebSocket connection: missing token")
				conn.Close()
				return
			}

			wsService.AddConnection(ctx, userID, conn, jwtToken)
			defer wsService.RemoveConnection(ctx, userID)

			log.Printf("WebSocket connection established for user %s", userID)

			// if the client sends through the connection, echo back.
			// chat messages are sent through the api then broadcasted on ws
			for {
				mt, msg, err := conn.ReadMessage()
				if err != nil {
					log.Println("read:", err)
					break
				}
				log.Printf("recv: %s", msg)
				err = conn.WriteMessage(mt, msg)
				if err != nil {
					log.Println("write:", err)
					break
				}
			}
		})(c)
	}
}
