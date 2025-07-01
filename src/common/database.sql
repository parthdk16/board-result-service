-- Simplified Board Result Publication System - PostgreSQL Schema
-- For NestJS Microservices Demo Project (Result Service Only)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CORE ENTITIES (Simplified for Demo)
-- =============================================================================

-- Class Levels (e.g., "10", "12")
CREATE TABLE class_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(10) NOT NULL UNIQUE
);

-- Streams (e.g., "Science", "Commerce", "Arts")
CREATE TABLE streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Academic Years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year_label VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Subjects (Master Data)
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    subject_type VARCHAR(50) DEFAULT 'CORE',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL UNIQUE,
    roll_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    class VARCHAR(20), -- Deprecated
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    class_level_id UUID REFERENCES class_levels(id),
    stream_id UUID REFERENCES streams(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_roll_per_ay_class UNIQUE (academic_year_id, class, roll_number)
);

-- Academic Year Subject Configuration
CREATE TABLE academic_year_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class VARCHAR(20), -- Deprecated
    class_level_id UUID REFERENCES class_levels(id),
    stream_id UUID REFERENCES streams(id),
    max_marks INTEGER NOT NULL DEFAULT 100,
    min_passing_marks INTEGER NOT NULL DEFAULT 33,
    is_compulsory BOOLEAN DEFAULT TRUE,
    syllabus_version VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_ay_subject_class UNIQUE (academic_year_id, subject_id, class_level_id, stream_id),
    CONSTRAINT valid_marks CHECK (min_passing_marks <= max_marks)
);

-- Examinations
CREATE TABLE examinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    name VARCHAR(200) NOT NULL,
    class VARCHAR(20), -- Deprecated
    class_level_id UUID REFERENCES class_levels(id),
    stream_id UUID REFERENCES streams(id),
    exam_type VARCHAR(50) NOT NULL DEFAULT 'ANNUAL',
    exam_date DATE,
    result_published_date DATE,
    is_result_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_exam UNIQUE (academic_year_id, name, class_level_id, stream_id, exam_type)
);

-- Student Results
CREATE TABLE student_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    examination_id UUID NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    total_marks_obtained INTEGER NOT NULL DEFAULT 0,
    total_max_marks INTEGER NOT NULL DEFAULT 0,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_max_marks > 0 THEN ROUND((total_marks_obtained::DECIMAL / total_max_marks) * 100, 2)
            ELSE 0
        END
    ) STORED,
    grade VARCHAR(10),
    result_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    overall_rank INTEGER,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_exam_result UNIQUE (examination_id, student_id),
    CONSTRAINT valid_percentage CHECK (percentage >= 0 AND percentage <= 100)
);

-- Subject Results
CREATE TABLE subject_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_result_id UUID NOT NULL REFERENCES student_results(id) ON DELETE CASCADE,
    academic_year_subject_id UUID NOT NULL REFERENCES academic_year_subjects(id) ON DELETE CASCADE,
    marks_obtained INTEGER NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 100,
    grade VARCHAR(10),
    is_pass BOOLEAN GENERATED ALWAYS AS (marks_obtained >= (max_marks * 0.33)) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_subject_result UNIQUE (student_result_id, academic_year_subject_id),
    CONSTRAINT valid_subject_marks CHECK (marks_obtained >= 0 AND marks_obtained <= max_marks)
);

