-- Language: sqlite

CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    profile_picture TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trades (
    id TEXT NOT NULL PRIMARY KEY,
    proposer_id TEXT NOT NULL,
    proposer_item_id TEXT NOT NULL,
    responder_id TEXT NOT NULL,
    responder_item_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (proposer_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (responder_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (proposer_item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (responder_item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS items (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    owner_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_friendship (
    user_id TEXT NOT NULL,
    friend_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT user_friendship_order CHECK (user_id < friend_id)
);

CREATE TABLE IF NOT EXISTS user_private_message (
    id TEXT NOT NULL PRIMARY KEY,
    sender_id TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_private_message_attachment (
    id TEXT NOT NULL PRIMARY KEY,
    user_private_message_id TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_private_message_id) REFERENCES user_private_message(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS club (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_user_id TEXT NOT NULL,
    banner_image TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS club_tag (
    club_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY (club_id, tag),
    FOREIGN KEY (club_id) REFERENCES club(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS club_membership (
    user_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    user_points REAL NOT NULL DEFAULT 0.0,
    user_streak INTEGER NOT NULL DEFAULT 0,
    is_moderator BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, club_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES club(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS club_post (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES club(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS club_post_attachment (
    id TEXT NOT NULL PRIMARY KEY,
    post_id TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES club_post(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS metric (
    id TEXT NOT NULL PRIMARY KEY,
    club_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    interval TEXT NOT NULL, -- interval in ISO 8601 format
    start_at DATETIME NOT NULL, -- determines the offset from the start of the interval
    unit TEXT NOT NULL, -- custom, can be miles, pages read etc
    unit_is_integer BOOLEAN NOT NULL DEFAULT FALSE, -- determines if the unit is an integer
    requires_verification BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES club(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS metric_instance (
    id TEXT NOT NULL PRIMARY KEY,
    metric_id TEXT NOT NULL,
    due_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (metric_id) REFERENCES metric(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS metric_entry (
    user_id TEXT NOT NULL,
    metric_instance_id TEXT NOT NULL,
    value REAL NOT NULL, -- interpreted as int or real
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, metric_instance_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (metric_instance_id) REFERENCES metric_instance(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS metric_entry_verification (
    entry_user_id TEXT NOT NULL,
    entry_metric_instance_id TEXT NOT NULL,
    verifier_user_id TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    reason TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (entry_user_id, entry_metric_instance_id, verifier_user_id),
    FOREIGN KEY (entry_user_id, entry_metric_instance_id) REFERENCES metric_entry(user_id, metric_instance_id) ON DELETE CASCADE,
    FOREIGN KEY (verifier_user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS metric_entry_attachment (
    id TEXT NOT NULL PRIMARY KEY,
    entry_user_id TEXT NOT NULL,
    entry_metric_instance_id TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entry_user_id, entry_metric_instance_id) REFERENCES metric_entry(user_id, metric_instance_id) ON DELETE CASCADE
);
