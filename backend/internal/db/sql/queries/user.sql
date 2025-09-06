-- name: CreateUser :exec
INSERT INTO user (id, email, username, password)
VALUES (?, ?, ?, ?);

-- name: GetUserDisplay :one
SELECT username, profile_picture, created_at
FROM user
WHERE id = ?;

-- name: GetUserLogin :one
SELECT id, email, username, password
FROM user
WHERE username = ?;

-- name: DeleteUser :exec
DELETE FROM user WHERE id = ?;

-- name: UpdateUserEmail :exec
UPDATE user SET email = ? WHERE id = ?;

-- name: UpdateUserPassword :exec
UPDATE user SET password = ? WHERE id = ?;

-- name: UpdateUserProfilePicture :exec
UPDATE user SET profile_picture = ? WHERE id = ?;

-- name: CreateFriend :exec
INSERT INTO user_friendship (user_id, friend_id)
VALUES (?, ?);

-- name: DeleteFriend :exec
-- assumes user_id < friend_id
DELETE FROM user_friendship
WHERE user_id = ? AND friend_id = ?;

-- name: GetFriends :many
-- assumes user_id < friend_id
SELECT u.username, u.profile_picture, u.id FROM user u WHERE u.id IN (
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

-- name: UpdateUserPrivateMessageAttachment :exec
UPDATE user_private_message_attachment
SET
    url = COALESCE(sqlc.narg(url), url)
WHERE
    id = @id;
