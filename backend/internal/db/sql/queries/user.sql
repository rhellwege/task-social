-- name: CreateUser :exec
INSERT INTO user (id, email, username, password)
VALUES (?, ?, ?, ?);

-- name: GetUserLoginByEmail :one
SELECT id, email, username, password
FROM user
WHERE email = ?;

-- name: GetUserLoginByUsername :one
SELECT id, email, username, password
FROM user
WHERE username = ?;

-- name: GetUserDisplay :one
SELECT username, profile_picture, created_at
FROM user
WHERE id = ?;

-- name: DeleteUser :exec
DELETE FROM user WHERE id = ?;

-- name: CreateItem :exec
INSERT INTO items (id, name, description, is_available, owner_id)
VALUES (?, ?, ?, ?, ?);

-- name: GetItem :one
SELECT *
FROM items
WHERE id = ?;

-- name: GetItemsByOwner :many
SELECT *
FROM items
WHERE owner_id = ?;

-- name: UpdateItem :exec
UPDATE items
SET
    name = COALESCE(sqlc.narg(name), name),
    description = COALESCE(sqlc.narg(description), description),
    is_available = COALESCE(sqlc.narg(is_available), is_available),
    owner_id = COALESCE(sqlc.narg(owner_id), owner_id)
WHERE
    id = @id;

-- name: DeleteItem :exec
DELETE FROM items WHERE id = ?;

-- name: TradeCreate :exec
INSERT INTO trades (id, proposer_id, proposer_item_id, responder_id, responder_item_id, status, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- name: GetTradeByID :one
SELECT *
FROM trades
WHERE id = ?;

-- name: UpdateTradeStatus :exec
UPDATE trades
SET status = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: TransferItemOwnership :exec
UPDATE items
SET owner_id = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: CreateFriend :exec
INSERT INTO user_friendship (user_id, friend_id)
VALUES (?, ?);

-- name: DeleteFriend :exec
-- assumes user_id < friend_id
DELETE FROM user_friendship
WHERE user_id = ? AND friend_id = ?;

-- name: GetFriends :many
-- assumes user_id < friend_id
-- TODO: add user friendship created at
SELECT u.username, u.profile_picture, u.id  FROM user u WHERE u.id IN (
    SELECT friend_id FROM user_friendship f WHERE f.user_id = @id
    UNION
    SELECT user_id FROM user_friendship f WHERE f.friend_id = @id
);

-- name: UpdateUser :exec
UPDATE user
SET
    email = COALESCE(sqlc.narg(email), email),
    username = COALESCE(sqlc.narg(username), username),
    password = COALESCE(sqlc.narg(password), password),
    profile_picture = COALESCE(sqlc.narg(profile_picture), profile_picture)
WHERE
    id = @id;

-- name: UpdateUserPrivateMessage :exec
UPDATE user_private_message
SET
    content = COALESCE(sqlc.narg(content), content)
WHERE
    id = @id;

-- name: GetUserClubs :many
SELECT
    c.id AS club_id, c.name,
    c.description, c.created_at,
    c.banner_image, cm.user_points,
    cm.user_streak, cm.created_at AS joined_at
FROM club c
JOIN club_membership cm ON c.id = cm.club_id
WHERE cm.user_id = @user_id
ORDER BY cm.created_at DESC;

-- name: GetUserMetrics :many
SELECT m.* FROM metric m
JOIN club_membership cm ON m.club_id = cm.club_id
WHERE cm.user_id = ?;

-- name: GetUserMetricEntries :many
SELECT me.* FROM metric_entry me
JOIN metric m ON me.metric_id = m.id
JOIN club_membership cm ON m.club_id = cm.club_id
WHERE cm.user_id = ?;