-- User Activity Logs (Complete tracking for students and teachers)
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL, -- Reference to User Service (MongoDB)
    user_type VARCHAR(20) NOT NULL, -- STUDENT, TEACHER, ADMIN
    user_email VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- LOGIN, LOGOUT, VIEW_RESULT, UPDATE_MARKS, etc.
    resource_type VARCHAR(50), -- STUDENT, RESULT, EXAMINATION, SUBJECT, etc.
    resource_id UUID, -- ID of the resource being accessed
    action VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
    details JSONB, -- Additional activity details in JSON format
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    execution_time_ms INTEGER, -- API response time tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Audit Logs (Database-level changes)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by_user_id VARCHAR(50), -- Reference to User Service
    changed_by_user_type VARCHAR(20), -- STUDENT, TEACHER, ADMIN, SYSTEM
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notification Queue (For RabbitMQ Integration)
CREATE TABLE notification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_result_id UUID NOT NULL REFERENCES student_results(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- RESULT_PUBLISHED, RESULT_UPDATED
    recipient_email VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(200) NOT NULL,
    message_data JSONB NOT NULL, -- Flexible data for notification service
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Academic year indexes
CREATE INDEX idx_academic_years_current ON academic_years(is_current);
CREATE INDEX idx_academic_years_active ON academic_years(is_active);
CREATE INDEX idx_academic_years_year_label ON academic_years(year_label);

-- Academic year subjects indexes
CREATE INDEX idx_ay_subjects_academic_year ON academic_year_subjects(academic_year_id);
CREATE INDEX idx_ay_subjects_subject ON academic_year_subjects(subject_id);
CREATE INDEX idx_ay_subjects_class ON academic_year_subjects(class);
CREATE INDEX idx_ay_subjects_active ON academic_year_subjects(is_active);

-- Student indexes
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_academic_year ON students(academic_year_id);
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_students_email ON students(email);

-- Result indexes
CREATE INDEX idx_student_results_exam ON student_results(examination_id);
CREATE INDEX idx_student_results_student ON student_results(student_id);
CREATE INDEX idx_student_results_published ON student_results(is_published);
CREATE INDEX idx_student_results_percentage ON student_results(percentage DESC);

-- Subject result indexes
CREATE INDEX idx_subject_results_student_result ON subject_results(student_result_id);
CREATE INDEX idx_subject_results_ay_subject ON subject_results(academic_year_subject_id);

-- Notification indexes
CREATE INDEX idx_notifications_status ON notification_requests(status);
CREATE INDEX idx_notifications_created ON notification_requests(created_at);

-- User activity log indexes (Critical for performance)
CREATE INDEX idx_user_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_user_type ON user_activity_logs(user_type);
CREATE INDEX idx_user_activity_activity_type ON user_activity_logs(activity_type);
CREATE INDEX idx_user_activity_resource ON user_activity_logs(resource_type, resource_id);
CREATE INDEX idx_user_activity_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX idx_user_activity_success ON user_activity_logs(success);
CREATE INDEX idx_user_activity_session ON user_activity_logs(session_id);

-- Audit log indexes
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(changed_by_user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_operation ON audit_logs(operation);

-- =============================================================================
-- TRIGGERS FOR AUTOMATION
-- =============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ay_subjects_updated_at BEFORE UPDATE ON academic_year_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_examinations_updated_at BEFORE UPDATE ON examinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_results_updated_at BEFORE UPDATE ON student_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate grade based on percentage
CREATE OR REPLACE FUNCTION calculate_grade()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.percentage >= 90 THEN
        NEW.grade = 'A+';
    ELSIF NEW.percentage >= 80 THEN
        NEW.grade = 'A';
    ELSIF NEW.percentage >= 70 THEN
        NEW.grade = 'B+';
    ELSIF NEW.percentage >= 60 THEN
        NEW.grade = 'B';
    ELSIF NEW.percentage >= 50 THEN
        NEW.grade = 'C';
    ELSIF NEW.percentage >= 40 THEN
        NEW.grade = 'D';
    ELSE
        NEW.grade = 'F';
    END IF;
    
    -- Auto-determine result status
    IF NEW.percentage >= 33 THEN
        NEW.result_status = 'PASS';
    ELSE
        NEW.result_status = 'FAIL';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_student_grade BEFORE INSERT OR UPDATE ON student_results FOR EACH ROW EXECUTE FUNCTION calculate_grade();

-- Auto-calculate subject grade
CREATE OR REPLACE FUNCTION calculate_subject_grade()
RETURNS TRIGGER AS $$
BEGIN
    DECLARE
        percentage DECIMAL(5,2);
    BEGIN
        percentage = ROUND((NEW.marks_obtained::DECIMAL / NEW.max_marks) * 100, 2);
        
        IF percentage >= 90 THEN
            NEW.grade = 'A+';
        ELSIF percentage >= 80 THEN
            NEW.grade = 'A';
        ELSIF percentage >= 70 THEN
            NEW.grade = 'B+';
        ELSIF percentage >= 60 THEN
            NEW.grade = 'B';
        ELSIF percentage >= 50 THEN
            NEW.grade = 'C';
        ELSIF percentage >= 40 THEN
            NEW.grade = 'D';
        ELSE
            NEW.grade = 'F';
        END IF;
    END;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_subject_grade_trigger BEFORE INSERT OR UPDATE ON subject_results FOR EACH ROW EXECUTE FUNCTION calculate_subject_grade();

-- =============================================================================
-- AUDIT TRIGGER FUNCTIONS
-- =============================================================================

-- Generic audit function for tracking database changes
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $
DECLARE
    old_data JSONB;
    new_data JSONB;
    user_id_val VARCHAR(50);
    user_type_val VARCHAR(20);
BEGIN
    -- Skip audit for audit_logs and user_activity_logs tables
    IF TG_TABLE_NAME IN ('audit_logs', 'user_activity_logs') THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Get user context (this would be set by application)
    user_id_val := current_setting('app.current_user_id', true);
    user_type_val := current_setting('app.current_user_type', true);
    
    -- Handle different operations
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;
    
    -- Insert audit record
    INSERT INTO audit_logs (
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        changed_by_user_id,
        changed_by_user_type
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        old_data,
        new_data,
        user_id_val,
        user_type_val
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_students_trigger AFTER INSERT OR UPDATE OR DELETE ON students FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_student_results_trigger AFTER INSERT OR UPDATE OR DELETE ON student_results FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_subject_results_trigger AFTER INSERT OR UPDATE OR DELETE ON subject_results FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_examinations_trigger AFTER INSERT OR UPDATE OR DELETE ON examinations FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_academic_year_subjects_trigger AFTER INSERT OR UPDATE OR DELETE ON academic_year_subjects FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample academic years
INSERT INTO academic_years (year_label, start_date, end_date, is_current, description) VALUES 
('2023-24', '2023-04-01', '2024-03-31', FALSE, 'Academic Year 2023-24'),
('2024-25', '2024-04-01', '2025-03-31', TRUE, 'Academic Year 2024-25 (Current)'),
('2025-26', '2025-04-01', '2026-03-31', FALSE, 'Academic Year 2025-26 (Future)');

-- Insert sample subjects (master data)
INSERT INTO subjects (name, code, subject_type, description) VALUES 
('Mathematics', 'MATH', 'CORE', 'Mathematics subject covering algebra, geometry, calculus'),
('Physics', 'PHY', 'CORE', 'Physics subject covering mechanics, thermodynamics, optics'),
('Chemistry', 'CHEM', 'CORE', 'Chemistry subject covering organic, inorganic, physical chemistry'),
('Biology', 'BIO', 'ELECTIVE', 'Biology subject covering botany, zoology, human anatomy'),
('English', 'ENG', 'CORE', 'English language and literature'),
('Computer Science', 'CS', 'ELECTIVE', 'Computer programming and software development'),
('Economics', 'ECO', 'ELECTIVE', 'Economic theory and applications');

-- Configure subjects for different academic years and classes
-- Academic Year 2024-25, Class 12
INSERT INTO academic_year_subjects (academic_year_id, subject_id, class, max_marks, min_passing_marks, is_compulsory, syllabus_version) 
SELECT 
    ay.id,
    s.id,
    '12',
    CASE 
        WHEN s.code IN ('MATH', 'PHY', 'CHEM', 'ENG') THEN 100
        WHEN s.code IN ('BIO', 'CS', 'ECO') THEN 100
        ELSE 100
    END,
    CASE 
        WHEN s.code IN ('MATH', 'PHY', 'CHEM', 'ENG') THEN 33
        WHEN s.code IN ('BIO', 'CS', 'ECO') THEN 33
        ELSE 33
    END,
    CASE 
        WHEN s.code IN ('MATH', 'PHY', 'CHEM', 'ENG') THEN TRUE
        ELSE FALSE
    END,
    '2024-v1'
FROM academic_years ay
CROSS JOIN subjects s
WHERE ay.year_label = '2024-25';

-- Academic Year 2024-25, Class 10
INSERT INTO academic_year_subjects (academic_year_id, subject_id, class, max_marks, min_passing_marks, is_compulsory, syllabus_version) 
SELECT 
    ay.id,
    s.id,
    '10',
    100,
    33,
    CASE 
        WHEN s.code IN ('MATH', 'ENG') THEN TRUE
        ELSE FALSE
    END,
    '2024-v1'
FROM academic_years ay
CROSS JOIN subjects s
WHERE ay.year_label = '2024-25' AND s.code IN ('MATH', 'ENG', 'PHY', 'CHEM', 'BIO');

-- Insert sample examinations
INSERT INTO examinations (academic_year_id, name, class, exam_type, exam_date) 
SELECT 
    ay.id,
    'Annual Examination 2024',
    '12',
    'ANNUAL',
    '2024-03-15'
FROM academic_years ay 
WHERE ay.year_label = '2024-25';

INSERT INTO examinations (academic_year_id, name, class, exam_type, exam_date) 
SELECT 
    ay.id,
    'Annual Examination 2024',
    '10',
    'ANNUAL',
    '2024-03-10'
FROM academic_years ay 
WHERE ay.year_label = '2024-25';

-- Insert sample students
INSERT INTO students (user_id, roll_number, first_name, last_name, email, class, academic_year_id) 
SELECT 
    'user_00' || generate_series,
    'R2024' || LPAD(generate_series::text, 3, '0'),
    CASE generate_series % 4
        WHEN 0 THEN 'John'
        WHEN 1 THEN 'Jane'
        WHEN 2 THEN 'Bob'
        ELSE 'Alice'
    END,
    CASE generate_series % 4
        WHEN 0 THEN 'Doe'
        WHEN 1 THEN 'Smith'
        WHEN 2 THEN 'Johnson'
        ELSE 'Brown'
    END,
    'student' || generate_series || '@email.com',
    '12',
    ay.id
FROM generate_series(1, 5) AS generate_series
CROSS JOIN academic_years ay
WHERE ay.year_label = '2024-25';

-- Sample user activity logs (for demonstration)
INSERT INTO user_activity_logs (user_id, user_type, user_email, activity_type, resource_type, action, details, ip_address, success) VALUES 
('user_001', 'STUDENT', 'john.doe@email.com', 'LOGIN', 'SYSTEM', 'LOGIN', '{"login_method": "password", "device": "web"}', '192.168.1.100', TRUE),
('user_002', 'STUDENT', 'jane.smith@email.com', 'VIEW_RESULT', 'RESULT', 'READ', '{"exam_id": "exam_001", "result_type": "detailed"}', '192.168.1.101', TRUE),
('teacher_001', 'TEACHER', 'teacher@school.com', 'UPDATE_MARKS', 'SUBJECT_RESULT', 'UPDATE', '{"student_id": "user_001", "subject": "MATH", "old_marks": 85, "new_marks": 87}', '10.0.0.50', TRUE),
('admin_001', 'ADMIN', 'admin@board.edu', 'PUBLISH_RESULT', 'EXAMINATION', 'UPDATE', '{"exam_id": "exam_001", "students_count": 150}', '10.0.0.10', TRUE);

-- Comments for clarity
COMMENT ON TABLE academic_years IS 'Academic years with date ranges and current year tracking';
COMMENT ON TABLE subjects IS 'Master subject data independent of academic years';
COMMENT ON TABLE academic_year_subjects IS 'Subject configuration per academic year and class with syllabus versions';
COMMENT ON TABLE students IS 'Student data linked to specific academic year';
COMMENT ON TABLE user_activity_logs IS 'Comprehensive user activity tracking for students, teachers, and admins';
COMMENT ON TABLE audit_logs IS 'Database-level audit trail for all data changes';
COMMENT ON COLUMN students.user_id IS 'Reference to user in MongoDB User Service';
COMMENT ON COLUMN academic_year_subjects.syllabus_version IS 'Track syllabus changes across academic years';
COMMENT ON COLUMN user_activity_logs.details IS 'JSON payload with activity-specific details';
COMMENT ON COLUMN user_activity_logs.execution_time_ms IS 'API response time for performance monitoring';