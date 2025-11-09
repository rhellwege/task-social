# ---- Builder Stage ----
# This stage builds the Go binary using the Makefile
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache make git

WORKDIR /app

# Copy Go module files and download dependencies
# This is done first to leverage Docker layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Install the build tools (swag, sqlc) using the provided script
RUN ./scripts/get_tools.sh

# Build the application using the Makefile
# The 'build' target compiles the binary and generates swagger docs
RUN make build

# ---- Final Stage ----
# This stage creates the final, minimal image
FROM scratch

# Copy the compiled binary from the builder stage
COPY --from=builder /app/bin/tasksocial /tasksocial

# Expose the port the application listens on
EXPOSE 5050

# Set the entrypoint for the container
ENTRYPOINT ["/tasksocial"]
