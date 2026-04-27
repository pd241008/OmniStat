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
		log.Fatalf("Invalid Scala target URL: %v", err)
	}

	proxy := httputil.NewSingleHostReverseProxy(target)

	return func(w http.ResponseWriter, r *http.Request) {
		// Example: Strip the /api/v1/deep-dive prefix before sending to Scala
		r.URL.Path = strings.TrimPrefix(r.URL.Path, "/api/v1/deep-dive")
		
		// If Scala expects a specific endpoint like /graphql
		if r.URL.Path == "" || r.URL.Path == "/" {
			r.URL.Path = "/graphql"
		}

		r.Host = target.Host
		
		// Log the proxy forward for observability
		log.Printf("[GATEWAY] Proxying request to: %s%s", target.Host, r.URL.Path)

		// Execute proxy
		proxy.ServeHTTP(w, r)
	}
}
