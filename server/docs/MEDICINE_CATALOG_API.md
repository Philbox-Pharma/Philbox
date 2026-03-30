# Medicine Catalog API - Implementation Guide

## Overview

The Medicine Catalog API implements a flexible medicine browsing system with two distinct flows:

1. **Branch-Selected Flow**: User selects a specific branch and browses medicines from that branch only
2. **Proximity-Based Flow**: System calculates proximity between user's address and all branch addresses, then displays medicines ranked by nearest branches

## Architecture

### Core Components

#### 1. **Proximity Calculator** (`utils/proximityCalculator.js`)

Handles distance calculation between addresses using:

- **Primary Method**: Haversine formula using coordinates extracted from Google Maps links
- **Fallback Method**: Location hierarchy scoring (country → province → city → town)

**Key Functions**:

- `extractCoordinatesFromMapLink()` - Parses lat/lng from Google Maps URL
- `calculateDistance()` - Uses Haversine formula for actual distance in km
- `calculateLocationProximityScore()` - Fallback proximity scoring
- `rankBranchesByProximity()` - Main function to sort branches by proximity

#### 2. **Catalog Service** (`service/catalog.service.js`)

Business logic layer that handles all medicine browsing operations.

**Key Methods**:

- `browseMedicines()` - Main method for fetching medicines (both flows)
- `getAvailableBranches()` - Returns branches ranked by proximity
- `getMedicineDetails()` - Gets detailed info for a specific medicine
- `searchMedicines()` - Search functionality

#### 3. **Catalog Controller** (`controller/catalog.controller.js`)

API endpoint handlers.

**Key Endpoints**:

- `GET /api/customer/medicines` - Browse medicines
- `GET /api/customer/medicines/branches` - Get available branches
- `GET /api/customer/medicines/:medicineId` - Get medicine details
- `GET /api/customer/medicines/search` - Search medicines

## API Endpoints

### 1. Browse Medicines

**Endpoint**: `GET /api/customer/medicines`

**Authentication**: Required (Customer)

**Query Parameters**:

```javascript
{
  branchId: null,                          // Optional: Filter by branch
  category: string,                        // Optional: Medicine category
  brand: string,                           // Optional: Brand/medicine name
  dosage: string,                          // Optional: Dosage form (tablet, syrup, etc.)
  prescriptionStatus: 'OTC' | 'prescription_required', // Optional
  sortBy: 'name' | 'price_low_to_high' | 'price_high_to_low' | 'popularity',
  page: integer,                           // Default: 1
  limit: integer                           // Default: 20
}
```

**Response**:

```javascript
{
  medicines: [
    {
      _id: ObjectId,
      Name: string,
      alias_name: string,
      branch_id: { id, name, phone, ... },
      salesperson_id: { ... },
      medicine_category: string,
      sale_price: number,
      is_available: boolean,
      branchProximity: {
        proximityScore: number,            // km (if Haversine) or score (if hierarchy)
        proximityMethod: 'haversine' | 'location_hierarchy',
        distanceInfo: string               // Human readable (e.g., "5.23 km away")
      },
      // ... other medicine fields
    }
  ],
  pagination: {
    currentPage: number,
    totalPages: number,
    totalMedicines: number,
    itemsPerPage: number
  },
  selectedBranch: ObjectId | null,
  branchesAvailable: number,
  appliedFilters: { category, brand, dosage, prescriptionStatus, sortBy }
}
```

**Examples**:

**Example 1: Browse with branch selection**

```
GET /api/customer/medicines?branchId=507f1f77bcf86cd799439011&sortBy=price_low_to_high&page=1&limit=20
```

**Example 2: Browse with proximity (no branch selected)**

```
GET /api/customer/medicines?category=pain_relief&sortBy=price_low_to_high
```

**Example 3: Browse with multiple filters**

```
GET /api/customer/medicines?category=antibiotics&brand=Crocin&dosage=tablet&sortBy=price_low_to_high&page=1&limit=20
```

---

### 2. Get Available Branches

**Endpoint**: `GET /api/customer/medicines/branches`

**Authentication**: Required (Customer)

**Response**:

