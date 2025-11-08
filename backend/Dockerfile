# ---- Builder Stage ----
# This stage builds the Go binary
FROM golang:1.25-bookworm AS builder

# Arguments for versioning, passed from the docker build command
ARG TAG
ARG COMMIT_HASH
ARG BUILD_DATE

# Install build dependencies
RUN apt-get update && apt-get install -y gcc libwebp-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the application, passing version info via ldflags
# This replaces the need for the Makefile and .git directory inside the container
RUN PACKAGE="github.com/rhellwege/task-social" && \
    LDFLAGS="-X '${PACKAGE}/config.Version=${TAG}' -X '${PACKAGE}/config.CommitHash=${COMMIT_HASH}' -X '${PACKAGE}/config.BuildDate=${BUILD_DATE}'" && \
    CGO_ENABLED=1 go build -ldflags="$LDFLAGS" -o /app/tasksocial ./cmd/main.go

# ---- Final Stage ----
# This stage creates the final, minimal image
FROM debian:bookworm-slim

# Install the required runtime dependency for libwebp
RUN apt-get update && apt-get install -y libwebp7 && rm -rf /var/lib/apt/lists/*

# Copy the compiled binary from the builder stage
COPY --from=builder /app/tasksocial /tasksocial

# Expose the port the application listens on
EXPOSE 5050

# Set the entrypoint for the container
ENTRYPOINT ["/tasksocial"]
