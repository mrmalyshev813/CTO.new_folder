#!/bin/bash

echo "🧪 Testing analyze function..."
echo ""

# Check if TEST_API_KEY is set
if [ -z "$TEST_API_KEY" ]; then
    echo "❌ ERROR: TEST_API_KEY environment variable is not set"
    echo "Usage: export TEST_API_KEY='sk-proj-...' && bash test.sh"
    exit 1
fi

# Get site URL (default to nlabteam.com)
SITE_URL="${SITE_URL:-https://nlabteam.com}"
echo "🌐 Testing site: $SITE_URL"
echo ""

# Test with API key in body
echo "📤 Sending test request with API key..."
RESULT=$(curl -s -X POST "$SITE_URL/.netlify/functions/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://nlabteam.com",
    "apiKey": "'"$TEST_API_KEY"'"
  }')

echo "📥 Response:"
if command -v jq >/dev/null 2>&1; then
    echo "$RESULT" | jq .
else
    echo "$RESULT"
fi
echo ""

# Check for errors
if echo "$RESULT" | grep -q "OPENAI_API_KEY not set"; then
    echo "❌ TEST FAILED: API key not working"
    exit 1
fi

if echo "$RESULT" | grep -q '"success".*true'; then
    echo "✅ TEST PASSED: API key is working correctly!"
    exit 0
else
    echo "⚠️  TEST WARNING: Response received but success flag not found"
    echo "Check the response above for details"
    exit 1
fi
