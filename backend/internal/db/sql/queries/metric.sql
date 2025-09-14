-- name: CreateMetric :exec
INSERT INTO metric (id, club_id, title, description, interval, unit, requires_verification)
VALUES (@metric_id, @club_id, @title, @description, @interval, @unit, @requires_verification);

-- name: UpdateMetric :exec
UPDATE metric
SET
    title = COALESCE(sqlc.narg(title), title),
    description = COALESCE(sqlc.narg(description), description),
    interval = COALESCE(sqlc.narg(interval), interval),
    unit = COALESCE(sqlc.narg(unit), unit),
    requires_verification = COALESCE(sqlc.narg(requires_verification), requires_verification)
WHERE
    id = @id;

-- name: DeleteMetric :exec
DELETE FROM metric
WHERE
    id = @id;

-- name: CreateMetricInstance :exec
INSERT INTO metric_instance (id, metric_id, due_at)
VALUES (@id, @metric_id, @due_at);

-- name: DeleteMetricInstance :exec
DELETE FROM metric_instance
WHERE
    id = @id;

-- name: CreateMetricEntry :exec
INSERT INTO metric_entry (user_id, metric_instance_id, value)
VALUES (@user_id, @metric_instance_id, @value);

-- name: UpdateMetricEntry :exec
UPDATE metric_entry
SET
    value = COALESCE(sqlc.narg(value), value)
WHERE
    user_id = @user_id AND metric_instance_id = @metric_instance_id;

-- name: DeleteMetricEntry :exec
DELETE FROM metric_entry
WHERE
    user_id = @user_id AND metric_instance_id = @metric_instance_id;

-- name: CreateMetricEntryVerification :exec
INSERT INTO metric_entry_verification (entry_user_id, entry_metric_instance_id, verifier_user_id, verified, reason)
VALUES (@entry_user_id, @entry_metric_instance_id, @verifier_user_id, @verified, @reason);

-- name: UpdateMetricEntryVerification :exec
UPDATE metric_entry_verification
SET
    verified = COALESCE(sqlc.narg(verified), verified),
    reason = COALESCE(sqlc.narg(reason), reason)
WHERE
    entry_user_id = @entry_user_id AND entry_metric_instance_id = @entry_metric_instance_id AND verifier_user_id = @verifier_user_id;

-- name: DeleteMetricEntryVerification :exec
DELETE FROM metric_entry_verification
WHERE
    entry_user_id = @entry_user_id AND entry_metric_instance_id = @entry_metric_instance_id AND verifier_user_id = @verifier_user_id;

-- name: CreateMetricEntryAttachment :exec
INSERT INTO metric_entry_attachment (id, entry_user_id, entry_metric_instance_id, url)
VALUES (@id, @entry_user_id, @entry_metric_instance_id, @url);

-- name: UpdateMetricEntryAttachment :exec
UPDATE metric_entry_attachment
SET
    url = COALESCE(sqlc.narg(url), url)
WHERE
    id = @id;

-- name: DeleteMetricEntryAttachment :exec
DELETE FROM metric_entry_attachment
WHERE
    id = @id;
