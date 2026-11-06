# 🏨 Hostel Management System (CampusStay HMS)

A modern, beautified web-based Hostel Management System created based on your template design with full CRUD operations.

---

## 📋 Features & Fields

Every room in the hostel is tracked with the exact fields requested:
- **Room ID** (`room_id`): Unique numeric room identifier (e.g., `101`, `201`, `301`).
- **Room No** (`room_no`): Room door label (e.g., `A-101`, `B-201`, `C-301`).
- **Block Name** (`block_name`): Name of the hostel block / wing (e.g., `Block A (Ganga)`, `Block B (Yamuna)`, `Block C (Godavari)`).
- **Capacity of Room** (`capacity`): Number of beds (e.g., `1 Bed`, `2 Beds`, `3 Beds`, `4 Beds`, `6 Beds`).
- **Status** (`status`): Real-time occupancy status:
  - 🟢 **Available**
  - 🔵 **Occupied**
  - 🟠 **Under Maintenance**

---

## 🎨 Beautification Highlights

- **Modern Visual Design**: Professional slate & indigo theme with Plus Jakarta Sans typography.
- **Dynamic Status Badges**: Color-coded pill indicators with active status dots.
- **Live Dashboard Cards**: Instant statistics on `index.html` tracking Total Rooms, Available, Occupied, and Maintenance.
- **Responsive Tables**: Rounded tables with smooth hover rows and action shortcuts (Edit / Delete).
- **Toast Notifications**: Non-intrusive, floating success/error alerts.
- **Dual Mode (Server + Standalone)**:
  - Can be served via Express REST API (`http://localhost:3000`).
  - Can also be directly opened in any browser (`index.html`) using `file://` — it will automatically fall back to `localStorage` with pre-seeded data so it never fails!

---

## 📁 Project Structure

```
hostel-management/
├── index.html       # Home Dashboard (Statistics, quick actions, snapshot table)
├── list.html        # List All Rooms (Status filter, table, quick edit/delete)
├── listOne.html     # Search / List Required Room (Lookup by Room ID or Room No)
├── insert.html      # Insert Room (Add new room with validation)
├── update.html      # Update Room (Fetch room, modify fields, and save)
├── delete.html      # Delete Room (Room preview card + confirmation prompt)
├── style.css        # Unified beautification stylesheet
├── client-api.js    # Client-side API connector with offline fallback & toast
├── server.js        # Node.js Express REST API backend
├── rooms.json       # JSON database storage
└── package.json     # Project configuration & start script
```

---

## 🚀 How to Run

### Option 1: Running with Node.js Express Server (Recommended)
1. Open PowerShell or terminal in this folder:
   ```powershell
   cd C:\Users\Dell\.gemini\antigravity\scratch\hostel-management
   ```
2. Start the server:
   ```powershell
   npm start
   ```
   *(or `node server.js`)*
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Option 2: Direct Browser Opening (No Server Needed)
Simply double-click `index.html` in your file explorer (or right-click -> Open with Chrome / Edge). It will work immediately with browser storage!

---

## 🧪 Run Automated Tests
To verify all REST API endpoints (`GET`, `POST`, `PUT`, `DELETE`):
```powershell
node test-api.js
```
