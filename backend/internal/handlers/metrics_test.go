package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"code-telemetry-engine/backend/internal/database"
	"code-telemetry-engine/backend/internal/models"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

// mockRows implements driver.Rows for testing
type mockRows struct {
	data    []mockRow
	pos     int
	columns []string
}

type mockRow struct {
	values []interface{}
}

func (m *mockRows) Next() bool {
	if m.pos >= len(m.data) {
		return false
	}
	m.pos++
	return true
}

func (m *mockRows) Scan(dest ...interface{}) error {
	row := m.data[m.pos-1]
	for i, d := range dest {
		switch v := d.(type) {
		case *string:
			*v = row.values[i].(string)
		case *float64:
			*v = row.values[i].(float64)
		case *int:
			*v = row.values[i].(int)
		case *int64:
			*v = row.values[i].(int64)
		}
	}
	return nil
}

func (m *mockRows) ScanStruct(dest interface{}) error {
	return nil
}

func (m *mockRows) Columns() []string {
	return m.columns
}

func (m *mockRows) ColumnTypes() []driver.ColumnType {
	return nil
}

func (m *mockRows) Totals(dest ...interface{}) error {
	return nil
}

func (m *mockRows) HasData() bool {
	return len(m.data) > 0
}

func (m *mockRows) Close() error {
	return nil
}

func (m *mockRows) Err() error {
	return nil
}

// mockConn implements driver.Conn for testing
type mockConn struct {
	driver.Conn
	queryFunc func(ctx context.Context, query string, args ...interface{}) (driver.Rows, error)
}

func (m *mockConn) Query(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
	if m.queryFunc != nil {
		return m.queryFunc(ctx, query, args...)
	}
	return &mockRows{}, nil
}

func (m *mockConn) Close() error {
	return nil
}

func (m *mockConn) Ping(ctx context.Context) error {
	return nil
}

