# Medicine Catalog API - Testing & Examples

## Setup Required

### 1. Customer Must Have Address

```javascript
// Customer must have address_id populated with valid Address object
// Address MUST have google_map_link for proximity calculation

// Example address with coordinates in Google Maps link:
{
  _id: ObjectId,
  street: "123 Main Street",
  city: "Karachi",
  province: "Sindh",
  country: "Pakistan",
  google_map_link: "https://www.google.com/maps/@24.8607,-87.0711,15z"
  // or: "https://maps.google.com/?q=24.8607,-87.0711"
}
```

### 2. Branches Must Have Addresses

```javascript
// Each branch MUST have address_id and be Active

// Example branch:
{
  _id: ObjectId,
  name: "Health Plus Downtown",
  code: "HP-DT",
  address_id: ObjectId("507f..."), // Points to Address with google_map_link
  status: "Active"
}
```

### 3. Medicines Must Be Available

```javascript
// Medicines MUST have:
{
  Name: "Aspirin 500mg",
  branch_id: ObjectId("507f..."),
  salesperson_id: ObjectId("507f..."),
  is_available: true,
  sale_price: 150,
  medicine_category: "pain_relief"
}
```

---

## Test Scenarios

### Test 1: Browse Medicines with Branch Selection

**Setup**:

- Logged-in customer with valid token
- Valid branch ID (e.g., "507f1f77bcf86cd799439011")
- Patient medicines in that branch

**Request**:

```bash
curl -X GET "http://localhost:5000/api/customer/medicines?branchId=507f1f77bcf86cd799439011&sortBy=name&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response** (200 OK):

```json
{
  "medicines": [
    {
      "_id": "507f1f77bcf86cd799439001",
      "Name": "Aspirin 500mg",
      "alias_name": "Disprin",
      "branch_id": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Health Plus Downtown",
        "phone": "021-2345678"
      },
      "medicine_category": "pain_relief",
      "sale_price": 150,
      "is_available": true,
      "createdAt": "2024-03-27T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalMedicines": 1,
    "itemsPerPage": 10
  },
  "selectedBranch": "507f1f77bcf86cd799439011",
  "branchesAvailable": 1,
  "appliedFilters": {
    "category": null,
    "brand": null,
    "dosage": null,
    "prescriptionStatus": null,
    "sortBy": "name"
  },
  "message": "Medicines fetched successfully"
}
```

---

### Test 2: Browse Medicines with Proximity (No Branch Selected)

**Setup**:

- Logged-in customer with valid address
- Address has google_map_link with coordinates
- Multiple branches with medicines

**Request**:

```bash
curl -X GET "http://localhost:5000/api/customer/medicines?sortBy=name&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response** (200 OK):

```json
{
  "medicines": [
    {
      "_id": "507f1f77bcf86cd799439001",
      "Name": "Aspirin 500mg",
      "sale_price": 150,
      "branch_id": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Health Plus Downtown"
      },
      "branchProximity": {
        "proximityScore": 5.23,
        "proximityMethod": "haversine",
        "distanceInfo": "5.23 km away"
      }
    },
    {
      "_id": "507f1f77bcf86cd799439002",
      "Name": "Paracetamol 500mg",
      "sale_price": 120,
      "branch_id": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Health Plus North"
      },
      "branchProximity": {
        "proximityScore": 12.45,
        "proximityMethod": "haversine",
        "distanceInfo": "12.45 km away"
      }
    }
  ],
  "selectedBranch": null,
  "branchesAvailable": 2,
  "appliedFilters": { ... }
}
```

---

### Test 3: Get Available Branches Ranked by Proximity

**Request**:

```bash
curl -X GET "http://localhost:5000/api/customer/medicines/branches" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response** (200 OK):

```json
{
  "branches": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Health Plus Downtown",
      "code": "HP-DT",
      "phone": "021-2345678",
      "address": {
        "_id": "507f1f77bcf86cd799439111",
        "street": "123 Main Street",
        "city": "Karachi",
        "province": "Sindh",
        "country": "Pakistan",
        "google_map_link": "https://www.google.com/maps/@24.8607,-87.0711,15z"
      },
      "proximityScore": 5.23,
      "proximityMethod": "haversine",
      "distanceInfo": "5.23 km away"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Health Plus North",
      "code": "HP-N",
      "phone": "021-8765432",
      "proximityScore": 12.45,
      "proximityMethod": "haversine",
      "distanceInfo": "12.45 km away"
    }
  ]
}
```

---

### Test 4: Browse with Filters

**Request** (Category filter):

```bash
curl -X GET "http://localhost:5000/api/customer/medicines?category=antibiotics&sortBy=price_low_to_high&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Request** (Multiple filters):

```bash
curl -X GET "http://localhost:5000/api/customer/medicines?category=pain_relief&brand=Crocin&dosage=tablet&sortBy=price_low_to_high&branchId=507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:

```json
{
  "medicines": [
    // Filtered medicines sorted by price (low to high)
  ],
  "appliedFilters": {
    "category": "pain_relief",
    "brand": "Crocin",
    "dosage": "tablet",
    "prescriptionStatus": null,
    "sortBy": "price_low_to_high"
  }
}
```

---

### Test 5: Search Medicines

**Request**:

```bash
curl -X GET "http://localhost:5000/api/customer/medicines/search?searchTerm=aspirin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (200 OK):

