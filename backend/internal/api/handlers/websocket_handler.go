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
		return websocket.New(func(conn *websocket.Conn) {
			userID, ok := conn.Locals("userID").(string)
			if !ok {
				log.Println("Unauthorized WebSocket connection")
				conn.Close()
				return
			}

			jwtToken, ok := conn.Locals("jwt").(*jwt.Token)
			if !ok {
				log.Println("Unauthorized WebSocket connection: missing jwt")
				conn.Close()
				return
			}

			wsService.AddConnection(userID, conn, jwtToken)
			defer wsService.RemoveConnection(userID)

			log.Printf("WebSocket connection established for user %s", userID)

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
