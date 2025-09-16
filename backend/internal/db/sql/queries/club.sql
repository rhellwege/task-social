-- name: CreateClub :exec
INSERT INTO club (id, name, description, owner_user_id, banner_image, is_public)
VALUES (@id, @name, @description, @owner_user_id, @banner_image, @is_public);

-- name: GetClub :one
SELECT * FROM club WHERE id = @id;

-- name: UpdateClub :exec
UPDATE club
SET
    name = COALESCE(sqlc.narg(name), name),
    description = COALESCE(sqlc.narg(description), description),
    banner_image = COALESCE(sqlc.narg(banner_image), banner_image),
    is_public = COALESCE(sqlc.narg(is_public), is_public)
WHERE
    id = @id;

-- name: GetClubLeaderboard :many
SELECT
    u.id, u.username, u.profile_picture,
    cm.user_points, cm.user_streak,
    cm.created_at AS joined_at
FROM
    club_membership cm
    JOIN user u ON cm.user_id = u.id
WHERE
    club_id = @club_id
ORDER BY cm.user_points DESC, cm.user_streak DESC;

-- name: DeleteClub :exec
DELETE FROM club
WHERE
    id = @id;

-- name: CreateClubMembership :exec
INSERT INTO club_membership (user_id, club_id, is_moderator)
VALUES (@user_id, @club_id, @is_moderator);

-- name: UpdateClubMembership :exec
UPDATE club_membership
SET
    user_points = COALESCE(sqlc.narg(user_points), user_points),
    user_streak = COALESCE(sqlc.narg(user_streak), user_streak),
    is_moderator = COALESCE(sqlc.narg(is_moderator), is_moderator)
WHERE
    user_id = @user_id AND club_id = @club_id;

-- name: DeleteClubMembership :exec
DELETE FROM club_membership
WHERE
    user_id = @user_id AND club_id = @club_id;

-- name: CreateClubPost :exec
INSERT INTO club_post (id, club_id, user_id, content)
VALUES (@id, @club_id, @user_id, @content);

-- name: UpdateClubPost :exec
UPDATE club_post
SET
    content = COALESCE(sqlc.narg(content), content)
WHERE
    id = @id;

-- name: DeleteClubPost :exec
DELETE FROM club_post
WHERE
    id = @id;

-- name: CreateClubPostAttachment :exec
INSERT INTO club_post_attachment (id, post_id, url)
VALUES (@id, @post_id, @url);

-- name: UpdateClubPostAttachment :exec
UPDATE club_post_attachment
SET
    url = COALESCE(sqlc.narg(url), url)
WHERE
    id = @id;

-- name: DeleteClubPostAttachment :exec
DELETE FROM club_post_attachment
WHERE
    id = @id;

-- name: GetPublicClubs :many
-- TODO: Implement pagination with LIMIT and OFFSET
SELECT * FROM club
WHERE is_public = true;

-- name: GetClubMetrics :many
SELECT * FROM metric
WHERE club_id = ?;

-- name GetActiveMetricInstances
SELECT * FROM metric_instance AS mi
JOIN metric ON metric_instance = id
WHERE due_at < NOW();

-- name: IsUserMemberOfClub :one
-- returns boolean
SELECT EXISTS(SELECT 1 FROM club_membership WHERE user_id = ? AND club_id = ?);

-- name: IsUserModeratorOfClub :one
-- returns boolean
SELECT is_moderator FROM club_membership WHERE user_id = ? AND club_id = ?;

-- name: IsUserOwnerOfClub :one
-- returns boolean
SELECT EXISTS(SELECT 1 FROM club WHERE id = @club_id AND owner_user_id = @user_id);
