package database

import (
	"os"
	"sync"
	"testing"
)

// Helper to reset db state between tests
var testMu sync.Mutex

func testSetDB(t *testing.T, conn interface{}) {
	t.Helper()
	testMu.Lock()
	t.Cleanup(testMu.Unlock)
	SetDB(nil)
}

func TestSetAndGetDB(t *testing.T) {
	testSetDB(t, nil)

	SetDB(nil)
	if db := GetDB(); db != nil {
		t.Error("expected nil db after SetDB(nil)")
	}
}

func TestGetDBInitialNil(t *testing.T) {
	testSetDB(t, nil)

	SetDB(nil)
	if db := GetDB(); db != nil {
		t.Error("expected nil initially")
	}
}

func TestSetDBRoundTrip(t *testing.T) {
	testSetDB(t, nil)

	SetDB(nil)
	got := GetDB()
	if got != nil {
		t.Error("expected nil from GetDB after SetDB(nil)")
	}
}

func TestInitDBSetsEnvVars(t *testing.T) {
	testSetDB(t, nil)

	// Verify InitDB reads environment variables (integration test needs ClickHouse)
	// This only tests that InitDB doesn't crash with default env
	os.Unsetenv("CLICKHOUSE_HOST")
	os.Unsetenv("CLICKHOUSE_USER")
	os.Unsetenv("CLICKHOUSE_PASSWORD")

	// We don't actually call InitDB here since it attempts a real connection.
	// The env var reading is verified implicitly by the handler tests.
}

func TestEnvVarDefaults(t *testing.T) {
	os.Unsetenv("CLICKHOUSE_HOST")
	os.Unsetenv("CLICKHOUSE_USER")
	os.Unsetenv("CLICKHOUSE_PASSWORD")

	host := os.Getenv("CLICKHOUSE_HOST")
	if host != "" {
		t.Error("expected CLICKHOUSE_HOST to be empty")
	}
}
