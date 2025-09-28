#!/usr/bin/env bash

# Express BackOffice API - Compliance Module Test Script (Linux)
# Usage: ./hit_apis_linux.sh [BASE_URL]
# Example: ./hit_apis_linux.sh http://10.1.118.69:3000

set -euo pipefail

# Configuration
BASE_URL="${1:-http://localhost:3000}"
API_BASE="${BASE_URL}/api/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if jq is available for pretty printing
if command -v jq &> /dev/null; then
    JQ_AVAILABLE=true
else
    JQ_AVAILABLE=false
    echo -e "${YELLOW}Warning: jq not found. JSON responses will not be pretty-printed.${NC}"
    echo "Install jq with: apt-get install jq (Ubuntu/Debian) or yum install jq (CentOS/RHEL)"
fi

# Function to make API calls
hit_api() {
    local method="$1"
    local endpoint="$2"
    local description="$3"
    
    echo -e "\n${BLUE}=== $description ===${NC}"
    echo -e "${YELLOW}$method $endpoint${NC}"
    
    if [ "$JQ_AVAILABLE" = true ]; then
        curl -sS -X "$method" "$endpoint" -w "\nHTTP %{http_code}\n" | jq '.' || echo "Response is not valid JSON"
    else
        curl -sS -X "$method" "$endpoint" -w "\nHTTP %{http_code}\n"
    fi
    
    echo -e "${GREEN}---${NC}"
}

# Start testing
echo -e "${GREEN}🚀 Express BackOffice API - Compliance Module Test${NC}"
echo -e "${BLUE}Base URL: $BASE_URL${NC}"
echo -e "${BLUE}API Base: $API_BASE${NC}"

# Health Check
hit_api "GET" "$API_BASE/health/integrations" "Health Check - Database Integrations"

# Client Monthly Data endpoints
hit_api "GET" "$API_BASE/client-monthly-data" "Client Monthly Data - List All"
hit_api "GET" "$API_BASE/client-monthly-data/gte-2025" "Client Monthly Data - Data >= 2025"
hit_api "GET" "$API_BASE/client-monthly-data/year/2025" "Client Monthly Data - Filter by Year (2025)"
hit_api "GET" "$API_BASE/client-monthly-data/year/2025/month/9" "Client Monthly Data - Year 2025, Month 9"
hit_api "GET" "$API_BASE/client-monthly-data/inactivity-to-year/2024" "Client Monthly Data - Inactivity to Year 2024"
hit_api "GET" "$API_BASE/client-monthly-data/inactivity-to-year/2024/month/12" "Client Monthly Data - Inactivity to 2024/12"
hit_api "GET" "$API_BASE/client-monthly-data/search?q=test" "Client Monthly Data - Search 'test'"
hit_api "GET" "$API_BASE/client-monthly-data/12345" "Client Monthly Data - Get by ID (may return 404)"

# Client Control
hit_api "GET" "$API_BASE/client-control" "Client Control - List All"

# Summary endpoints
hit_api "GET" "$API_BASE/summary" "Summary - List All"
hit_api "GET" "$API_BASE/summary/latest/2025" "Summary - Latest for Year 2025"

# Summary View
hit_api "GET" "$API_BASE/summary-view" "Summary View - List All"

# Procedure execution (node-oracledb)
echo -e "\n${BLUE}=== Procedures (node-oracledb) ===${NC}"
echo -e "${YELLOW}POST $API_BASE/procedures/dormant-orchestrator?timeout=0${NC}"
echo -e "${RED}Note: This may return 409 (ALREADY_RUNNING) or 423 (TIMEOUT) - both are normal${NC}"

if [ "$JQ_AVAILABLE" = true ]; then
    curl -sS -X POST "$API_BASE/procedures/dormant-orchestrator?timeout=0" -w "\nHTTP %{http_code}\n" | jq '.' || echo "Response is not valid JSON"
else
    curl -sS -X POST "$API_BASE/procedures/dormant-orchestrator?timeout=0" -w "\nHTTP %{http_code}\n"
fi

echo -e "${GREEN}---${NC}"

# Summary
echo -e "\n${GREEN}✅ API Testing Complete!${NC}"
echo -e "${BLUE}Expected Status Codes:${NC}"
echo -e "  • ${GREEN}200${NC} - Success"
echo -e "  • ${YELLOW}404${NC} - Not Found (normal for specific IDs)"
echo -e "  • ${RED}409${NC} - Already Running (normal for procedures)"
echo -e "  • ${RED}423${NC} - Lock Timeout (normal for procedures)"
echo -e "  • ${RED}500${NC} - Server Error (investigate if occurs)"

echo -e "\n${BLUE}Environment URLs:${NC}"
echo -e "  • Development: http://localhost:3000"
echo -e "  • Test: http://10.1.118.200:3000"
echo -e "  • Production: http://10.1.118.69:3000"

echo -e "\n${GREEN}For detailed testing, use the Postman collection:${NC}"
echo -e "  Import: postman/ComplianceAPI.postman_collection.json"