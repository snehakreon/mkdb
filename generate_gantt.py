import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from datetime import date, timedelta

wb = openpyxl.Workbook()

# ============================================================
# SHEET 1: STATUS SUMMARY
# ============================================================
ws1 = wb.active
ws1.title = "Project Status"

# Styles
header_font = Font(bold=True, size=12, color="FFFFFF")
header_fill = PatternFill(start_color="2F5496", end_color="2F5496", fill_type="solid")
section_font = Font(bold=True, size=11, color="2F5496")
section_fill = PatternFill(start_color="D6E4F0", end_color="D6E4F0", fill_type="solid")
done_fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
partial_fill = PatternFill(start_color="FFEB9C", end_color="FFEB9C", fill_type="solid")
missing_fill = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
done_font = Font(color="006100")
partial_font = Font(color="9C6500")
missing_font = Font(color="9C0006")
thin_border = Border(
    left=Side(style="thin"), right=Side(style="thin"),
    top=Side(style="thin"), bottom=Side(style="thin")
)

# Title
ws1.merge_cells("A1:D1")
ws1["A1"] = "MATERIAL KING - Project Status Report"
ws1["A1"].font = Font(bold=True, size=16, color="2F5496")

ws1.merge_cells("A2:D2")
ws1["A2"] = f"Generated: {date.today().strftime('%d %b %Y')}  |  Team: 6-7 developers  |  Timeline: 2-3 months"
ws1["A2"].font = Font(size=10, color="666666")

# Headers
row = 4
for col, val in enumerate(["Module / Feature", "Area", "Status", "Notes"], 1):
    cell = ws1.cell(row=row, column=col, value=val)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center")
    cell.border = thin_border

