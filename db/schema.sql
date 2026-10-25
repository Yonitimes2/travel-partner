-- Travel Partner (שותף לדרך) — the database structure. MySQL 8, utf8mb4.
-- Apply to an empty database:  mysql travel_partner < db/schema.sql
-- The app's types for every row are in src/lib/types.ts.

SET NAMES utf8mb4;

-- People. Each belongs to one section (gender) for good; full_name and phone are private (admins only).
CREATE TABLE users (
  id              VARCHAR(32)  NOT NULL,
  nickname        VARCHAR(40)  NOT NULL,
  full_name       VARCHAR(80)  NOT NULL,
  phone           VARCHAR(15)  NOT NULL COMMENT 'digits only; verified by SMS',
  gender          ENUM('male','female') NOT NULL COMMENT 'the section; set at sign-up, never changes',
  avatar          VARCHAR(20)  NOT NULL,
  age_group       ENUM('18-25','26-35','36-50','50+') NOT NULL,
  observance      ENUM('strict','kosher','traditional') NOT NULL,
  pace            ENUM('easy','medium','hard') NOT NULL,
  party           JSON         NOT NULL COMMENT 'who they travel with: {type:solo} | {type:group,others,note} | {type:family,parents,kids}',
  city            VARCHAR(60)  NOT NULL DEFAULT '',
  about           VARCHAR(300) NOT NULL DEFAULT '',
  status          ENUM('pending','active','suspended') NOT NULL DEFAULT 'pending',
  role            ENUM('member','admin') NOT NULL DEFAULT 'member' COMMENT 'an admin manages their own section only',
  referred_by     VARCHAR(32)  NULL COMMENT 'the member who recommended them, found by phone',
  referral_name   VARCHAR(80)  NULL COMMENT 'the recommender''s full name as typed, for the admins to check',
  referral_phone  VARCHAR(15)  NULL,
  notify_push     BOOLEAN      NOT NULL DEFAULT TRUE,
  notify_email    BOOLEAN      NOT NULL DEFAULT FALSE,
  history_trips   INT          NOT NULL DEFAULT 0 COMMENT 'sample data only: activity before this database',
  history_joined  INT          NOT NULL DEFAULT 0,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_phone (phone),
  KEY ix_users_section (gender, status),
  CONSTRAINT fk_users_referred_by FOREIGN KEY (referred_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trips. Planned: free, an idea, dates may have options. Closed: going ahead, paid, can accept partners.
CREATE TABLE trips (
  id               VARCHAR(32)  NOT NULL,
  owner_id         VARCHAR(32)  NOT NULL,
  kind             ENUM('planned','closed') NOT NULL,
  status           ENUM('open','full') NOT NULL DEFAULT 'open' COMMENT 'full: the owner found partners',
  area             ENUM('north','center','jerusalem','south','europe','usa','asia','other') NOT NULL,
  place            VARCHAR(120) NOT NULL,
  photo            VARCHAR(40)  NULL COMMENT 'a photo id from src/lib/photos.ts',
  start_date       DATE         NOT NULL,
  end_date         DATE         NOT NULL,
  flex_type        ENUM('fixed','alt','range') NOT NULL DEFAULT 'fixed' COMMENT 'planned trips: only these dates, a second date, or ± days',
  flex_alt_start   DATE         NULL,
  flex_range_days  SMALLINT     NULL,
  wanted           ENUM('one','few','families') NOT NULL COMMENT 'families: shown in both sections',
  styles           JSON         NOT NULL,
  description      TEXT         NOT NULL,
  deadline_type    ENUM('date','daysBefore') NOT NULL,
  deadline_date    DATE         NULL,
  deadline_days    SMALLINT     NULL,
  closed_at        DATETIME     NULL COMMENT 'when it became a closed trip',
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_trips_owner (owner_id),
  KEY ix_trips_feed (kind, status, start_date),
  CONSTRAINT fk_trips_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Requests to join. One per person per trip; a chat exists only once one is accepted.
CREATE TABLE join_requests (
  id            VARCHAR(32)  NOT NULL,
  trip_id       VARCHAR(32)  NOT NULL,
  from_user_id  VARCHAR(32)  NOT NULL,
  note          VARCHAR(200) NOT NULL DEFAULT '',
  party         JSON         NOT NULL COMMENT 'who is coming, same shape as users.party',
  status        ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at    DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_requests_once (trip_id, from_user_id),
  KEY ix_requests_from (from_user_id),
  CONSTRAINT fk_requests_trip FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
  CONSTRAINT fk_requests_from FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chat messages, always inside an accepted request.
CREATE TABLE messages (
  id            VARCHAR(32)   NOT NULL,
  request_id    VARCHAR(32)   NOT NULL,
  from_user_id  VARCHAR(32)   NOT NULL,
  text          VARCHAR(2000) NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at       DATETIME      NULL,
  PRIMARY KEY (id),
  KEY ix_messages_thread (request_id, created_at),
  CONSTRAINT fk_messages_request FOREIGN KEY (request_id) REFERENCES join_requests (id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_from FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reports to the section's admins.
CREATE TABLE reports (
  id             VARCHAR(32)  NOT NULL,
  from_user_id   VARCHAR(32)  NOT NULL,
  about_user_id  VARCHAR(32)  NOT NULL,
  reason         ENUM('behavior','fake','spam','other') NOT NULL,
  text           VARCHAR(300) NOT NULL DEFAULT '',
  status         ENUM('open','handled') NOT NULL DEFAULT 'open',
  handled_by     VARCHAR(32)  NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  handled_at     DATETIME     NULL,
  PRIMARY KEY (id),
  KEY ix_reports_open (status, created_at),
  CONSTRAINT fk_reports_from FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_about FOREIGN KEY (about_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_handled_by FOREIGN KEY (handled_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Blocks: the two people stop seeing each other.
CREATE TABLE blocks (
  by_user_id       VARCHAR(32) NOT NULL,
  blocked_user_id  VARCHAR(32) NOT NULL,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (by_user_id, blocked_user_id),
  KEY ix_blocks_blocked (blocked_user_id),
  CONSTRAINT fk_blocks_by FOREIGN KEY (by_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_blocks_blocked FOREIGN KEY (blocked_user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
