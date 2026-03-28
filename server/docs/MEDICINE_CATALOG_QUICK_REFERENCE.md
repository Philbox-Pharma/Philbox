# Medicine Catalog Feature - Quick Reference

## What Was Implemented

A complete medicine browsing system with two distinct user flows and sophisticated proximity-based ranking.

## Files Created

```
server/src/main/utils/
  └── proximityCalculator.js                  # Proximity calculation logic

server/src/main/modules/customer/features/medicine_catalog/
  ├── controllers/
  │   └── catalog.controller.js              # API endpoint handlers
  ├── routes/
  │   └── catalog.routes.js                  # Route definitions
  └── service/
      └── catalog.service.js                 # Business logic

server/docs/
  └── MEDICINE_CATALOG_API.md                # Full API documentation
```

## Key Features

### ✅ Flow 1: Branch Selection

- User selects a specific branch
- System returns medicines **only from that branch**
- Sorted by user's preference (name, price, popularity)
- Efficient and straightforward

### ✅ Flow 2: Proximity-Based Browsing (No Branch Selected)

- System calculates distance between customer's address and **all branch addresses**
- Uses **Google Maps links** for coordinate extraction
- Applies **Haversine formula** for actual distance calculation
- **Fallback to location hierarchy** if coordinates unavailable
- Medicines ranked by **closest branches first**
- Shows distance info for each medicine (e.g., "5.23 km away")

## API Endpoints

| Endpoint                              | Method | Purpose                                 |
| ------------------------------------- | ------ | --------------------------------------- |
| `/api/customer/medicines`             | GET    | Browse medicines with optional filters  |
| `/api/customer/medicines/branches`    | GET    | List all branches ranked by proximity   |
| `/api/customer/medicines/:medicineId` | GET    | Get single medicine details             |
| `/api/customer/medicines/search`      | GET    | Search medicines by name/category/brand |

## Filtering & Sorting

**Filters Available**:

- ✅ Category (medicine_category)
- ✅ Brand (Name/alias_name)
- ✅ Dosage Form (mgs field - tablet, syrup, injection, etc.)
- ✅ Prescription Status (OTC vs prescription required)
- ✅ Branch Selection (optional)

**Sort Options**:

- `name` - Alphabetical
- `price_low_to_high` - Budget-friendly first
- `price_high_to_low` - Premium first
- `popularity` - Most popular first

**Pagination**:

- Default: 20 items per page
- Configurable via `limit` parameter

## Proximity Calculation

### Step 1: Extract Coordinates

- Parses Google Maps URL from Address schema
- Supports multiple URL formats
- Falls back to location hierarchy if no coordinates

### Step 2: Calculate Distance

- **Primary**: Haversine formula (Real distance in km)
- **Fallback**: Location hierarchy scoring (Country → Province → City → Town)

### Step 3: Rank Branches

- Sorts branches by proximity score (lowest = closest)
- All medicines from ranked branches are returned in proximity-order

## Query Examples

### Browse with Branch Selection

```
GET /api/customer/medicines?branchId=507f1f77bcf86cd799439011&sortBy=price_low_to_high&page=1
```

Returns: Medicines from branch ID 507f... sorted by price

### Browse with Proximity (No Branch)

```
GET /api/customer/medicines?category=antibiotics&sortBy=name
```

Returns: Antibiotics from all branches, sorted by proximity to user, then by name

### Search with Multiple Filters

```
GET /api/customer/medicines?category=pain_relief&brand=Crocin&dosage=tablet&sortBy=price_low_to_high&page=1&limit=20
```

### Get Available Branches

```
GET /api/customer/medicines/branches
```

Returns: All branches ranked by distance from customer

## Response Structure

### Medicines List Response

```javascript
{
  medicines: [
    {
      _id: "...",
      Name: "Aspirin 500mg",
      sale_price: 150,
      branch_id: { name: "Downtown Pharmacy", ... },
      branchProximity: {
        proximityScore: 5.23,
        proximityMethod: "haversine",
        distanceInfo: "5.23 km away"
      },
      is_available: true,
      // ... other fields
    }
  ],
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalMedicines: 100,
    itemsPerPage: 20
  },
  selectedBranch: null,
  branchesAvailable: 3,
  appliedFilters: { ... }
}
```