# Data
data = [
    # BACKEND - COMPLETED
    ("BACKEND - CORE", "", "", ""),
    ("Auth Module (register, login, JWT, refresh, logout)", "Backend", "DONE", "Full JWT auth with role middleware"),
    ("Products CRUD API", "Backend", "DONE", "List, create, update, delete"),
    ("Brands CRUD API", "Backend", "DONE", "List, create, update, delete"),
    ("Categories CRUD API", "Backend", "DONE", "List, create, update, delete"),
    ("Vendors CRUD API", "Backend", "DONE", "List, create, update, delete"),
    ("Zones CRUD API (with pincodes)", "Backend", "DONE", "Zone-vendor assignments, pincode mapping"),
    ("Buyers CRUD API (with projects)", "Backend", "DONE", "Buyer + project management"),
    ("Dealers CRUD API", "Backend", "DONE", "With credit limit, approval status"),
    ("Orders CRUD API (with items)", "Backend", "DONE", "Order creation with GST calc, line items"),
    ("DB Schema (15 tables) + Seed Script", "Backend", "DONE", "Full schema with migration patches"),
    ("Validation & Error Middleware", "Backend", "DONE", "Request validation middleware"),
    ("Role-based Access Control", "Backend", "DONE", "Admin, dealer, buyer, vendor roles"),

    # BACKEND - PENDING
    ("BACKEND - PENDING FEATURES", "", "", ""),
    ("Inventory Management", "Backend", "MISSING", "Stock tracking, low-stock alerts, reorder points"),
    ("Pricing Tiers / Discount Structures", "Backend", "PARTIAL", "Dealer credit exists; tier logic not implemented"),
    ("Order Workflow State Machine", "Backend", "PARTIAL", "Status fields exist; no transition validation"),
    ("File Upload (Multer/S3)", "Backend", "MISSING", "Tech sheet upload, product images"),
    ("Payment Integration (Razorpay)", "Backend", "MISSING", "No payment gateway code"),
    ("Invoice Generation (PDF)", "Backend", "MISSING", "No PDF generation library or templates"),
    ("Delivery Tracking", "Backend", "PARTIAL", "Basic date fields; no tracking numbers or logistics API"),
    ("Reporting / Analytics APIs", "Backend", "MISSING", "No dashboard stats, sales reports, analytics"),
    ("Search & Filtering + Pagination", "Backend", "MISSING", "No query params, pagination in any controller"),
    ("Notifications (Email/SMS)", "Backend", "MISSING", "No nodemailer/twilio integration"),

    # FRONTEND - PARTIAL
    ("FRONTEND - SETUP", "", "", ""),
    ("Vite + React 19 + TypeScript", "Frontend", "DONE", "Project scaffolded"),
    ("Axios API Client + Auth Interceptor", "Frontend", "DONE", "Base URL, token injection"),
    ("AuthContext (basic shell)", "Frontend", "PARTIAL", "Context created; no useAuth hook, no token refresh"),
    ("Header Component", "Frontend", "DONE", "Navigation header"),
    ("Route Definitions (skeleton)", "Frontend", "PARTIAL", "4 routes defined; BrowserRouter missing"),
    ("Tailwind CSS Config", "Frontend", "PARTIAL", "Installed but content paths empty"),

    # FRONTEND - MISSING
    ("FRONTEND - PAGES & MODULES", "", "", ""),
    ("Login Page", "Frontend", "MISSING", ""),
    ("Register Page", "Frontend", "MISSING", ""),
    ("Admin Dashboard", "Frontend", "MISSING", "Stats, charts, recent orders"),
    ("Products Module (list + forms)", "Frontend", "MISSING", "CRUD UI with tech sheet upload"),
    ("Brands Module (list + forms)", "Frontend", "MISSING", "CRUD UI"),
    ("Categories Module (list + forms)", "Frontend", "MISSING", "CRUD UI"),
    ("Vendors Module (list + forms)", "Frontend", "MISSING", "CRUD UI"),
    ("Zones Module (list + forms + pincodes)", "Frontend", "MISSING", "CRUD UI with pincode management"),
    ("Buyers Module (list + forms + projects)", "Frontend", "MISSING", "CRUD UI with project sub-module"),
    ("Dealers Module (list + forms)", "Frontend", "MISSING", "CRUD UI with approval workflow"),
    ("Orders Module (list + detail + create)", "Frontend", "MISSING", "Full order flow UI"),
    ("Inventory Module UI", "Frontend", "MISSING", "Stock levels, alerts"),
    ("Invoice Module UI", "Frontend", "MISSING", "View/download invoices"),
    ("Delivery Tracking UI", "Frontend", "MISSING", "Track order delivery status"),
    ("Payment Module UI", "Frontend", "MISSING", "Payment processing screens"),
    ("Reporting / Dashboard Charts", "Frontend", "MISSING", "Sales summary, top products, dealer analytics"),

    # FRONTEND - INFRA
    ("FRONTEND - INFRASTRUCTURE", "", "", ""),
    ("React Query Setup (QueryClientProvider)", "Frontend", "MISSING", "Installed but not configured"),
    ("API Service Layer (per module)", "Frontend", "MISSING", "No service methods for API calls"),
    ("Protected Routes / Route Guards", "Frontend", "MISSING", "No auth-based route protection"),
    ("Role-based UI (admin/dealer/buyer)", "Frontend", "MISSING", "Different dashboards per role"),
    ("Search & Filter Components", "Frontend", "MISSING", "Reusable search/filter bars"),
    ("Responsive Design / Mobile", "Frontend", "MISSING", "Mobile-friendly layout"),
]

row = 5
for item in data:
    name, area, status, notes = item
    # Section header
    if area == "" and status == "":
        ws1.merge_cells(f"A{row}:D{row}")
        cell = ws1.cell(row=row, column=1, value=name)
        cell.font = section_font
        cell.fill = section_fill
        cell.border = thin_border
        for c in range(2, 5):
            ws1.cell(row=row, column=c).fill = section_fill
            ws1.cell(row=row, column=c).border = thin_border
    else:
        ws1.cell(row=row, column=1, value=name).border = thin_border
        ws1.cell(row=row, column=2, value=area).border = thin_border
        status_cell = ws1.cell(row=row, column=3, value=status)
        status_cell.border = thin_border
        status_cell.alignment = Alignment(horizontal="center")
        ws1.cell(row=row, column=4, value=notes).border = thin_border

        if status == "DONE":
            status_cell.fill = done_fill
            status_cell.font = done_font
        elif status == "PARTIAL":
            status_cell.fill = partial_fill
            status_cell.font = partial_font
        elif status == "MISSING":
            status_cell.fill = missing_fill
            status_cell.font = missing_font
    row += 1

