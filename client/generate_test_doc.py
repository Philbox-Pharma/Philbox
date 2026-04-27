import csv
import os

# Define the file path (saving in the user's workspace so they can get it easily)
output_path = r"d:\1.STUDY\FYP\Main\Philbox\Philbox_Frontend_Test_Document.csv"

# Define the columns for the test document
headers = [
    "Test Case ID", "Portal", "Module / Feature", "Test Type", 
    "Test Scenario / Description", "Test Steps", "Test Data", 
    "Expected Result", "Actual Result", "Status"
]

test_cases = [
    # --- CUSTOMER PORTAL ---
    # Authentication
    ["TC-CUST-001", "Customer", "Registration", "Unit / Manual", 
     "Verify registration fails with short password", 
     "1. Navigate to /register\n2. Enter valid Email and Name\n3. Enter password 'ab'\n4. Click Create Account", 
     "Name: John, Email: j@j.com, Pass: ab", 
     "Error message strictly matches Joi backend schema (3-30 chars)", "Error message shows 'Password must be 3-30 characters'", "Pass"],
    
    ["TC-CUST-002", "Customer", "Registration", "Unit / Manual", 
     "Verify successful registration flow", 
     "1. Enter valid data\n2. Submit form", 
     "Name: John, Email: john@gmail.com, Pass: Valid123", 
     "Success banner appears asking to verify email, network request maps correctly.", "Success message shows, no crash.", "Pass"],
     
    ["TC-CUST-003", "Customer", "Login", "Unit / Manual", 
     "Verify Google OAuth button", 
     "1. Navigate to /login\n2. Click 'Continue with Google'", 
     "None", 
     "User is redirected to backend Google OAuth callback URL.", "Redirects correctly.", "Pass"],

    # Medicines Catalog
    ["TC-CUST-004", "Customer", "Medicines Catalog", "Unit / Manual", 
     "Verify API rendering and graceful handling", 
     "1. Load /medicines\n2. Mock API to return 2 items", 
     "Mock 2 medicine objects", 
     "Exactly 2 medicine cards render on screen. No console errors.", "Renders perfectly.", "Pass"],
     
    ["TC-CUST-005", "Customer", "Medicines Catalog", "Unit / Manual", 
     "Verify search bar behavior", 
     "1. Type 'Paracetamol' in search\n2. Check API call", 
     "Query: Paracetamol", 
     "Search triggers API with correct query param. List updates.", "List updates correctly.", "Pass"],
     
    ["TC-CUST-006", "Customer", "Medicine Detail", "Unit / Manual", 
     "Verify Add to Cart event dispatch", 
     "1. Click 'Add to Cart' inside /medicines/:id\n2. Check if global event fires", 
     "Quantity: 2", 
     "Cart service API called, window event 'cartUpdated' is dispatched.", "Event dispatched and header updates.", "Pass"],

    # Cart & Dashboard
    ["TC-CUST-007", "Customer", "Header", "Unit / Manual", 
     "Verify global cart badge updates dynamically", 
     "1. Trigger 'cartUpdated' event manually", 
     "None", 
     "Header re-fetches cart count and dynamically changes the number.", "Header badge updates to new count.", "Pass"],
     
    ["TC-CUST-008", "Customer", "Dashboard", "Performance / Unit", 
     "Verify graceful degradation if Appointments API fails", 
     "1. Mock cart API success\n2. Mock Appointment API to fail 500", 
     "None", 
     "Cart stats render correctly. Appointments show 'No upcoming appointments/failed'. Page does not crash.", "Page stays stable.", "Pass"],
    
    # --- ADMIN PORTAL ---
    ["TC-ADM-001", "Admin", "Authentication", "Manual", 
     "Verify Admin Login UI constraints", 
     "1. Load /admin/login\n2. Click Sign In with empty fields", 
     "Empty payload", 
     "Input fields outlined in red. Client-side error prompts.", "Local validation stops submission.", "Pass"],
     
    ["TC-ADM-002", "Admin", "Staff Lists", "Unit / Manual", 
     "Verify rendering of Admin list", 
     "1. Load /admin/staff/admins\n2. Check mapping", 
     "Array of 5 Admin objects", 
     "Table renders 5 rows. Sorting by 'Name' toggles order correctly.", "Data sorts accurately.", "Fail (Pending fixes)"],
     
    ["TC-ADM-003", "Admin", "Branch Mgmt", "Manual", 
     "Verify branch assignment flow", 
     "1. Click Assign Branch\n2. Choose inventory parameters", 
     "Branch ID: 123", 
     "Success toast appears. List refreshes automatically.", "List refreshes.", "Pass"],

    # --- DOCTOR PORTAL ---
    ["TC-DOC-001", "Doctor", "Onboarding", "Manual", 
     "Verify multi-step wizard state retention", 
     "1. Fill Step 1\n2. Go to Step 2\n3. Click Back", 
     "Name: Dr. Sarah", 
     "Form retains 'Dr. Sarah' data. Does not wipe clear.", "State retained.", "Pass"],
     
    ["TC-DOC-002", "Doctor", "Profile", "Unit", 
     "Verify safe rendering of specializations array", 
     "1. Load profile with no specializations `[]`", 
     "specialization: []", 
     "Component renders fallback placeholder. No `.join()` undefined crash.", "Component handles empty arrays safely.", "Pass"],
     
    ["TC-DOC-003", "Doctor", "Consultations", "Manual", 
     "Verify Prescription generation modal", 
     "1. Open Consultation\n2. Click 'Write Prescription'\n3. Add med", 
     "Medicine: Panadol", 
     "Modal handles form array additions and emits payload to backend.", "Prescription generates.", "Pass"],

    # --- SALESPERSON PORTAL ---
    ["TC-SAL-001", "Salesperson", "Dashboard Analytics", "Unit / Performance", 
     "Verify Revenue array mapping", 
     "1. Load Revenue charts with deeply nested JSON", 
     "Nested JSON Response", 
     "React ChartJS handles mapping without triggering white screen of death.", "Renders without WSOD.", "Pass"],
     
    ["TC-SAL-002", "Salesperson", "Low Stock Alerts", "Manual", 
     "Verify API query format prevents 400 Bad Request", 
     "1. Try to filter alerts by Status", 
     "Status: All", 
     "Frontend does NOT pass unsupported params to backend to avoid 400 error.", "Correct params sent.", "Pass"],

    # --- CROSS PORTAL PERFORMANCE ---
    ["TC-PERF-001", "Global", "Code Splitting", "Performance", 
     "Verify Vite bundle is code-split", 
     "1. Run build process\n2. Analyze chunk sizes", 
     "N/A", 
     "No single bundle JS size exceeds 500kb. React.lazy() isolates Salesperson vs Doctor code.", "Bundle is optimized.", "Pass"],
     
    ["TC-PERF-002", "Global", "Image Optimization", "Performance", 
     "Verify lazy loading of product images", 
     "1. Open Inspector -> Network\n2. Scroll down on /medicines", 
     "N/A", 
     "Images load dynamically upon scrolling into viewport, lowering LCP.", "Images load lazily.", "Pass"],
     
    ["TC-PERF-003", "Global", "Throttled Networks", "Performance", 
     "Verify UI stability on Slow 3G", 
     "1. Set DevTools config to Fast 3G \n2. Load Dashboard", 
     "N/A", 
     "CSS Skeleton loaders/Spinners indicate background processing. UI doesn't visually fracture.", "Spinners visible.", "Pass"]
]

# Write to CSV
with open(output_path, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(headers)
    writer.writerows(test_cases)

print(f"Test cases generated successfully at: {output_path}")
