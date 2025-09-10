-- Triggers for updated_at

CREATE TRIGGER IF NOT EXISTS update_user_updated_at
AFTER UPDATE ON user
FOR EACH ROW
BEGIN
    UPDATE user SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_friendship_updated_at
AFTER UPDATE ON user_friendship
FOR EACH ROW
BEGIN
    UPDATE user_friendship SET updated_at = CURRENT_TIMESTAMP WHERE user_id = OLD.user_id AND friend_id = OLD.friend_id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_private_message_updated_at
AFTER UPDATE ON user_private_message
FOR EACH ROW
BEGIN
    UPDATE user_private_message SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_private_message_attachment_updated_at
AFTER UPDATE ON user_private_message_attachment
FOR EACH ROW
BEGIN
    UPDATE user_private_message_attachment SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_club_updated_at
AFTER UPDATE ON club
FOR EACH ROW
BEGIN
    UPDATE club SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_club_membership_updated_at
AFTER UPDATE ON club_membership
FOR EACH ROW
BEGIN
    UPDATE club_membership SET updated_at = CURRENT_TIMESTAMP WHERE user_id = OLD.user_id AND club_id = OLD.club_id;
END;

CREATE TRIGGER IF NOT EXISTS update_club_post_updated_at
AFTER UPDATE ON club_post
FOR EACH ROW
BEGIN
    UPDATE club_post SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_club_post_attachment_updated_at
AFTER UPDATE ON club_post_attachment
FOR EACH ROW
BEGIN
    UPDATE club_post_attachment SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_metric_updated_at
AFTER UPDATE ON metric
FOR EACH ROW
BEGIN
    UPDATE metric SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_metric_instance_updated_at
AFTER UPDATE ON metric_instance
FOR EACH ROW
BEGIN
    UPDATE metric_instance SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_metric_entry_updated_at
AFTER UPDATE ON metric_entry
FOR EACH ROW
BEGIN
    UPDATE metric_entry SET updated_at = CURRENT_TIMESTAMP WHERE user_id = OLD.user_id AND metric_instance_id = OLD.metric_instance_id;
END;

CREATE TRIGGER IF NOT EXISTS update_metric_entry_verification_updated_at
AFTER UPDATE ON metric_entry_verification
FOR EACH ROW
BEGIN
    UPDATE metric_entry_verification SET updated_at = CURRENT_TIMESTAMP WHERE metric_entry_id = OLD.metric_entry_id AND verifier_user_id = OLD.verifier_user_id;
END;

CREATE TRIGGER IF NOT EXISTS update_metric_entry_attachment_updated_at
AFTER UPDATE ON metric_entry_attachment
FOR EACH ROW
BEGIN
    UPDATE metric_entry_attachment SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
