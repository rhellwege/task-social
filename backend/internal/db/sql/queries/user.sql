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
    c.id, c.name, c.description, c.created_at, c.banner_image, cm.created_at AS joined_at
FROM club c
JOIN club_membership cm ON c.id = cm.club_id
WHERE cm.user_id = @user_id
ORDER BY cm.created_at DESC;
