-- 001_initial_schema.sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT,
    is_active INTEGER DEFAULT 1,
    last_login TEXT,
    permissions TEXT
);

CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    code TEXT
);

CREATE TABLE IF NOT EXISTS professors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    email TEXT,
    phone TEXT,
    title TEXT,
    academic_title TEXT,
    professional_email TEXT,
    personal_email TEXT,
    primary_phone TEXT,
    secondary_phone TEXT,
    full_name_arabic TEXT,
    full_name_latin TEXT,
    academic_rank TEXT,
    department TEXT,
    phd_specialization TEXT,
    field_of_research TEXT,
    profile_completed INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    capacity INTEGER
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    code TEXT,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    department_id INTEGER,
    group_type TEXT,
    specialization TEXT,
    parent_group_id INTEGER,
    year INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    course_id INTEGER,
    professor_id INTEGER,
    room_id INTEGER,
    day_of_week INTEGER,
    start_time TEXT,
    end_time TEXT,
    academic_year TEXT,
    semester TEXT,
    specialization TEXT,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (professor_id) REFERENCES professors(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS academic_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_name TEXT,
    is_current INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS semesters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    academic_year_id INTEGER,
    semester_name TEXT,
    start_date TEXT,
    end_date TEXT,
    is_current INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

CREATE TABLE IF NOT EXISTS sandbox_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