# Column widths
ws1.column_dimensions["A"].width = 48
ws1.column_dimensions["B"].width = 12
ws1.column_dimensions["C"].width = 12
ws1.column_dimensions["D"].width = 50

# ============================================================
# SHEET 2: GANTT CHART
# ============================================================
ws2 = wb.create_sheet("Gantt Chart")

# Project timeline: March 10 2026 to June 7 2026 (13 weeks)
project_start = date(2026, 3, 10)
num_weeks = 13

# Gantt tasks: (name, phase, start_week, duration_weeks, team, status)
# week 0 = Mar 10, week 1 = Mar 17, etc.
gantt_tasks = [
    # Phase 1: Foundation (Weeks 1-2)
    ("PHASE 1: FOUNDATION & SETUP", "", 0, 0, "", ""),
    ("Fix Tailwind + BrowserRouter + React Query setup", "Frontend", 0, 1, "Dev 1", "Pending"),
    ("Auth Pages (Login + Register)", "Frontend", 0, 1, "Dev 2", "Pending"),
    ("Protected Routes + useAuth hook + Token Refresh", "Frontend", 0, 1, "Dev 1", "Pending"),
    ("API Service Layer (all modules)", "Frontend", 1, 1, "Dev 1", "Pending"),
    ("Search & Filtering + Pagination (Backend)", "Backend", 0, 2, "Dev 3", "Pending"),
    ("File Upload Middleware (Multer/S3)", "Backend", 0, 1, "Dev 4", "Pending"),
    ("Inventory Management Backend", "Backend", 1, 2, "Dev 4", "Pending"),

    # Phase 2: Core CRUD Modules (Weeks 3-5)
    ("PHASE 2: CORE CRUD MODULES", "", 0, 0, "", ""),
    ("Products Module UI (list + create/edit + upload)", "Frontend", 2, 2, "Dev 1", "Pending"),
    ("Brands Module UI (list + create/edit)", "Frontend", 2, 1, "Dev 2", "Pending"),
    ("Categories Module UI (list + create/edit)", "Frontend", 3, 1, "Dev 2", "Pending"),
    ("Vendors Module UI (list + create/edit)", "Frontend", 3, 1, "Dev 5", "Pending"),
    ("Zones Module UI (list + create/edit + pincodes)", "Frontend", 4, 1, "Dev 5", "Pending"),
    ("Dealers Module UI (list + create/edit + approval)", "Frontend", 3, 2, "Dev 6", "Pending"),
    ("Buyers Module UI (list + create/edit + projects)", "Frontend", 3, 2, "Dev 3", "Pending"),
    ("Pricing Tiers / Discount Backend", "Backend", 2, 2, "Dev 4", "Pending"),
    ("Order Workflow State Machine", "Backend", 2, 1, "Dev 7", "Pending"),

    # Phase 3: Orders & Business Logic (Weeks 5-7)
    ("PHASE 3: ORDERS & BUSINESS LOGIC", "", 0, 0, "", ""),
    ("Orders Module UI (list + detail + create flow)", "Frontend", 5, 2, "Dev 1, Dev 2", "Pending"),
    ("Inventory Module UI (stock levels, alerts)", "Frontend", 5, 2, "Dev 5", "Pending"),
    ("Payment Integration Backend (Razorpay)", "Backend", 5, 2, "Dev 4, Dev 7", "Pending"),
    ("Invoice Generation Backend (PDF)", "Backend", 5, 2, "Dev 3", "Pending"),
    ("Delivery Tracking Backend (tracking #, logistics)", "Backend", 6, 2, "Dev 7", "Pending"),

    # Phase 4: Dashboard & Reporting (Weeks 7-9)
    ("PHASE 4: DASHBOARD & REPORTING", "", 0, 0, "", ""),
    ("Admin Dashboard (stats, charts, recent orders)", "Frontend", 7, 2, "Dev 1, Dev 2", "Pending"),
    ("Reporting APIs (sales, top products, dealer analytics)", "Backend", 7, 2, "Dev 3, Dev 4", "Pending"),
    ("Payment Module UI (payment screens)", "Frontend", 7, 1, "Dev 5", "Pending"),
    ("Invoice Module UI (view/download)", "Frontend", 7, 1, "Dev 6", "Pending"),
    ("Delivery Tracking UI", "Frontend", 8, 1, "Dev 6", "Pending"),
    ("Notifications Backend (Email/SMS)", "Backend", 8, 2, "Dev 7", "Pending"),

    # Phase 5: Polish & Role-based (Weeks 9-11)
    ("PHASE 5: ROLE-BASED UI & POLISH", "", 0, 0, "", ""),
    ("Role-based Dashboards (dealer, buyer, vendor views)", "Frontend", 9, 2, "Dev 1, Dev 6", "Pending"),
    ("Reporting Dashboard Charts (frontend)", "Frontend", 9, 2, "Dev 2, Dev 5", "Pending"),
    ("Search & Filter Components (frontend)", "Frontend", 9, 1, "Dev 3", "Pending"),
    ("Responsive Design / Mobile Optimization", "Frontend", 10, 2, "Dev 2, Dev 5", "Pending"),
    ("Notification UI (in-app + email prefs)", "Frontend", 10, 1, "Dev 6", "Pending"),

    # Phase 6: Testing & Launch (Weeks 11-13)
    ("PHASE 6: TESTING & LAUNCH", "", 0, 0, "", ""),
    ("Integration Testing (API + UI)", "Full Stack", 11, 1, "All Devs", "Pending"),
    ("Bug Fixes & Performance Optimization", "Full Stack", 11, 1, "All Devs", "Pending"),
    ("UAT (User Acceptance Testing)", "Full Stack", 12, 1, "All Devs", "Pending"),
    ("Production Deployment & Go-Live", "DevOps", 12, 1, "Dev 4, Dev 7", "Pending"),
]

