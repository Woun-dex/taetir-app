
CREATE TYPE user_role AS ENUM ('mentor', 'mentee');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'refused', 'terminated');
CREATE TYPE session_format AS ENUM ('in_person', 'virtual');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role user_role,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    title VARCHAR(255),
    avatar_url VARCHAR(255),
    bio TEXT,
    location TEXT,
    languages TEXT[]
);

CREATE TABLE mentor_profiles (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    professional_experience TEXT,
    company TEXT,
    skills TEXT[]
);

CREATE TABLE mentee_profiles (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    learning_objectives TEXT,
    experience_level VARCHAR(255),
    education TEXT,
    learning_hours INTEGER DEFAULT 0
);

CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status connection_status NOT NULL DEFAULT 'pending',
    request_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_mentor_mentee_different CHECK (mentor_id <> mentee_id)
);

CREATE TRIGGER update_connections_updated_at
BEFORE UPDATE ON connections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    connection_id INTEGER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    title VARCHAR(255),
    objectives TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    format session_format NOT NULL,
    status session_status NOT NULL DEFAULT 'scheduled',
    meet_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_end_time_after_start_time CHECK (end_time > start_time)
);

CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    connection_id INTEGER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT chk_reviewer_reviewee_different CHECK (reviewer_id <> reviewee_id),
    UNIQUE (session_id, reviewer_id)
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_mentor_profiles_profile_id ON mentor_profiles(profile_id);
CREATE INDEX idx_connections_mentor_id ON connections(mentor_id);
CREATE INDEX idx_connections_mentee_id ON connections(mentee_id);
CREATE INDEX idx_sessions_connection_id ON sessions(connection_id);
CREATE INDEX idx_messages_connection_id ON messages(connection_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_reviews_session_id ON reviews(session_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
