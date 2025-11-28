#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing All API Endpoints..."
echo "================================"
echo ""

# Check if backend is running
if ! lsof -i :4001 >/dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running on port 4001${NC}"
    echo "Please start the backend first:"
    echo "  cd /path/to/backend"
    echo "  npm run start:dev"
    exit 1
fi

echo -e "${GREEN}✅ Backend is running on port 4001${NC}"
echo ""

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local check=$3
    
    echo -e "${BLUE}Testing: ${name}${NC}"
    
    response=$(curl -s "$url")
    
    if echo "$response" | jq -e "$check" >/dev/null 2>&1; then
        count=$(echo "$response" | jq -r "$check")
        echo -e "${GREEN}  ✅ Success: $count${NC}"
        ((PASSED++))
    else
        echo -e "${RED}  ❌ Failed${NC}"
        echo "  Response: $(echo "$response" | jq -r '.message // "Unknown error"')"
        ((FAILED++))
    fi
    echo ""
}

# 1. Best Selling Products
test_endpoint \
    "1️⃣ Best Selling Products" \
    "http://localhost:4001/product/public?isBestSelling=true&limit=10" \
    'if .data then "\(.data | length) products" else false end'

# 2. Gift Products
test_endpoint \
    "2️⃣ Gift Products" \
    "http://localhost:4001/product/public?isGift=true&limit=12" \
    'if .data then "\(.data | length) products" else false end'

# 3. New Arrivals
test_endpoint \
    "3️⃣ New Arrivals" \
    "http://localhost:4001/product/public?isNewArrival=true&limit=12" \
    'if .data then "\(.data | length) products" else false end'

# 4. Featured Blogs
test_endpoint \
    "4️⃣ Featured Blogs" \
    "http://localhost:4001/blog/public?isFeatured=true&limit=6" \
    'if .posts then "\(.posts | length) blogs" else false end'

# 5. FAQ
test_endpoint \
    "5️⃣ FAQ" \
    "http://localhost:4001/faq" \
    'if type=="array" then "\(length) FAQs" else false end'

# 6. Product Categories
test_endpoint \
    "6️⃣ Product Categories" \
    "http://localhost:4001/product-category/public" \
    'if type=="array" then "\(length) categories" else false end'

# 7. Women Products
test_endpoint \
    "7️⃣ Women Products" \
    "http://localhost:4001/product/public?category=women&limit=12" \
    'if .data then "\(.data | length) products" else false end'

# 8. Men Products
test_endpoint \
    "8️⃣ Men Products" \
    "http://localhost:4001/product/public?category=men&limit=12" \
    'if .data then "\(.data | length) products" else false end'

# 9. Kids Products
test_endpoint \
    "9️⃣ Kids Products" \
    "http://localhost:4001/product/public?category=kids&limit=12" \
    'if .data then "\(.data | length) products" else false end'

# 10. Blog List (Paginated)
test_endpoint \
    "🔟 Blog List (Page 1)" \
    "http://localhost:4001/blog/public?page=1&limit=6" \
    'if .posts then "\(.posts | length) blogs, Page \(.page)/\(.totalPages)" else false end'

# 11. Product Detail
echo -e "${BLUE}Testing: 1️⃣1️⃣ Product Detail${NC}"
SLUG=$(curl -s "http://localhost:4001/product/public?limit=1" | jq -r '.data[0].slug')
if [ "$SLUG" != "null" ] && [ -n "$SLUG" ]; then
    response=$(curl -s "http://localhost:4001/product/public/$SLUG")
    if echo "$response" | jq -e '._id' >/dev/null 2>&1; then
        name=$(echo "$response" | jq -r '.name')
        echo -e "${GREEN}  ✅ Success: Product found ($name)${NC}"
        ((PASSED++))
    else
        echo -e "${RED}  ❌ Failed to fetch product detail${NC}"
        ((FAILED++))
    fi
else
    echo -e "${RED}  ❌ Failed to get product slug${NC}"
    ((FAILED++))
fi
echo ""

# 12. Women Subcategory (Necklace)
test_endpoint \
    "1️⃣2️⃣ Women Necklace" \
    "http://localhost:4001/product/public?category=women&subcategory=necklace&limit=12" \
    'if .data then "\(.data | length) products" else false end'

# Summary
echo "================================"
echo -e "${YELLOW}📊 Test Summary:${NC}"
echo -e "${GREEN}  ✅ Passed: $PASSED${NC}"
echo -e "${RED}  ❌ Failed: $FAILED${NC}"
echo "================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please check the output above.${NC}"
    exit 1
fi

