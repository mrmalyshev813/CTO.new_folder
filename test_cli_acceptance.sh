#!/bin/bash
# Acceptance test script for AdLook CLI

set -e

echo "========================================"
echo "AdLook CLI - Acceptance Tests"
echo "========================================"
echo ""

# Test 1: Help without API key
echo "Test 1: --help works without OPENAI_API_KEY"
unset OPENAI_API_KEY
if python -m adlook_cli --help > /dev/null 2>&1; then
    echo "✓ PASS: Help displayed without API key"
else
    echo "✗ FAIL: Help failed"
    exit 1
fi
echo ""

# Test 2: Missing API key shows error
echo "Test 2: Missing API key shows clear error"
if python -m adlook_cli https://example.com 2>&1 | grep -q "OPENAI_API_KEY environment variable is required"; then
    echo "✓ PASS: Clear error message for missing API key"
else
    echo "✗ FAIL: Error message not clear"
    exit 1
fi
echo ""

# Test 3: Dry run works without API key
echo "Test 3: Dry run works without API key"
if python -m adlook_cli https://example.com --dry-run 2>&1 | grep -q "Configuration validated successfully"; then
    echo "✓ PASS: Dry run validates without API key"
else
    echo "✗ FAIL: Dry run failed"
    exit 1
fi
echo ""

# Test 4: With API key shows placeholder
echo "Test 4: With API key shows placeholder confirmation"
export OPENAI_API_KEY=test-key
if python -m adlook_cli https://example.com 2>&1 | grep -q "Downstream implementation pending"; then
    echo "✓ PASS: Placeholder confirmation shown"
else
    echo "✗ FAIL: Placeholder not shown"
    exit 1
fi
echo ""

# Test 5: Verbose logging works
echo "Test 5: Verbose logging includes DEBUG info"
if python -m adlook_cli https://example.com --verbose 2>&1 | grep -q "DEBUG"; then
    echo "✓ PASS: Verbose logging works"
else
    echo "✗ FAIL: Verbose logging failed"
    exit 1
fi
echo ""

# Test 6: Custom output directory
echo "Test 6: Custom output directory works"
python -m adlook_cli https://example.com --output ./test-output --dry-run > /dev/null 2>&1
if [ -d "./test-output/example.com" ]; then
    echo "✓ PASS: Custom output directory created"
    rm -rf ./test-output
else
    echo "✗ FAIL: Custom output directory not created"
    exit 1
fi
echo ""

# Test 7: Version flag
echo "Test 7: Version information displayed"
if python -m adlook_cli --version 2>&1 | grep -q "0.1.0"; then
    echo "✓ PASS: Version displayed correctly"
else
    echo "✗ FAIL: Version not displayed"
    exit 1
fi
echo ""

# Cleanup
rm -rf output/ test-output/

echo "========================================"
echo "All acceptance tests passed! ✓"
echo "========================================"