# Colors for Gantt bars
phase_colors = {
    "PHASE 1": "4472C4",  # Blue
    "PHASE 2": "ED7D31",  # Orange
    "PHASE 3": "70AD47",  # Green
    "PHASE 4": "FFC000",  # Gold
    "PHASE 5": "5B9BD5",  # Light Blue
    "PHASE 6": "FF6B6B",  # Red
}

# Title
ws2.merge_cells("A1:F1")
ws2["A1"] = "MATERIAL KING - Gantt Chart (Mar 2026 - Jun 2026)"
ws2["A1"].font = Font(bold=True, size=16, color="2F5496")

ws2.merge_cells("A2:F2")
ws2["A2"] = "Team: 6-7 Developers  |  Duration: 13 Weeks  |  Start: 10 Mar 2026"
ws2["A2"].font = Font(size=10, color="666666")

# Header row
header_row = 4
headers = ["Task", "Area", "Team", "Start Date", "End Date", "Weeks"]
for col, val in enumerate(headers, 1):
    cell = ws2.cell(row=header_row, column=col, value=val)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center")
    cell.border = thin_border

# Week columns (start at col 7)
week_start_col = 7
for w in range(num_weeks):
    week_date = project_start + timedelta(weeks=w)
    col = week_start_col + w
    cell = ws2.cell(row=header_row, column=col, value=f"W{w+1}\n{week_date.strftime('%d %b')}")
    cell.font = Font(bold=True, size=8, color="FFFFFF")
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center", wrap_text=True)
    cell.border = thin_border
    ws2.column_dimensions[get_column_letter(col)].width = 8

# Data rows
row = 5
current_phase = ""
for task in gantt_tasks:
    name, area, start_week, duration, team, status = task

    # Phase header
    if area == "" and duration == 0:
        ws2.merge_cells(f"A{row}:{get_column_letter(week_start_col + num_weeks - 1)}{row}")
        cell = ws2.cell(row=row, column=1, value=name)
        cell.font = section_font
        cell.fill = section_fill
        cell.border = thin_border
        for c in range(2, week_start_col + num_weeks):
            ws2.cell(row=row, column=c).fill = section_fill
            ws2.cell(row=row, column=c).border = thin_border
        current_phase = name.split(":")[0].strip()
        row += 1
        continue

    # Task info
    start_date = project_start + timedelta(weeks=start_week)
    end_date = start_date + timedelta(weeks=duration) - timedelta(days=1)

    ws2.cell(row=row, column=1, value=name).border = thin_border
    ws2.cell(row=row, column=2, value=area).border = thin_border
    ws2.cell(row=row, column=3, value=team).border = thin_border

    date_cell = ws2.cell(row=row, column=4, value=start_date)
    date_cell.number_format = "DD MMM"
    date_cell.border = thin_border
    date_cell.alignment = Alignment(horizontal="center")

    end_cell = ws2.cell(row=row, column=5, value=end_date)
    end_cell.number_format = "DD MMM"
    end_cell.border = thin_border
    end_cell.alignment = Alignment(horizontal="center")

    ws2.cell(row=row, column=6, value=duration).border = thin_border
    ws2.cell(row=row, column=6).alignment = Alignment(horizontal="center")

    # Gantt bars
    bar_color = phase_colors.get(current_phase, "4472C4")
    bar_fill = PatternFill(start_color=bar_color, end_color=bar_color, fill_type="solid")
    empty_fill = PatternFill(start_color="F2F2F2", end_color="F2F2F2", fill_type="solid")

    for w in range(num_weeks):
        col = week_start_col + w
        cell = ws2.cell(row=row, column=col)
        cell.border = thin_border
        if start_week <= w < start_week + duration:
            cell.fill = bar_fill
            cell.value = ""
        else:
            cell.fill = empty_fill

    row += 1

