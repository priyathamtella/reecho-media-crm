package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// DB is the global database connection pool.
var DB *sqlx.DB

// DBconnect initialises the Postgres connection and runs schema creation.
// Admin credentials are read from environment variables — never hardcoded.
func DBconnect() {
	if err := godotenv.Load(); err != nil {
		log.Println("[DB] .env not found — using system env vars")
	}

	dsn := os.Getenv("DSN")
	if dsn == "" {
		log.Fatal("[DB] DSN environment variable is not set")
	}

	var err error
	DB, err = sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatalf("[DB] Connection failed: %v", err)
	}
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(5 * time.Minute)

	if err := createSchema(); err != nil {
		log.Fatalf("[DB] Schema creation failed: %v", err)
	}
	fmt.Println("[DB] Connected and schema ready.")

	bootstrapAdmin()
}

// createSchema creates all tables if they don't yet exist.
func createSchema() error {
	schema := `
CREATE TABLE IF NOT EXISTS users (
	id         UUID         PRIMARY KEY,
	name       TEXT         NOT NULL,
	email      TEXT         UNIQUE NOT NULL,
	password   TEXT         NOT NULL,
	role       TEXT         NOT NULL DEFAULT 'admin',
	created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boards (
	id               UUID         PRIMARY KEY,
	title            TEXT         NOT NULL,
	owner_id         UUID         NOT NULL,
	full_state       JSONB        NOT NULL DEFAULT '{}',
	zoom             FLOAT        NOT NULL DEFAULT 1.0,
	pan_x            FLOAT        NOT NULL DEFAULT 0.0,
	pan_y            FLOAT        NOT NULL DEFAULT 0.0,
	client_name      TEXT         NOT NULL DEFAULT '',
	client_status    TEXT         NOT NULL DEFAULT 'Pending',
	client_feedback  TEXT         NOT NULL DEFAULT '',
	linked_task_id   INTEGER      NOT NULL DEFAULT 0,
	linked_doc_id    UUID,
	review_status    TEXT         NOT NULL DEFAULT '',
	reviewer_name    TEXT         NOT NULL DEFAULT '',
	created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
	id               UUID         PRIMARY KEY,
	title            TEXT         NOT NULL,
	content          TEXT         NOT NULL DEFAULT '',
	owner_id         UUID         NOT NULL,
	linked_board_id  UUID,
	linked_task_id   INTEGER      NOT NULL DEFAULT 0,
	review_status    TEXT         NOT NULL DEFAULT '',
	reviewer_name    TEXT         NOT NULL DEFAULT '',
	created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
	id             SERIAL       PRIMARY KEY,
	user_id        TEXT         NOT NULL DEFAULT '',
	name           TEXT         NOT NULL DEFAULT '',
	email          TEXT         NOT NULL DEFAULT '',
	industry       TEXT         NOT NULL DEFAULT '',
	package        TEXT         NOT NULL DEFAULT '',
	status         TEXT         NOT NULL DEFAULT '',
	monthly_value  INTEGER      NOT NULL DEFAULT 0,
	initials       TEXT         NOT NULL DEFAULT '',
	color          TEXT         NOT NULL DEFAULT '',
	created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	deleted_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tasks (
	id               SERIAL       PRIMARY KEY,
	user_id          TEXT         NOT NULL DEFAULT '',
	client           TEXT         NOT NULL DEFAULT '',
	title            TEXT         NOT NULL DEFAULT '',
	tag              TEXT         NOT NULL DEFAULT '',
	status           TEXT         NOT NULL DEFAULT '',
	due_date         TEXT         NOT NULL DEFAULT '',
	assignees        TEXT         NOT NULL DEFAULT '',
	linked_board_id  TEXT         NOT NULL DEFAULT '',
	linked_doc_id    TEXT         NOT NULL DEFAULT '',
	created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	deleted_at       TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoices (
	id              SERIAL       PRIMARY KEY,
	user_id         TEXT         NOT NULL DEFAULT '',
	invoice_id      TEXT         NOT NULL DEFAULT '',
	client          TEXT         NOT NULL DEFAULT '',
	service         TEXT         NOT NULL DEFAULT '',
	amount          INTEGER      NOT NULL DEFAULT 0,
	date            TEXT         NOT NULL DEFAULT '',
	status          TEXT         NOT NULL DEFAULT 'Pending',
	type            TEXT         NOT NULL DEFAULT 'client',
	sender          TEXT         NOT NULL DEFAULT '',
	decline_reason  TEXT         NOT NULL DEFAULT '',
	created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	deleted_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS team_members (
	id           SERIAL       PRIMARY KEY,
	user_id      TEXT         NOT NULL DEFAULT '',
	name         TEXT         NOT NULL DEFAULT '',
	email        TEXT         NOT NULL DEFAULT '',
	role         TEXT         NOT NULL DEFAULT '',
	initials     TEXT         NOT NULL DEFAULT '',
	color        TEXT         NOT NULL DEFAULT '',
	tasks_num    INTEGER      NOT NULL DEFAULT 0,
	tasks_done   INTEGER      NOT NULL DEFAULT 0,
	clients_num  INTEGER      NOT NULL DEFAULT 0,
	progress     INTEGER      NOT NULL DEFAULT 0,
	working_on   TEXT         NOT NULL DEFAULT '',
	created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	deleted_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS calendar_events (
	id          SERIAL       PRIMARY KEY,
	user_id     TEXT         NOT NULL DEFAULT '',
	title       TEXT         NOT NULL DEFAULT '',
	client      TEXT         NOT NULL DEFAULT '',
	platform    TEXT         NOT NULL DEFAULT '',
	date        TEXT         NOT NULL DEFAULT '',
	color       TEXT         NOT NULL DEFAULT '',
	created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
	deleted_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS board_accesses (
	id            SERIAL       PRIMARY KEY,
	board_id      UUID         NOT NULL,
	target_type   TEXT         NOT NULL,
	target_email  TEXT         NOT NULL,
	permission    TEXT         NOT NULL DEFAULT 'viewer',
	admin_id      TEXT         NOT NULL DEFAULT '',
	created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doc_accesses (
	id            SERIAL       PRIMARY KEY,
	doc_id        UUID         NOT NULL,
	target_type   TEXT         NOT NULL,
	target_email  TEXT         NOT NULL,
	permission    TEXT         NOT NULL DEFAULT 'viewer',
	admin_id      TEXT         NOT NULL DEFAULT '',
	created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
`
	_, err := DB.Exec(schema)
	return err
}

// bootstrapAdmin seeds the default admin account from environment variables.
// If the account already exists it is silently skipped.
func bootstrapAdmin() {
	email := os.Getenv("ADMIN_EMAIL")
	password := os.Getenv("ADMIN_PASSWORD")
	if email == "" || password == "" {
		log.Println("[DB] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin bootstrap")
		return
	}

	var count int
	if err := DB.Get(&count, "SELECT COUNT(*) FROM users WHERE email = $1", email); err != nil || count > 0 {
		fmt.Println("[DB] Admin account already exists.")
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("[DB] Failed to hash admin password: %v", err)
		return
	}

	if _, err := DB.Exec(
		"INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)",
		uuid.New(), "Admin", email, string(hashed), "admin",
	); err != nil {
		log.Printf("[DB] Failed to create admin: %v", err)
		return
	}
	fmt.Println("[DB] Default admin account created.")
}