```json
{
  "medicines": [
    {
      "_id": "507f1f77bcf86cd799439001",
      "Name": "Aspirin 500mg",
      "alias_name": "Disprin",
      "branch_id": { ... },
      "medicine_category": "pain_relief",
      "sale_price": 150
    }
  ],
  "count": 1,
  "message": "Search results"
}
```

**Error Case** (search term too short):

```bash
curl -X GET "http://localhost:5000/api/customer/medicines/search?searchTerm=a" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (400 Bad Request):

```json
{
  "status": 400,
  "data": null,
  "message": "Search term must be at least 2 characters"
}
```

---

### Test 6: Get Medicine Details

**Request**:

```bash
curl -X GET "http://localhost:5000/api/customer/medicines/507f1f77bcf86cd799439001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (200 OK):

```json
{
  "medicine": {
    "_id": "507f1f77bcf86cd799439001",
    "Name": "Aspirin 500mg",
    "alias_name": "Disprin",
    "branch_id": ObjectId("507f1f77bcf86cd799439011"),
    "salesperson_id": ObjectId("507f1f77bcf86cd799439021"),
    "medicine_category": "pain_relief",
    "mgs": "500mg",
    "description": "Effective pain reliever",
    "sale_price": 150,
    "purchase_price": 100,
    "is_available": true,
    "lowStockThreshold": 10
  },
  "branch": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Health Plus Downtown",
    "phone": "021-2345678",
    "address": { ... }
  },
  "availability": {
    "inStock": true,
    "stockStatus": "In Stock"
  }
}
```

---

### Test 7: Pagination

**Request** (Get page 2 with 20 items per page):

```bash
curl -X GET "http://localhost:5000/api/customer/medicines?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:

```json
{
  "medicines": [
    /* items 21-40 */
  ],
  "pagination": {
    "currentPage": 2,
    "totalPages": 5,
    "totalMedicines": 100,
    "itemsPerPage": 20
  }
}
```

---

## Error Test Cases

### Test 8: No Authentication

**Request**:

```bash
curl -X GET "http://localhost:5000/api/customer/medicines"
```

**Expected Response** (401 or 403):

```json
{
  "status": 401,
  "message": "Unauthorized"
}
```

---

### Test 9: Invalid Branch ID

**Request**:

```bash
curl -X GET "http://localhost:5000/api/customer/medicines?branchId=invalidid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (404):

```json
{
  "status": 404,
  "message": "Selected branch not found"
}
```

---

### Test 10: Invalid Medicine ID

**Request**:

```bash
curl -X GET "http://localhost:5000/api/customer/medicines/507f1f77bcf86cd799999999" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (404):

```json
{
  "status": 404,
  "message": "Medicine not found"
}
```

---

### Test 11: No Branches Available

**Scenario**: All branches have status "Inactive"

**Expected Response** (404):

```json
{
  "status": 404,
  "message": "No branches available"
}
```

---

## Postman Collection Template

```json
{
  "info": {
    "name": "Medicine Catalog API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Browse Medicines - With Branch",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/customer/medicines?branchId={{branchId}}&sortBy=name&page=1&limit=20",
          "host": ["{{baseUrl}}"],
          "path": ["api", "customer", "medicines"]
        }
      }
    },
    {
      "name": "Browse Medicines - Proximity",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/customer/medicines?sortBy=name&page=1&limit=20",
          "host": ["{{baseUrl}}"],
          "path": ["api", "customer", "medicines"]
        }
      }
    },
    {
      "name": "Get Available Branches",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/customer/medicines/branches",
          "host": ["{{baseUrl}}"],
          "path": ["api", "customer", "medicines", "branches"]
        }
      }
    },
    {
      "name": "Get Medicine Details",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/customer/medicines/{{medicineId}}",
          "host": ["{{baseUrl}}"],
          "path": ["api", "customer", "medicines", "{{medicineId}}"]
        }
      }
    },
    {
      "name": "Search Medicines",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/customer/medicines/search?searchTerm=aspirin",
          "host": ["{{baseUrl}}"],
          "path": ["api", "customer", "medicines", "search"],
          "query": [
            {
              "key": "searchTerm",
              "value": "aspirin"
            }
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": "YOUR_JWT_TOKEN"
    },
    {
      "key": "branchId",
      "value": "507f1f77bcf86cd799439011"
    },
    {
      "key": "medicineId",
      "value": "507f1f77bcf86cd799439001"
    }
  ]
}
```

---

## GraphQL Examples (if needed)

### Query 1: Browse Medicines

```graphql
query {
  browseMedicines(
    branchId: "507f1f77bcf86cd799439011"
    sortBy: "name"
    page: 1
    limit: 20
  ) {
    medicines {
      id
      name
      salePrice
      category
      branch {
        name
        distance
      }
    }
    pagination {
      currentPage
      totalPages
    }
  }
}
```

### Query 2: Get Branches

```graphql
query {
  availableBranches {
    id
    name
    proximityScore
    distanceInfo
  }
}
```