# Column widths for Gantt
ws2.column_dimensions["A"].width = 48
ws2.column_dimensions["B"].width = 12
ws2.column_dimensions["C"].width = 16
ws2.column_dimensions["D"].width = 11
ws2.column_dimensions["E"].width = 11
ws2.column_dimensions["F"].width = 7

# ============================================================
# SHEET 3: SUMMARY STATS
# ============================================================
ws3 = wb.create_sheet("Summary")

ws3.merge_cells("A1:C1")
ws3["A1"] = "PROJECT SUMMARY"
ws3["A1"].font = Font(bold=True, size=14, color="2F5496")

stats = [
    ("", "", ""),
    ("Category", "Count", ""),
    ("Backend Modules Completed", "13", "Auth, Products, Brands, Categories, Vendors, Zones, Buyers, Dealers, Orders, Schema, Seed, Validation, RBAC"),
    ("Backend Features Pending", "8", "Inventory, Pricing Tiers, Order Workflow, File Upload, Payments, Invoices, Delivery Tracking, Reporting, Search, Notifications"),
    ("Frontend Completed", "4", "Vite setup, Axios client, AuthContext shell, Header"),
    ("Frontend Pending", "22", "All pages, modules, dashboard, role-based UI"),
    ("", "", ""),
    ("Overall Completion", "~25%", "Backend CRUD done, everything else pending"),
    ("", "", ""),
    ("Phase", "Weeks", "Focus"),
    ("Phase 1: Foundation", "Weeks 1-2", "Auth pages, routing, API service, file upload, search/filter backend"),
    ("Phase 2: Core CRUD", "Weeks 3-5", "All entity CRUD UIs, pricing tiers, order workflow"),
    ("Phase 3: Orders & Business", "Weeks 5-7", "Orders UI, inventory UI, payments, invoices, delivery"),
    ("Phase 4: Dashboard & Reporting", "Weeks 7-9", "Admin dashboard, reporting APIs, payment/invoice UI"),
    ("Phase 5: Polish & Roles", "Weeks 9-11", "Role-based views, responsive design, notifications"),
    ("Phase 6: Testing & Launch", "Weeks 11-13", "Integration testing, UAT, deployment"),
]

for i, (a, b, c) in enumerate(stats, 2):
    ws3.cell(row=i, column=1, value=a).border = thin_border if a else Border()
    ws3.cell(row=i, column=2, value=b).border = thin_border if a else Border()
    ws3.cell(row=i, column=3, value=c).border = thin_border if a else Border()
    if a in ("Category", "Phase"):
        for col in range(1, 4):
            ws3.cell(row=i, column=col).font = header_font
            ws3.cell(row=i, column=col).fill = header_fill
    if a == "Overall Completion":
        ws3.cell(row=i, column=1).font = Font(bold=True, size=12, color="9C0006")
        ws3.cell(row=i, column=2).font = Font(bold=True, size=12, color="9C0006")

ws3.column_dimensions["A"].width = 35
ws3.column_dimensions["B"].width = 15
ws3.column_dimensions["C"].width = 70

# Save
output_path = "/home/user/materialking/MaterialKing_Gantt_Chart.xlsx"
wb.save(output_path)
print(f"Gantt chart saved to: {output_path}")
