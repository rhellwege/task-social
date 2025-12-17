package handlers

type ErrorResponse struct {
	Error string `json:"error"`
}

type SuccessResponse struct {
	Message string `json:"message"`
}

type CreatedResponse struct {
	Message string `json:"message"`
	ID      string `json:"id"`
}

type SuccessfulLoginResponse struct {
	Message string `json:"message"`
	Token   string `json:"token"`
}
