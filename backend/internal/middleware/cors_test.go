package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCorsMiddlewareSetsHeaders(t *testing.T) {
	handler := CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()

	handler(rec, req)

	if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("expected Access-Control-Allow-Origin: *")
	}
	if rec.Header().Get("Access-Control-Allow-Methods") != "GET, POST, OPTIONS" {
		t.Error("expected Access-Control-Allow-Methods: GET, POST, OPTIONS")
	}
	if rec.Header().Get("Access-Control-Allow-Headers") != "Content-Type" {
		t.Error("expected Access-Control-Allow-Headers: Content-Type")
	}
}

func TestCorsMiddlewarePreflight(t *testing.T) {
	handler := CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		t.Error("next handler should not be called for OPTIONS")
	})

	req := httptest.NewRequest(http.MethodOptions, "/", nil)
	rec := httptest.NewRecorder()

	handler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200 for OPTIONS, got %d", rec.Code)
	}
}

func TestCorsMiddlewarePassesThrough(t *testing.T) {
	var called bool
	handler := CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()

	handler(rec, req)

	if !called {
		t.Error("next handler should be called for non-OPTIONS")
	}
}

func TestCorsMiddlewarePassesThroughForPOST(t *testing.T) {
	var called bool
	handler := CorsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusCreated)
	})

	req := httptest.NewRequest(http.MethodPost, "/", nil)
	rec := httptest.NewRecorder()

	handler(rec, req)

	if !called {
		t.Error("next handler should be called for POST")
	}
	if rec.Code != http.StatusCreated {
		t.Errorf("expected 201, got %d", rec.Code)
	}
}
