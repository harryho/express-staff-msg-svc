#!/bin/bash

# Test the complete message scheduling system

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Message Scheduling System${NC}\n"

# Test 1: Create employee with today's anniversary
echo -e "${BLUE}Test 1: Create employee with anniversary today${NC}"
TODAY=$(date +%Y-%m-%d)
LAST_YEAR=$(date -v-5y +%Y-%m-%d 2>/dev/null || date -d '5 years ago' +%Y-%m-%d 2>/dev/null)

RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/employee" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Alice\",
    \"lastName\": \"Johnson\",
    \"startDate\": \"$LAST_YEAR\",
    \"timezone\": \"America/New_York\",
    \"locationDisplay\": \"New York, USA\"
  }")

echo "$RESPONSE" | jq
EMPLOYEE_ID=$(echo "$RESPONSE" | jq -r '.data.id')
echo -e "${GREEN}Created employee with ID: $EMPLOYEE_ID${NC}\n"

# Wait for scheduler to run (should happen 5 seconds after startup)
echo -e "${BLUE}Waiting 10 seconds for scheduler to process...${NC}"
sleep 10

# Test 2: Check queue stats
echo -e "\n${BLUE}Test 2: Checking message queue statistics${NC}"
echo "Note: Queue stats endpoint would be at /api/v1/queue/stats (not yet implemented)"
echo -e "\n"

# Test 3: Health check including Redis
echo -e "${BLUE}Test 3: Health check (should include Redis)${NC}"
curl -s -X GET "$BASE_URL/health" | jq
echo -e "\n"

echo -e "${GREEN}✅ Scheduling System Tests Completed!${NC}"
echo -e "${BLUE}Check logs for scheduled jobs and message delivery status${NC}"
