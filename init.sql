CREATE TABLE IF NOT EXISTS repo_languages (
    language String,
    byte_count Int64,
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY language;

CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID DEFAULT generateUUIDv4(),
    name String,
    value Float64,
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY id;

CREATE TABLE IF NOT EXISTS commit_metrics (
    repo_name String,
    committed_at DateTime,
    message String DEFAULT '',
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (repo_name, committed_at);

-- Insert some initial system metrics
INSERT INTO system_metrics (name, value) VALUES
    ('CPU Usage', 12.5),
    ('Memory Usage', 42.1),
    ('Network IO', 5.8),
    ('Disk Activity', 2.3);