```javascript
{
  branches: [
    {
      _id: ObjectId,
      name: string,
      code: string,
      phone: string,
      address: {
        street: string,
        city: string,
        province: string,
        zip_code: string,
        country: string,
        google_map_link: string,
      },
      proximityScore: number,
      proximityMethod: 'haversine' | 'location_hierarchy',
      distanceInfo: string, // e.g., "5.23 km away" or "In Karachi"
    },
  ];
}
```

**Example**:

```
GET /api/customer/medicines/branches
```

**Response Example**:

```json
{
  "branches": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Health Plus - Downtown",
      "code": "HP-DT-001",
      "phone": "021-2345678",
      "proximityScore": 5.23,
      "proximityMethod": "haversine",
      "distanceInfo": "5.23 km away"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Health Plus - North",
      "code": "HP-N-001",
      "phone": "021-8765432",
      "proximityScore": 12.45,
      "proximityMethod": "haversine",
      "distanceInfo": "12.45 km away"
    }
  ]
}
```

---

### 3. Get Medicine Details

**Endpoint**: `GET /api/customer/medicines/:medicineId`

**Authentication**: Required (Customer)

**URL Parameters**:

- `medicineId`: MongoDB ObjectId of the medicine

**Response**:

```javascript
{
  medicine: {
    _id: ObjectId,
    Name: string,
    alias_name: string,
    branch_id: ObjectId,
    salesperson_id: ObjectId,
    img_urls: [string],
    mgs: string,                           // Dosage/strength
    medicine_category: string,
    class: ObjectId,
    description: string,
    sale_price: number,
    purchase_price: number,
    pack_unit: number,
    sales_discount: number,
    is_available: boolean,
    lowStockThreshold: number,
    // ... other fields
  },
  branch: {
    _id: ObjectId,
    name: string,
    phone: string,
    address: { ... }
  },
  availability: {
    inStock: boolean,
    stockStatus: 'In Stock' | 'Out of Stock'
  }
}
```

**Example**:

```
GET /api/customer/medicines/507f1f77bcf86cd799439011
```

---

### 4. Search Medicines

**Endpoint**: `GET /api/customer/medicines/search`

**Authentication**: Required (Customer)

**Query Parameters**:

```javascript
{
  searchTerm: string,        // Required, min 2 characters
  branchId: ObjectId         // Optional: Limit search to specific branch
}
```

**Response**:

```javascript
{
  medicines: [
    {
      _id: ObjectId,
      Name: string,
      // ... medicine fields
    }
  ],
  count: number
}
```

**Example**:

```
GET /api/customer/medicines/search?searchTerm=aspirin&branchId=507f1f77bcf86cd799439011
```

---

## Data Flow

### Flow 1: With Branch Selection

```
User selects branch
    ↓
API receives branchId in query
    ↓
Service queries medicines where branch_id = selected branch
    ↓
Apply filters and sorting
    ↓
Return medicines with pagination
```

### Flow 2: Without Branch Selection (Proximity-Based)

```
User opens medicines without selecting branch
    ↓
API receives empty branchId (null)
    ↓
Service fetches customer's address from database
    ↓
Service fetches all active branches
    ↓
Proximity Calculator ranks branches:
  - Extract coordinates from Google Maps links
  - Use Haversine formula to calculate distance
  - Group medicines by branch proximity
    ↓
Query medicines from all branches
    ↓
Enhance medicines with proximity info
    ↓
Apply filters and sorting
    ↓
Return medicines ranked by branch proximity
```

---

## Proximity Calculation Details

### Google Maps Link Format Support

The system extracts coordinates from these Google Maps URL formats:

**Format 1**: Standard Google Maps URL with @ symbol

```
https://www.google.com/maps/@40.7128,-74.0060,15z
```

**Format 2**: Google Maps with query parameter

```
https://maps.google.com/?q=40.7128,-74.0060
```

**Format 3**: Shortened Google Maps URL

```
https://goo.gl/maps/xxxxx (requires additional processing)
```

### Haversine Formula (Primary Method)

Calculates the great-circle distance between two points on Earth:

```
- Takes latitude and longitude of both addresses
- Returns distance in kilometers
- More accurate for actual distances
```

### Location Hierarchy Fallback (Fallback Method)

