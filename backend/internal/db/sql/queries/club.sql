-- name: UpdateClub :exec
UPDATE club
SET
    name = COALESCE(sqlc.narg(name), name),
    description = COALESCE(sqlc.narg(description), description),
    owner_user_id = COALESCE(sqlc.narg(owner_user_id), owner_user_id),
    banner_image = COALESCE(sqlc.narg(banner_image), banner_image),
    is_public = COALESCE(sqlc.narg(is_public), is_public)
WHERE
    id = @id;

-- name: UpdateClubMembership :exec
UPDATE club_membership
SET
    user_points = COALESCE(sqlc.narg(user_points), user_points),
    user_streak = COALESCE(sqlc.narg(user_streak), user_streak),
    is_moderator = COALESCE(sqlc.narg(is_moderator), is_moderator)
WHERE
    user_id = @user_id AND club_id = @club_id;

-- name: UpdateClubPost :exec
UPDATE club_post
SET
    content = COALESCE(sqlc.narg(content), content)
WHERE
    id = @id;

-- name: UpdateClubPostAttachment :exec
UPDATE club_post_attachment
SET
    url = COALESCE(sqlc.narg(url), url)
WHERE
    id = @id;