func TestHandleGenericMetricsWithNilDB(t *testing.T) {
	database.SetDB(nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/generic", nil)
	rec := httptest.NewRecorder()

	HandleGenericMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	var metrics []models.Metric
	if err := json.Unmarshal(rec.Body.Bytes(), &metrics); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(metrics) == 0 {
		t.Error("expected fallback metrics, got empty")
	}
}

func TestHandleGenericMetricsMethodNotAllowed(t *testing.T) {
	database.SetDB(nil)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/metrics/generic", nil)
	rec := httptest.NewRecorder()

	HandleGenericMetrics(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected 405, got %d", rec.Code)
	}
}

func TestHandleGenericMetricsWithDB(t *testing.T) {
	mockDB := &mockConn{
		queryFunc: func(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
			return &mockRows{
				columns: []string{"name", "value"},
				data: []mockRow{
					{values: []interface{}{"CPU Usage", 45.2}},
					{values: []interface{}{"Memory Usage", 62.8}},
				},
			}, nil
		},
	}
	database.SetDB(mockDB)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/generic", nil)
	rec := httptest.NewRecorder()

	HandleGenericMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	var metrics []models.Metric
	if err := json.Unmarshal(rec.Body.Bytes(), &metrics); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(metrics) != 2 {
		t.Errorf("expected 2 metrics, got %d", len(metrics))
	}
	if metrics[0].Name != "CPU Usage" || metrics[0].Value != 45.2 {
		t.Errorf("unexpected first metric: %+v", metrics[0])
	}
}

func TestHandleLanguageMetricsWithNilDB(t *testing.T) {
	database.SetDB(nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/languages", nil)
	rec := httptest.NewRecorder()

	HandleLanguageMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	var langMetrics []models.LanguageMetric
	if err := json.Unmarshal(rec.Body.Bytes(), &langMetrics); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(langMetrics) != 0 {
		t.Errorf("expected empty language metrics when DB is nil, got %d", len(langMetrics))
	}
}

func TestHandleLanguageMetricsMethodNotAllowed(t *testing.T) {
	database.SetDB(nil)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/metrics/languages", nil)
	rec := httptest.NewRecorder()

	HandleLanguageMetrics(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected 405, got %d", rec.Code)
	}
}

func TestHandleLanguageMetricsWithDB(t *testing.T) {
	mockDB := &mockConn{
		queryFunc: func(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
			return &mockRows{
				columns: []string{"language", "total_bytes"},
				data: []mockRow{
					{values: []interface{}{"Scala", int64(5000)}},
					{values: []interface{}{"Go", int64(3000)}},
				},
			}, nil
		},
	}
	database.SetDB(mockDB)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/languages", nil)
	rec := httptest.NewRecorder()

	HandleLanguageMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	var langMetrics []models.LanguageMetric
	if err := json.Unmarshal(rec.Body.Bytes(), &langMetrics); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(langMetrics) != 2 {
		t.Errorf("expected 2 language metrics, got %d", len(langMetrics))
	}
	if langMetrics[0].Name != "Scala" || langMetrics[0].Value != 62 {
		t.Errorf("unexpected first language metric: %+v (expected Scala=62)", langMetrics[0])
	}
}

func TestHandleVelocityMetricsMethodNotAllowed(t *testing.T) {
	database.SetDB(nil)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/metrics/velocity", nil)
	rec := httptest.NewRecorder()

	HandleVelocityMetrics(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected 405, got %d", rec.Code)
	}
}

func TestHandleActivityMetricsMethodNotAllowed(t *testing.T) {
	database.SetDB(nil)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/metrics/activity", nil)
	rec := httptest.NewRecorder()

	HandleActivityMetrics(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected 405, got %d", rec.Code)
	}
}

func TestHandleVelocityMetricsWithNilDB(t *testing.T) {
	database.SetDB(nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/velocity", nil)
	rec := httptest.NewRecorder()

	HandleVelocityMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	if rec.Body.String() != "[]" {
		t.Errorf("expected empty array, got %s", rec.Body.String())
	}
}

func TestHandleActivityMetricsWithNilDB(t *testing.T) {
	database.SetDB(nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/activity", nil)
	rec := httptest.NewRecorder()

	HandleActivityMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	if rec.Body.String() != "[]" {
		t.Errorf("expected empty array, got %s", rec.Body.String())
	}
}

func TestHandleVelocityMetricsWithDB(t *testing.T) {
	mockDB := &mockConn{
		queryFunc: func(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
			return &mockRows{
				columns: []string{"hour", "day", "commits"},
				data: []mockRow{
					{values: []interface{}{10, 1, 5}},
					{values: []interface{}{14, 1, 3}},
					{values: []interface{}{9, 2, 7}},
				},
			}, nil
		},
	}
	database.SetDB(mockDB)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/velocity", nil)
	rec := httptest.NewRecorder()

	HandleVelocityMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	var results []map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &results); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(results) != 3 {
		t.Errorf("expected 3 velocity entries, got %d", len(results))
	}
	if int(results[0]["hour"].(float64)) != 10 || int(results[0]["day"].(float64)) != 1 || int(results[0]["commits"].(float64)) != 5 {
		t.Errorf("unexpected first velocity entry: %+v", results[0])
	}
}

func TestHandleLanguageMetricsWithDBQueryError(t *testing.T) {
	mockDB := &mockConn{
		queryFunc: func(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
			return nil, fmt.Errorf("clickhouse connection refused")
		},
	}
	database.SetDB(mockDB)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/languages", nil)
	rec := httptest.NewRecorder()

	HandleLanguageMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	var langMetrics []models.LanguageMetric
	if err := json.Unmarshal(rec.Body.Bytes(), &langMetrics); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(langMetrics) != 0 {
		t.Errorf("expected empty language metrics on query error, got %d", len(langMetrics))
	}
}

func TestHandleLanguageMetricsWithEmptyResults(t *testing.T) {
	mockDB := &mockConn{
		queryFunc: func(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
			return &mockRows{
				columns: []string{"language", "total_bytes"},
				data:    []mockRow{},
			}, nil
		},
	}
	database.SetDB(mockDB)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/languages", nil)
	rec := httptest.NewRecorder()

	HandleLanguageMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	var langMetrics []models.LanguageMetric
	if err := json.Unmarshal(rec.Body.Bytes(), &langMetrics); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(langMetrics) != 3 {
		t.Errorf("expected 3 fallback language metrics, got %d", len(langMetrics))
	}
	if langMetrics[0].Name != "Scala" || langMetrics[0].Value != 85 {
		t.Errorf("expected first fallback metric Scala=85, got %+v", langMetrics[0])
	}
}

func TestHandleGenericMetricsWithEmptyResults(t *testing.T) {
	mockDB := &mockConn{
		queryFunc: func(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
			return &mockRows{
				columns: []string{"name", "value"},
				data:    []mockRow{},
			}, nil
		},
	}
	database.SetDB(mockDB)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/generic", nil)
	rec := httptest.NewRecorder()

	HandleGenericMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	var metrics []models.Metric
	if err := json.Unmarshal(rec.Body.Bytes(), &metrics); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(metrics) != 2 {
		t.Errorf("expected 2 fallback metrics, got %d", len(metrics))
	}
	if metrics[0].Name != "CPU Usage" || metrics[0].Value != 45.2 {
		t.Errorf("unexpected fallback metric: %+v", metrics[0])
	}
}

func TestHandleGenericMetricsWithDBQueryError(t *testing.T) {
	mockDB := &mockConn{
		queryFunc: func(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
			return nil, fmt.Errorf("connection timeout")
		},
	}
	database.SetDB(mockDB)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/generic", nil)
	rec := httptest.NewRecorder()

	HandleGenericMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	var metrics []models.Metric
	if err := json.Unmarshal(rec.Body.Bytes(), &metrics); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(metrics) != 2 {
		t.Errorf("expected 2 fallback metrics on query error, got %d", len(metrics))
	}
}

func TestHandleVelocityMetricsWithDBQueryError(t *testing.T) {
	mockDB := &mockConn{
		queryFunc: func(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
			return nil, fmt.Errorf("table not found")
		},
	}
	database.SetDB(mockDB)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/velocity", nil)
	rec := httptest.NewRecorder()

	HandleVelocityMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	if rec.Body.String() != "[]" {
		t.Errorf("expected empty array on query error, got %s", rec.Body.String())
	}
}

func TestHandleActivityMetricsWithDBQueryError(t *testing.T) {
	mockDB := &mockConn{
		queryFunc: func(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
			return nil, fmt.Errorf("connection lost")
		},
	}
	database.SetDB(mockDB)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/activity", nil)
	rec := httptest.NewRecorder()

	HandleActivityMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	if rec.Body.String() != "[]" {
		t.Errorf("expected empty array on query error, got %s", rec.Body.String())
	}
}

func TestHandleActivityMetricsWithDB(t *testing.T) {
	mockDB := &mockConn{
		queryFunc: func(ctx context.Context, query string, args ...interface{}) (driver.Rows, error) {
			return &mockRows{
				columns: []string{"repo_name", "committed_at", "message"},
				data: []mockRow{
					{values: []interface{}{"repo-a", "2024-01-15 10:30:00", "Initial commit"}},
					{values: []interface{}{"repo-b", "2024-01-16 14:00:00", "Add feature"}},
				},
			}, nil
		},
	}
	database.SetDB(mockDB)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/activity", nil)
	rec := httptest.NewRecorder()

	HandleActivityMetrics(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	var results []map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &results); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(results) != 2 {
		t.Errorf("expected 2 activity entries, got %d", len(results))
	}
	if results[0]["repo_name"] != "repo-a" || results[0]["message"] != "Initial commit" {
		t.Errorf("unexpected first activity entry: %+v", results[0])
	}
}
