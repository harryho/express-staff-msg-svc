#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}🧪 Testing Employee Anniversary Message Service API${NC}\n"

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
curl -s -X GET "$BASE_URL/health" | jq
echo -e "\n"

# Test 2: Root Endpoint
echo -e "${BLUE}Test 2: Root Endpoint${NC}"
curl -s -X GET "$BASE_URL/" | jq
echo -e "\n"

# Test 3: Create Employee
echo -e "${BLUE}Test 3: Create Employee (John Doe)${NC}"
EMPLOYEE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/employee" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "startDate": "2020-10-24",
    "birthDate": "1990-05-15",
    "timezone": "Australia/Sydney",
    "locationDisplay": "New York, USA"
  }')
echo "$EMPLOYEE_RESPONSE" | jq
EMPLOYEE_ID=$(echo "$EMPLOYEE_RESPONSE" | jq -r '.data.id')
echo -e "\n"

# Test 4: Get All Employees
echo -e "${BLUE}Test 4: Get All Employees${NC}"
curl -s -X GET "$BASE_URL/api/v1/employee" | jq
echo -e "\n"

# Test 5: Get Employee by ID
if [ ! -z "$EMPLOYEE_ID" ] && [ "$EMPLOYEE_ID" != "null" ]; then
  echo -e "${BLUE}Test 5: Get Employee by ID${NC}"
  curl -s -X GET "$BASE_URL/api/v1/employee/$EMPLOYEE_ID" | jq
  echo -e "\n"
fi

# Test 6: Create Another Employee
echo -e "${BLUE}Test 6: Create Employee (Jane Smith)${NC}"
EMPLOYEE2_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/employee" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "startDate": "2018-03-15",
    "timezone": "Australia/Melbourne",
    "locationDisplay": "Melbourne, Australia"
  }')
echo "$EMPLOYEE2_RESPONSE" | jq
EMPLOYEE2_ID=$(echo "$EMPLOYEE2_RESPONSE" | jq -r '.data.id')
echo -e "\n"

# Test 7: Validation Error (Invalid timezone)
echo -e "${BLUE}Test 7: Validation Error (Invalid timezone)${NC}"
curl -s -X POST "$BASE_URL/api/v1/employee" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Invalid",
    "lastName": "User",
    "startDate": "2021-01-01",
    "timezone": "InvalidTimezone",
    "locationDisplay": "Nowhere"
  }' | jq
echo -e "\n"

# Test 8: Delete Employee
if [ ! -z "$EMPLOYEE_ID" ] && [ "$EMPLOYEE_ID" != "null" ]; then
  echo -e "${BLUE}Test 8: Delete Employee${NC}"
  curl -s -X DELETE "$BASE_URL/api/v1/employee/$EMPLOYEE_ID" | jq
  echo -e "\n"
fi

# Test 9: Try to get deleted employee
if [ ! -z "$EMPLOYEE_ID" ] && [ "$EMPLOYEE_ID" != "null" ]; then
  echo -e "${BLUE}Test 9: Get Deleted Employee (Should return 404)${NC}"
  curl -s -X GET "$BASE_URL/api/v1/employee/$EMPLOYEE_ID" | jq
  echo -e "\n"
fi

# Test 10: Get remaining employees
echo -e "${BLUE}Test 10: Get All Remaining Employees${NC}"
curl -s -X GET "$BASE_URL/api/v1/employee" | jq
echo -e "\n"

echo -e "${GREEN}✅ API Tests Completed!${NC}"
