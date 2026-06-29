# OmniStat Tests

All test files are symlinked here for a unified view.
Actual source locations are listed below.

## Test Inventory

### Backend (Go) — `backend/internal/*/`
| Tests | File | Source |
|-------|------|--------|
| 4 | `database_clickhouse_test.go` | `backend/internal/database/clickhouse_test.go` |
| 4 | `gateway_proxy_test.go` | `backend/internal/gateway/proxy_test.go` |
| 10 | `handlers_metrics_test.go` | `backend/internal/handlers/metrics_test.go` |
| 4 | `middleware_cors_test.go` | `backend/internal/middleware/cors_test.go` |
| 6 | `models_metrics_test.go` | `backend/internal/models/metrics_test.go` |
| **28** | **Run:** `cd backend && go test ./...` |

### Scala — `data/src/test/scala/agent/`
| Tests | File | Source |
|-------|------|--------|
| 9 | `MainSpec.scala` | `data/src/test/scala/agent/MainSpec.scala` |
| 8 | `ModelsSpec.scala` | `data/src/test/scala/agent/models/ModelsSpec.scala` |
| 7 | `GithubClientSpec.scala` | `data/src/test/scala/agent/github/GithubClientSpec.scala` |
| 8 | `ClickHouseSpec.scala` | `data/src/test/scala/agent/db/ClickHouseSpec.scala` |
| **32** | **Run:** `cd data && sbt test` |

### Frontend — `frontend/tests/`
| Tests | File | Source |
|-------|------|--------|
| 7 | `Dashboard.test.tsx` | `frontend/tests/Dashboard.test.tsx` |
| 3 | `TerminalFeed.test.tsx` | `frontend/tests/TerminalFeed.test.tsx` |
| 3 | `LanguageRadar.test.tsx` | `frontend/tests/LanguageRadar.test.tsx` |
| 4 | `VelocityMatrix.test.tsx` | `frontend/tests/VelocityMatrix.test.tsx` |
| **17** | **Run:** `cd frontend && npm test` |

### Grand Total: **77 tests**

## Run All Tests
```bash
cd backend && go test ./... && cd ../data && sbt test && cd ../frontend && npm test
```
