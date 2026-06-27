-- V1: Initial Complete Schema for Quiz Platform

-- 1. Create Independent Tables
CREATE TABLE badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    icon_url VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
CREATE INDEX idx_badges_name ON badges(name);



CREATE TABLE student_groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE modules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- 2. Create Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    blocked BOOLEAN NOT NULL DEFAULT FALSE,
    group_id BIGINT REFERENCES student_groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 3. Create User-Badges Association Table
CREATE TABLE user_badges (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, badge_id)
);

-- 4. Create Module Assignments Table
CREATE TABLE module_assignments (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES student_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    UNIQUE(teacher_id, module_id, group_id)
);

-- 5. Create Audit Logs Table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255),
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- 6. Create Notifications Table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- 7. Create Question Banks Table
CREATE TABLE question_banks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- 8. Create Exams Table
CREATE TABLE exams (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    available_from TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    available_until TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    max_attempts INTEGER NOT NULL DEFAULT 1,
    total_marks INTEGER NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(255) NOT NULL DEFAULT 'DRAFT',
    scheduled_start_time TIMESTAMP WITHOUT TIME ZONE,
    module_id BIGINT NOT NULL REFERENCES modules(id),
    group_id BIGINT NOT NULL REFERENCES student_groups(id),
    created_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
CREATE INDEX idx_exams_created_by ON exams(created_by_id);
CREATE INDEX idx_exams_published ON exams(published);

-- 9. Create Questions Table
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    statement TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL DEFAULT 1,
    explanation TEXT,
    exam_id BIGINT REFERENCES exams(id) ON DELETE CASCADE,
    question_bank_id BIGINT REFERENCES question_banks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
CREATE INDEX idx_questions_exam ON questions(exam_id);

-- 10. Create Choices Table
CREATE TABLE choices (
    id BIGSERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE
);
CREATE INDEX idx_choices_question ON choices(question_id);

-- 11. Create Submissions Table
CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    submit_time TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_exam ON submissions(exam_id);

-- 12. Create Answers Table
CREATE TABLE answers (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text_answer TEXT,
    teacher_score DOUBLE PRECISION,
    teacher_feedback TEXT
);
CREATE INDEX idx_answers_submission ON answers(submission_id);
CREATE INDEX idx_answers_question ON answers(question_id);

-- 13. Create Answer-Choices Association Table
CREATE TABLE answer_choices (
    answer_id BIGINT NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    choice_id BIGINT NOT NULL REFERENCES choices(id) ON DELETE CASCADE,
    PRIMARY KEY (answer_id, choice_id)
);

-- 14. Create Results Table
CREATE TABLE results (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
    score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    wrong_answers INTEGER NOT NULL DEFAULT 0,
    percentage DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    pending_manual_grade BOOLEAN NOT NULL DEFAULT FALSE,
    manually_graded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
CREATE INDEX idx_results_submission ON results(submission_id);
CREATE INDEX idx_results_pending_grade ON results(pending_manual_grade);

-- 15. Insert default records
INSERT INTO modules (name, description, created_at, updated_at) VALUES ('Default Module', 'System Default Module', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO student_groups (name, description, created_at, updated_at) VALUES ('Default Group', 'System Default Group', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
