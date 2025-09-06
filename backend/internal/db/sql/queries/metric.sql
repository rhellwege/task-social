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

-- name: UpdateMetricEntry :exec
UPDATE metric_entry
SET
    value = COALESCE(sqlc.narg(value), value)
WHERE
    user_id = @user_id AND metric_instance_id = @metric_instance_id;

-- name: UpdateMetricEntryVerification :exec
UPDATE metric_entry_verification
SET
    verified = COALESCE(sqlc.narg(verified), verified),
    reason = COALESCE(sqlc.narg(reason), reason)
WHERE
    metric_entry_id = @metric_entry_id AND verifier_user_id = @verifier_user_id;

-- name: UpdateMetricEntryAttachment :exec
UPDATE metric_entry_attachment
SET
    url = COALESCE(sqlc.narg(url), url)
WHERE
    id = @id;
