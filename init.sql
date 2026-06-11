CREATE TABLE repo_languages (
    language VARCHAR(50) PRIMARY KEY,
    byte_count BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_metrics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    value FLOAT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some initial system metrics
INSERT INTO system_metrics (name, value) VALUES
    ('CPU Usage', 12.5),
    ('Memory Usage', 42.1),
    ('Network IO', 5.8),
    ('Disk Activity', 2.3);
