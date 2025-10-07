package services

import (
	"errors"
	"sync"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2/log"
	"github.com/golang-jwt/jwt/v5"
)

type WebSocketConnection struct {
	Conn *websocket.Conn
	JWT  *jwt.Token
}

type WebSocketService struct {
	connections map[string]WebSocketConnection
	mu          sync.Mutex
}

func NewWebSocketService() *WebSocketService {
	return &WebSocketService{
		connections: make(map[string]WebSocketConnection),
	}
}

func (s *WebSocketService) AddConnection(userID string, conn *websocket.Conn, jwt *jwt.Token) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.connections[userID] = WebSocketConnection{Conn: conn, JWT: jwt}
}

func (s *WebSocketService) RemoveConnection(userID string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.connections, userID)
}

func (s *WebSocketService) GetConnection(userID string) (*websocket.Conn, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	conn, ok := s.connections[userID]
	if !ok {
		return nil, false
	}
	return conn.Conn, true
}

func (s *WebSocketService) CleanUpExpiredConnections() {
	s.mu.Lock()
	defer s.mu.Unlock()
	for userID, connData := range s.connections {
		expTime, err := connData.JWT.Claims.GetExpirationTime()
		if err != nil || expTime == nil {
			log.Errorf("Error getting expiration time for user %s: %v", userID, err)
			continue
		}
		if expTime.Before(time.Now()) {
			delete(s.connections, userID)
			connData.Conn.Close()
		}
	}
}

func (s *WebSocketService) BroadcastMessage(recipients []string, message string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, recipient := range recipients {
		connData, ok := s.connections[recipient]
		if !ok {
			continue
		}
		if err := connData.Conn.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
			connData.Conn.Close()
			log.Errorf("Error sending message to %s: %v", recipient, err)
			delete(s.connections, recipient)
			return err
		}
	}
	return nil
}

func (s *WebSocketService) BroadcastGlobalMessage(message string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for userID, connData := range s.connections {
		if err := connData.Conn.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
			connData.Conn.Close()
			log.Errorf("Error sending message to %s: %v", userID, err)
			delete(s.connections, userID)
			return err
		}
	}
	return nil
}

func (s *WebSocketService) SendMessage(recipient string, message string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	connData, ok := s.connections[recipient]
	if !ok {
		return errors.New("recipient not found")
	}
	if err := connData.Conn.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
		connData.Conn.Close()
		log.Errorf("Error sending message to %s: %v", recipient, err)
		delete(s.connections, recipient)
		return err
	}
	return nil
}
