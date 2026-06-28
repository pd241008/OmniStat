package gateway

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

// SetupProxy creates a reverse proxy to the Scala GraphQL engine
func SetupProxy(scalaTargetURL string) http.HandlerFunc {
	target, err := url.Parse(scalaTargetURL)
	if err != nil {
		log.Printf("[ERROR] Invalid Scala target URL %q: %v", scalaTargetURL, err)
		return func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "Bad gateway configuration", http.StatusInternalServerError)
		}
	}

	proxy := httputil.NewSingleHostReverseProxy(target)

	return func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = strings.TrimPrefix(r.URL.Path, "/api/v1/metrics/deep-dive")

		if r.URL.Path == "" || r.URL.Path == "/" {
			r.URL.Path = "/graphql"
		}

		r.Host = target.Host

		log.Printf("[GATEWAY] Proxying request to: %s%s", target.Host, r.URL.Path)

		proxy.ServeHTTP(w, r)
	}
}
