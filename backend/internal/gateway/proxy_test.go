package gateway

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSetupProxyInvalidURL(t *testing.T) {
	handler := SetupProxy("://invalid-url")

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/deep-dive", nil)
	rec := httptest.NewRecorder()

	handler(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Errorf("expected 500 for invalid URL, got %d", rec.Code)
	}
}

func TestSetupProxyStripsPathPrefix(t *testing.T) {
	// Start a test backend server
	backend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(r.URL.Path))
	}))
	defer backend.Close()

	handler := SetupProxy(backend.URL)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/deep-dive/some-path", nil)
	rec := httptest.NewRecorder()

	handler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}
}

func TestSetupProxyDefaultsToGraphQL(t *testing.T) {
	backend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(r.URL.Path))
	}))
	defer backend.Close()

	handler := SetupProxy(backend.URL)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/deep-dive", nil)
	rec := httptest.NewRecorder()

	handler(rec, req)

	body := rec.Body.String()
	if !strings.Contains(body, "/graphql") {
		t.Errorf("expected path to default to /graphql, got %s", body)
	}
}

func TestSetupProxyPreservesSubPath(t *testing.T) {
	backend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(r.URL.Path))
	}))
	defer backend.Close()

	handler := SetupProxy(backend.URL)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/metrics/deep-dive/custom", nil)
	rec := httptest.NewRecorder()

	handler(rec, req)

	body := rec.Body.String()
	if body != "/custom" {
		t.Errorf("expected /custom, got %s", body)
	}
}
