import mysql from "mysql2/promise";

/**
 * MySQL connection pool and schema. Tables are created on first use, so a fresh database
 * only needs to exist (with a user that owns it) and DATABASE_URL pointing at it.
 * Calendar days are kept as "yyyy-mm-dd" text, like in the app; moments as DATETIME(3) in UTC.
 */

const g = globalThis as unknown as { __tpPool?: mysql.Pool; __tpReady?: Promise<void>; __tpSteps?: number };

function pool(): mysql.Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  g.__tpPool ??= mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 10,
    charset: "utf8mb4",
    timezone: "Z",
  });
  return g.__tpPool;
}

/** The pool, after the schema is in place. */
export async function db(): Promise<mysql.Pool> {
  const p = pool();
  // new schema steps (after a code change in development) are applied on the next use
  if (g.__tpSteps !== STEPS.length) {
    g.__tpSteps = STEPS.length;
    g.__tpReady = undefined;
  }
  g.__tpReady ??= migrate(p).catch((e) => {
    g.__tpReady = undefined;
    throw e;
  });
  await g.__tpReady;
  return p;
}

/** closes the pool (for scripts, so the process can end) */
export async function closeDb() {
  await g.__tpPool?.end();
  g.__tpPool = undefined;
  g.__tpReady = undefined;
}

export type Row = mysql.RowDataPacket;
export type Conn = mysql.PoolConnection;

/** Runs `fn` in a transaction. */
export async function tx<T>(fn: (c: Conn) => Promise<T>): Promise<T> {
  const c = await (await db()).getConnection();
  try {
    await c.beginTransaction();
    const out = await fn(c);
    await c.commit();
    return out;
  } catch (e) {
    await c.rollback().catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

const STEPS: string[][] = [
  // 1: people, trips, requests and chats, moderation, sign-in codes
  [
    `CREATE TABLE users (
      id VARCHAR(40) NOT NULL PRIMARY KEY,
      email VARCHAR(190) NOT NULL UNIQUE,
      gender ENUM('male','female') NOT NULL,
      nickname VARCHAR(40) NOT NULL,
      avatar VARCHAR(20) NOT NULL,
      full_name VARCHAR(80) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      party JSON NOT NULL,
      age_group VARCHAR(8) NOT NULL,
      observance VARCHAR(12) NOT NULL,
      pace VARCHAR(8) NOT NULL,
      city VARCHAR(60) NOT NULL DEFAULT '',
      about VARCHAR(400) NOT NULL DEFAULT '',
      status ENUM('pending','active','suspended') NOT NULL,
      referred_by VARCHAR(40) NULL,
      referral JSON NULL,
      history JSON NOT NULL,
      notify JSON NOT NULL,
      admin_of SET('male','female') NOT NULL DEFAULT '',
      lang ENUM('he','en') NOT NULL DEFAULT 'he',
      session_version INT NOT NULL DEFAULT 1,
      created_at DATETIME(3) NOT NULL,
      updated_at DATETIME(3) NOT NULL,
      KEY by_phone (phone),
      KEY by_gender (gender, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE trips (
      id VARCHAR(40) NOT NULL PRIMARY KEY,
      owner_id VARCHAR(40) NOT NULL,
      kind ENUM('planned','closed') NOT NULL,
      status ENUM('open','full') NOT NULL,
      area VARCHAR(12) NOT NULL,
      place VARCHAR(160) NOT NULL,
      photo VARCHAR(40) NULL,
      start_date CHAR(10) NOT NULL,
      end_date CHAR(10) NOT NULL,
      flex JSON NULL,
      wanted VARCHAR(10) NOT NULL,
      styles JSON NOT NULL,
      description TEXT NOT NULL,
      deadline JSON NOT NULL,
      created_at DATETIME(3) NOT NULL,
      updated_at DATETIME(3) NOT NULL,
      KEY by_owner (owner_id),
      KEY by_end (end_date),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE requests (
      id VARCHAR(40) NOT NULL PRIMARY KEY,
      trip_id VARCHAR(40) NOT NULL,
      from_user_id VARCHAR(40) NOT NULL,
      note VARCHAR(400) NOT NULL DEFAULT '',
      party JSON NOT NULL,
      status ENUM('pending','accepted','declined') NOT NULL,
      created_at DATETIME(3) NOT NULL,
      updated_at DATETIME(3) NOT NULL,
      UNIQUE KEY one_per_trip (trip_id, from_user_id),
      KEY by_from (from_user_id),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE messages (
      id VARCHAR(40) NOT NULL PRIMARY KEY,
      request_id VARCHAR(40) NOT NULL,
      from_user_id VARCHAR(40) NOT NULL,
      text TEXT NOT NULL,
      at DATETIME(3) NOT NULL,
      KEY by_request (request_id, at),
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE reports (
      id VARCHAR(40) NOT NULL PRIMARY KEY,
      from_user_id VARCHAR(40) NOT NULL,
      about_user_id VARCHAR(40) NOT NULL,
      reason ENUM('behavior','fake','spam','other') NOT NULL,
      text VARCHAR(600) NOT NULL DEFAULT '',
      status ENUM('open','handled') NOT NULL,
      created_at DATETIME(3) NOT NULL,
      KEY by_about (about_user_id),
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (about_user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE blocks (
      by_user VARCHAR(40) NOT NULL,
      who VARCHAR(40) NOT NULL,
      created_at DATETIME(3) NOT NULL,
      PRIMARY KEY (by_user, who),
      KEY by_who (who),
      FOREIGN KEY (by_user) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (who) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    // a sign-in code is kept only as an HMAC; it lasts minutes and allows a few attempts
    `CREATE TABLE login_codes (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(190) NOT NULL,
      hash CHAR(64) NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      expires_at DATETIME(3) NOT NULL,
      created_at DATETIME(3) NOT NULL,
      KEY by_email (email, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    // when an email of some kind was last sent, so chats don't flood anyone's inbox
    `CREATE TABLE email_throttle (
      k VARCHAR(160) NOT NULL PRIMARY KEY,
      sent_at DATETIME(3) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ],
];

async function migrate(p: mysql.Pool) {
  const c = await p.getConnection();
  try {
    // one server process migrates at a time
    await c.query("SELECT GET_LOCK('travel_partner_migrate', 30)");
    await c.query("CREATE TABLE IF NOT EXISTS schema_version (v INT NOT NULL) ENGINE=InnoDB");
    const [rows] = await c.query<Row[]>("SELECT v FROM schema_version");
    let v = rows[0]?.v ?? 0;
    if (!rows.length) await c.query("INSERT INTO schema_version (v) VALUES (0)");
    for (; v < STEPS.length; v++) {
      for (const sql of STEPS[v]) await c.query(sql);
      await c.query("UPDATE schema_version SET v = ?", [v + 1]);
    }
  } finally {
    await c.query("SELECT RELEASE_LOCK('travel_partner_migrate')").catch(() => {});
    c.release();
  }
}