## Authentication

🔒 **All endpoints require customer authentication**

- Pass JWT token in Authorization header
- Token extracted from `req.user.id` in middleware

## Activity Logging

All actions are logged:

- `BROWSED_MEDICINES` - Browse catalog
- `VIEWED_BRANCH_LIST` - View available branches
- `VIEWED_MEDICINE_DETAILS` - View medicine details
- `SEARCHED_MEDICINES` - Search performed

## Database Requirements

### Address Schema Must Have

```javascript
google_map_link: string; // Must contain coordinates in URL
// Example: https://www.google.com/maps/@40.7128,-74.0060,15z
```

### Branch Schema Must Have

```javascript
address_id: { type: ObjectId, ref: 'Address' }
status: 'Active'  // Only active branches included
```

### Medicine Schema Must Have

```javascript
branch_id: { type: ObjectId, ref: 'Branch' }
is_available: boolean
```

## Important Notes

1. **Medicine Schema Not Changed**: As per requirements, the medicine schema remains unchanged
2. **Proximity Uses Google Maps**: Distance calculated from google_map_link in Address
3. **Two Independent Flows**: Branch selection completely overrides proximity calculation
4. **Backward Compatible**: Existing APIs unaffected
5. **Scalable**: Indexes optimize queries for large datasets

## Frontend Considerations

### For Branch Selection Flow

- Show branch selector before showing medicines
- Display selected branch info
- Let user switch branches easily

### For Proximity Flow

- Show distance info for each medicine
- Display branch name and distance
- Allow user to filter by specific branch
- Show "No branch selected - showing from all nearby branches"

### UI Components Needed

- [ ] Branch selector/dropdown
- [ ] Medicine card with branch & distance info
- [ ] Filter sidebar (category, brand, dosage, prescription status)
- [ ] Sort dropdown
- [ ] Pagination controls
- [ ] Search bar
- [ ] Branch list with distances (optional)

## Error Scenarios to Handle

| Scenario                | Response                   | Frontend Action                   |
| ----------------------- | -------------------------- | --------------------------------- |
| No branches available   | 404                        | Show "No pharmacies available"    |
| Customer has no address | Continue with all branches | Show "Showing from all branches"  |
| Invalid branch ID       | 404                        | Clear selection, show error       |
| No medicines found      | Empty array                | Show "No medicines match filters" |
| Search term < 2 chars   | 400                        | Validate on client                |

## Performance Tips

1. **Pagination**: Always use pagination (default 20)
2. **Filters**: Use specific filters to reduce results
3. **Caching**: Cache medicine list on client for 5-10 seconds
4. **Lazy Loading**: Load more on scroll
5. **Coordinates**: Ensure google_map_link is valid for fast proximity calc

## Testing

### Test Case 1: Branch Selection

1. User selects branch X
2. Fetch medicines with `branchId=X`
3. Verify only medicines from branch X returned
4. Verify no proximity info needed

### Test Case 2: Proximity-Based with Address

1. User has valid address with google_map_link
2. Fetch medicines without branchId
3. Verify branches ranked by distance
4. Verify distanceInfo shows km values
5. Verify medicines sorted by branch proximity

### Test Case 3: Proximity-Based without Address

1. User has no address
2. Fetch medicines without branchId
3. Verify all branches included
4. Verify medicines returned (no crash)

### Test Case 4: Invalid Google Maps Link

1. Branch address has invalid google_map_link
2. Fetch medicines without branchId
3. Verify fallback to location hierarchy works
4. Verify no crash

### Test Case 5: Filtering & Sorting

1. Apply category filter
2. Apply sort by price
3. Verify results filtered AND sorted correctly
4. Verify pagination works

## Integration Checklist

- [ ] Routes registered in server.js ✅
- [ ] Service layer implemented ✅
- [ ] Controller layer implemented ✅
- [ ] Proximity calculator implemented ✅
- [ ] Error handling implemented ✅
- [ ] Activity logging added ✅
- [ ] Documentation created ✅
- [ ] Database indexes verified (assumed)
- [ ] Testing completed
- [ ] Frontend integration completed
- [ ] Staging deployment
- [ ] Production deployment