When coordinates cannot be extracted:

```
Same country: 0 points
Different country: 999 points (very far)
Same province: 0 points additional
Different province: 100 points additional
Same city: 0 points additional
Different city: 50 points additional
Same town: 0 points additional
Different town: 10 points additional
```

Lower score = Closer proximity

---

## Frontend Integration

### Example 1: Browse with Branch Selection

```javascript
// User selects a branch
const branchId = '507f1f77bcf86cd799439011';

// Fetch medicines from selected branch
const response = await fetch(
  `/api/customer/medicines?branchId=${branchId}&sortBy=name&page=1&limit=20`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

const { medicines, pagination } = await response.json();
```

### Example 2: Browse Without Branch Selection (Proximity-Based)

```javascript
// User doesn't select a branch - get proximity-ranked medicines
const response = await fetch(
  '/api/customer/medicines?sortBy=name&page=1&limit=20',
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

const { medicines, branchesAvailable } = await response.json();

// medicines will be sorted by branch proximity
// branchProximity.distanceInfo shows "X.XX km away" or "In City Name"
medicines.forEach(medicine => {
  console.log(`${medicine.Name} - ${medicine.branchProximity.distanceInfo}`);
});
```

### Example 3: Get Available Branches for UI Selection

```javascript
// Show branches ranked by proximity
const response = await fetch('/api/customer/medicines/branches', {
  headers: { Authorization: `Bearer ${token}` },
});

const { branches } = await response.json();

// Display branches with distance info
branches.forEach(branch => {
  console.log(`${branch.name} - ${branch.distanceInfo}`);
});
```

### Example 4: Advanced Filtering

```javascript
const params = new URLSearchParams({
  category: 'antibiotics',
  brand: 'Crocin',
  dosage: 'tablet',
  prescriptionStatus: 'OTC',
  sortBy: 'price_low_to_high',
  page: 1,
  limit: 20,
});

const response = await fetch(`/api/customer/medicines?${params}`, {
  headers: { Authorization: `Bearer ${token}` },
});

const data = await response.json();
```

---

## Database Schema References

### Medicine Schema

```javascript
{
  Name: string,
  alias_name: string,
  branch_id: ObjectId (refs Branch),
  salesperson_id: ObjectId (refs Salesperson),
  medicine_category: string,
  mgs: string,                              // Dosage form (tablet, syrup, etc.)
  sale_price: number,
  is_available: boolean,
  // ... other fields
}
```

### Address Schema

```javascript
{
  street: string,
  town: string,
  city: string,
  province: string,
  zip_code: string,
  country: string,
  google_map_link: string,                  // Used for proximity calculation
  address_of_persons_id: ObjectId
}
```

### Branch Schema

```javascript
{
  name: string,
  code: string,
  address_id: ObjectId (refs Address),
  phone: string,
  status: 'Active' | 'Inactive'
}
```

---

## Error Handling

**400 Bad Request**: Invalid parameters (e.g., searchTerm < 2 characters)

**404 Not Found**:

- Customer not found
- Branch not found
- Medicine not found
- No branches available

**500 Internal Server Error**: Server-side error

---

## Activity Logging

All API calls are logged:

- `BROWSED_MEDICINES` - When browsing catalog
- `VIEWED_BRANCH_LIST` - When viewing branches
- `VIEWED_MEDICINE_DETAILS` - When viewing medicine details
- `SEARCHED_MEDICINES` - When searching

---

## Performance Optimizations

1. **Database Indexing**: Medicine schema has indexes on:
   - `branch_id`
   - `salesperson_id`
   - `Name`
   - `medicine_category`

2. **Lean Queries**: Using `.lean()` for read-only operations

3. **Pagination**: Default 20 items per page to reduce load

4. **Proximity Calculation**: Only performed when no branch selected

---

## Future Enhancements

1. **Caching**: Cache proximity rankings for similar locations
2. **Real-time Stock**: Integrate real-time stock levels
3. **User Preferences**: Remember user's preferred branch
4. **Favorites**: Save favorite medicines
5. **Recommendations**: ML-based recommendations based on purchase history
6. **Location Services**: Use device GPS for more accurate proximity (if user permits)
