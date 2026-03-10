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
ws1["A2"] = f"Generated: {date.today().strftime('%d %b %Y')}  |  Team: 6-7 devs  |  Start: 21 Jan 2026  |  Deadline: 30 Apr 2026  |  7.5 weeks remaining"
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
    # BACKEND - COMPLETED (Jan 21 - Mar 10)
    ("BACKEND - COMPLETED (Jan 21 - Mar 10, ~7 weeks)", "", "", ""),
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

    # FRONTEND - PARTIAL
    ("FRONTEND - COMPLETED / PARTIAL", "", "", ""),
    ("Vite + React 19 + TypeScript", "Frontend", "DONE", "Project scaffolded"),
    ("Axios API Client + Auth Interceptor", "Frontend", "DONE", "Base URL, token injection"),
    ("AuthContext (basic shell)", "Frontend", "PARTIAL", "Context created; no useAuth hook, no token refresh"),
    ("Header Component", "Frontend", "DONE", "Navigation header"),
    ("Route Definitions (skeleton)", "Frontend", "PARTIAL", "4 routes defined; BrowserRouter missing"),
    ("Tailwind CSS Config", "Frontend", "PARTIAL", "Installed but content paths empty"),

    # BACKEND - PENDING
    ("BACKEND - PENDING (must complete by Apr 30)", "", "", ""),
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

    # FRONTEND - MISSING
    ("FRONTEND - PAGES & MODULES (must complete by Apr 30)", "", "", ""),
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
    ("FRONTEND - INFRASTRUCTURE (must complete by Apr 30)", "", "", ""),
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
ws1.column_dimensions["A"].width = 55
ws1.column_dimensions["B"].width = 12
ws1.column_dimensions["C"].width = 12
ws1.column_dimensions["D"].width = 55

# ============================================================
# SHEET 2: GANTT CHART
# ============================================================
ws2 = wb.create_sheet("Gantt Chart")

# Full project: Jan 21 to Apr 30 = 14.3 weeks => 15 week columns
project_start = date(2026, 1, 19)  # Monday of week containing Jan 21
today_marker = date(2026, 3, 10)
deadline = date(2026, 4, 30)
num_weeks = 15  # Jan 19 to Apr 27 (15 weeks)

# Gantt tasks: (name, area, start_week, duration_weeks, team, status)
# week 0 = Jan 19, week 1 = Jan 26, week 2 = Feb 2, ...
# week 7 = Mar 9 (THIS WEEK), week 14 = Apr 20
gantt_tasks = [
    # COMPLETED PHASE (Weeks 0-7, Jan 21 - Mar 10)
    ("COMPLETED: Backend CRUD & Setup (Jan 21 - Mar 10)", "", 0, 0, "", "done"),
    ("Project Setup (Vite, Express, DB, TypeScript)", "Full Stack", 0, 2, "All Devs", "done"),
    ("Auth Module (JWT, register, login, roles)", "Backend", 1, 2, "Dev 3, Dev 4", "done"),
    ("Products + Brands + Categories CRUD APIs", "Backend", 2, 2, "Dev 1, Dev 2", "done"),
    ("Vendors + Zones CRUD APIs", "Backend", 3, 2, "Dev 3, Dev 5", "done"),
    ("Buyers + Dealers + Orders CRUD APIs", "Backend", 4, 3, "Dev 4, Dev 6, Dev 7", "done"),
    ("DB Schema (15 tables) + Seed + Middleware", "Backend", 5, 2, "Dev 3", "done"),
    ("Frontend Scaffolding (Axios, AuthContext, Header)", "Frontend", 5, 2, "Dev 1", "done"),

    # ── TODAY LINE (Week 7 = Mar 9) ──

    # PHASE 1: Foundation & Quick Wins (Week 8-9, Mar 10-23) — 2 weeks
    ("PHASE 1: FOUNDATION (Mar 10 - Mar 23) ⚡ START NOW", "", 0, 0, "", ""),
    ("Fix Tailwind + BrowserRouter + React Query setup", "Frontend", 7, 1, "Dev 1", "pending"),
    ("Auth Pages (Login + Register + Token Refresh)", "Frontend", 7, 1, "Dev 2", "pending"),
    ("Protected Routes + useAuth hook", "Frontend", 7, 1, "Dev 1", "pending"),
    ("API Service Layer (all modules)", "Frontend", 8, 1, "Dev 1, Dev 2", "pending"),
    ("Search & Filtering + Pagination (all backends)", "Backend", 7, 2, "Dev 3", "pending"),
    ("File Upload Middleware (Multer/S3)", "Backend", 7, 1, "Dev 4", "pending"),
    ("Order Workflow State Machine", "Backend", 7, 1, "Dev 7", "pending"),
    ("Inventory Management Backend", "Backend", 8, 1, "Dev 4", "pending"),

    # PHASE 2: Core CRUD Modules (Week 9-11, Mar 24 - Apr 6) — 2 weeks
    ("PHASE 2: CORE CRUD MODULES (Mar 24 - Apr 6)", "", 0, 0, "", ""),
    ("Products Module UI (list + forms + file upload)", "Frontend", 9, 2, "Dev 1", "pending"),
    ("Brands + Categories Module UI", "Frontend", 9, 1, "Dev 2", "pending"),
    ("Vendors Module UI", "Frontend", 9, 1, "Dev 5", "pending"),
    ("Zones Module UI (with pincodes)", "Frontend", 10, 1, "Dev 5", "pending"),
    ("Dealers Module UI (with approval workflow)", "Frontend", 9, 2, "Dev 6", "pending"),
    ("Buyers Module UI (with projects)", "Frontend", 9, 2, "Dev 2", "pending"),
    ("Pricing Tiers / Discount Backend", "Backend", 9, 1, "Dev 4", "pending"),
    ("Payment Integration Backend (Razorpay)", "Backend", 9, 2, "Dev 7", "pending"),
    ("Invoice Generation Backend (PDF)", "Backend", 10, 1, "Dev 3", "pending"),

    # PHASE 3: Orders, Business Logic & Dashboard (Week 11-13, Apr 7-20) — 2 weeks
    ("PHASE 3: ORDERS & DASHBOARD (Apr 7 - Apr 20)", "", 0, 0, "", ""),
    ("Orders Module UI (list + detail + create flow)", "Frontend", 11, 2, "Dev 1, Dev 2", "pending"),
    ("Inventory Module UI (stock levels, alerts)", "Frontend", 11, 1, "Dev 5", "pending"),
    ("Payment Module UI", "Frontend", 11, 1, "Dev 6", "pending"),
    ("Invoice Module UI (view/download)", "Frontend", 12, 1, "Dev 6", "pending"),
    ("Admin Dashboard (stats, charts, recent orders)", "Frontend", 11, 2, "Dev 2, Dev 5", "pending"),
    ("Reporting APIs (sales, top products, analytics)", "Backend", 11, 1, "Dev 3", "pending"),
    ("Delivery Tracking Backend + UI", "Full Stack", 11, 2, "Dev 7", "pending"),
    ("Notifications Backend (Email/SMS)", "Backend", 12, 1, "Dev 4", "pending"),

    # PHASE 4: Role-based, Polish & Launch (Week 13-15, Apr 21-30) — 1.5 weeks
    ("PHASE 4: POLISH & LAUNCH (Apr 21 - Apr 30) 🚀 DEADLINE", "", 0, 0, "", ""),
    ("Role-based Dashboards (dealer, buyer, vendor)", "Frontend", 13, 1, "Dev 1, Dev 6", "pending"),
    ("Reporting Dashboard Charts (frontend)", "Frontend", 13, 1, "Dev 2, Dev 5", "pending"),
    ("Search & Filter Components + Responsive Design", "Frontend", 13, 1, "Dev 3", "pending"),
    ("Integration Testing (API + UI)", "Full Stack", 13, 1, "All Devs", "pending"),
    ("Bug Fixes & Performance Optimization", "Full Stack", 14, 1, "All Devs", "pending"),
    ("UAT + Production Deployment", "Full Stack", 14, 1, "All Devs", "pending"),
]

# Colors
completed_color = "A9D18E"   # Green for done
phase_colors = {
    "PHASE 1": "4472C4",     # Blue
    "PHASE 2": "ED7D31",     # Orange
    "PHASE 3": "70AD47",     # Green
    "PHASE 4": "FF6B6B",     # Red/urgent
    "COMPLETED": completed_color,
}

# Title
ws2.merge_cells("A1:F1")
ws2["A1"] = "MATERIAL KING - Gantt Chart (Jan 21, 2026 - Apr 30, 2026)"
ws2["A1"].font = Font(bold=True, size=16, color="2F5496")

ws2.merge_cells("A2:F2")
ws2["A2"] = "Team: 6-7 Developers  |  Total: 14 Weeks  |  Elapsed: 7 weeks  |  REMAINING: 7.5 weeks  |  Deadline: 30 Apr 2026"
ws2["A2"].font = Font(size=10, color="CC0000")
ws2["A2"].font = Font(bold=True, size=10, color="CC0000")

# Header row
header_row = 4
headers = ["Task", "Area", "Team", "Start Date", "End Date", "Wks"]
for col, val in enumerate(headers, 1):
    cell = ws2.cell(row=header_row, column=col, value=val)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center")
    cell.border = thin_border

# Week columns (start at col 7)
week_start_col = 7
today_week_index = 7  # week 7 = Mar 9 (this week)
today_col_fill = PatternFill(start_color="FFD700", end_color="FFD700", fill_type="solid")

for w in range(num_weeks):
    week_date = project_start + timedelta(weeks=w)
    col = week_start_col + w
    label = f"W{w+1}\n{week_date.strftime('%d %b')}"
    cell = ws2.cell(row=header_row, column=col, value=label)
    cell.font = Font(bold=True, size=8, color="FFFFFF")
    cell.alignment = Alignment(horizontal="center", wrap_text=True)
    cell.border = thin_border
    ws2.column_dimensions[get_column_letter(col)].width = 8

    if w == today_week_index:
        cell.fill = PatternFill(start_color="CC0000", end_color="CC0000", fill_type="solid")
    else:
        cell.fill = header_fill

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
        # Determine phase key
        if "COMPLETED" in name:
            current_phase = "COMPLETED"
        elif "PHASE 1" in name:
            current_phase = "PHASE 1"
        elif "PHASE 2" in name:
            current_phase = "PHASE 2"
        elif "PHASE 3" in name:
            current_phase = "PHASE 3"
        elif "PHASE 4" in name:
            current_phase = "PHASE 4"
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

    # Mark done tasks differently
    if status == "done":
        name_cell = ws2.cell(row=row, column=1)
        name_cell.font = done_font

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
            if status == "done":
                cell.value = "✓"
                cell.font = Font(color="FFFFFF", bold=True, size=9)
                cell.alignment = Alignment(horizontal="center")
        else:
            cell.fill = empty_fill

    # Today marker column highlight
    today_cell = ws2.cell(row=row, column=week_start_col + today_week_index)
    if not (start_week <= today_week_index < start_week + duration):
        today_cell.fill = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid")

    row += 1

# Add TODAY marker row
ws2.merge_cells(f"A{row}:F{row}")
ws2.cell(row=row, column=1, value="▲ TODAY (Mar 10, 2026) — 7.5 weeks to deadline").font = Font(bold=True, size=11, color="CC0000")
ws2.cell(row=row, column=1).fill = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid")
for c in range(2, week_start_col + num_weeks):
    ws2.cell(row=row, column=c).fill = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid")
today_marker_cell = ws2.cell(row=row, column=week_start_col + today_week_index)
today_marker_cell.value = "▲ NOW"
today_marker_cell.font = Font(bold=True, size=9, color="CC0000")
today_marker_cell.fill = PatternFill(start_color="FFD700", end_color="FFD700", fill_type="solid")
today_marker_cell.alignment = Alignment(horizontal="center")

# Add legend
row += 2
ws2.cell(row=row, column=1, value="LEGEND:").font = Font(bold=True, size=10)
row += 1
legends = [
    (completed_color, "Completed (Jan 21 - Mar 10)"),
    ("4472C4", "Phase 1: Foundation (Mar 10-23)"),
    ("ED7D31", "Phase 2: Core CRUD (Mar 24 - Apr 6)"),
    ("70AD47", "Phase 3: Orders & Dashboard (Apr 7-20)"),
    ("FF6B6B", "Phase 4: Polish & Launch (Apr 21-30)"),
    ("CC0000", "TODAY marker (Mar 10)"),
]
for color, label in legends:
    ws2.cell(row=row, column=1).fill = PatternFill(start_color=color, end_color=color, fill_type="solid")
    ws2.cell(row=row, column=2, value=label).font = Font(size=9)
    ws2.merge_cells(f"B{row}:D{row}")
    row += 1

# Column widths for Gantt
ws2.column_dimensions["A"].width = 52
ws2.column_dimensions["B"].width = 12
ws2.column_dimensions["C"].width = 16
ws2.column_dimensions["D"].width = 11
ws2.column_dimensions["E"].width = 11
ws2.column_dimensions["F"].width = 5

# ============================================================
# SHEET 3: SUMMARY STATS
# ============================================================
ws3 = wb.create_sheet("Summary")

ws3.merge_cells("A1:C1")
ws3["A1"] = "PROJECT SUMMARY"
ws3["A1"].font = Font(bold=True, size=14, color="2F5496")

ws3.merge_cells("A2:C2")
ws3["A2"] = "Start: 21 Jan 2026  |  Today: 10 Mar 2026  |  Deadline: 30 Apr 2026"
ws3["A2"].font = Font(bold=True, size=10, color="CC0000")

stats = [
    ("", "", ""),
    ("TIMELINE", "", ""),
    ("Project Start", "21 Jan 2026", ""),
    ("Today", "10 Mar 2026", "7 weeks elapsed"),
    ("Hard Deadline", "30 Apr 2026", "7.5 weeks remaining"),
    ("Total Duration", "14 weeks", "No buffer for delays"),
    ("", "", ""),
    ("COMPLETION STATUS", "Count", "Details"),
    ("Backend CRUD Completed", "13 modules", "Auth, Products, Brands, Categories, Vendors, Zones, Buyers, Dealers, Orders, Schema, Seed, Validation, RBAC"),
    ("Backend Features Pending", "10 features", "Inventory, Pricing, Workflow, Upload, Payments, Invoices, Delivery, Reporting, Search/Pagination, Notifications"),
    ("Frontend Completed", "4 items", "Vite setup, Axios client, AuthContext shell, Header"),
    ("Frontend Pending", "22+ items", "All pages, modules, dashboard, role-based UI, integration"),
    ("", "", ""),
    ("Overall Completion", "~25%", "Backend CRUD done. Frontend barely started. 75% work remains in 50% time."),
    ("", "", ""),
    ("RISK ASSESSMENT", "", ""),
    ("Schedule Risk", "HIGH", "75% work in 7.5 weeks with 6-7 devs. Very tight."),
    ("Critical Path", "Orders + Payments + Invoices", "These depend on each other — must start early"),
    ("Parallel Tracks Needed", "YES", "Backend features + Frontend CRUD must run simultaneously"),
    ("Recommended Action", "AGGRESSIVE SPRINTS", "2-week sprints, daily standups, no scope creep"),
    ("", "", ""),
    ("PHASE PLAN (REMAINING)", "Duration", "Focus"),
    ("Phase 1: Foundation", "Mar 10-23 (2 wks)", "Auth UI, routing, API layer, search/filter backend, file upload, workflow"),
    ("Phase 2: Core CRUD", "Mar 24 - Apr 6 (2 wks)", "ALL entity CRUD UIs, pricing, payments backend, invoices backend"),
    ("Phase 3: Orders & Dashboard", "Apr 7-20 (2 wks)", "Orders UI, inventory UI, payment/invoice UI, dashboard, reporting, delivery, notifications"),
    ("Phase 4: Polish & Launch", "Apr 21-30 (1.5 wks)", "Role-based UI, responsive design, testing, UAT, deployment"),
    ("", "", ""),
    ("TEAM ALLOCATION (suggested)", "", ""),
    ("Dev 1 (Frontend Lead)", "", "Foundation setup → Products UI → Orders UI → Role-based dashboards"),
    ("Dev 2 (Frontend)", "", "Auth pages → Brands/Categories/Buyers UI → Orders UI → Dashboard charts"),
    ("Dev 3 (Backend + Frontend)", "", "Search/Pagination → Invoice backend → Reporting APIs → Filter components"),
    ("Dev 4 (Backend Lead)", "", "File upload → Inventory backend → Pricing tiers → Notifications"),
    ("Dev 5 (Frontend)", "", "Vendors/Zones UI → Inventory UI → Dashboard → Responsive design"),
    ("Dev 6 (Frontend)", "", "Dealers UI → Payment UI → Invoice UI → Role-based views"),
    ("Dev 7 (Backend)", "", "Order workflow → Payment integration → Delivery tracking → Testing"),
]

for i, (a, b, c) in enumerate(stats, 4):
    ws3.cell(row=i, column=1, value=a).border = thin_border if a else Border()
    ws3.cell(row=i, column=2, value=b).border = thin_border if a else Border()
    ws3.cell(row=i, column=3, value=c).border = thin_border if a else Border()
    if a in ("COMPLETION STATUS", "PHASE PLAN (REMAINING)", "TEAM ALLOCATION (suggested)", "TIMELINE", "RISK ASSESSMENT"):
        for col in range(1, 4):
            ws3.cell(row=i, column=col).font = header_font
            ws3.cell(row=i, column=col).fill = header_fill
    if a == "Overall Completion":
        ws3.cell(row=i, column=1).font = Font(bold=True, size=12, color="9C0006")
        ws3.cell(row=i, column=2).font = Font(bold=True, size=12, color="9C0006")
        ws3.cell(row=i, column=3).font = Font(bold=True, size=11, color="9C0006")
    if "HIGH" in str(b):
        ws3.cell(row=i, column=2).font = Font(bold=True, color="CC0000")
        ws3.cell(row=i, column=2).fill = missing_fill

ws3.column_dimensions["A"].width = 38
ws3.column_dimensions["B"].width = 32
ws3.column_dimensions["C"].width = 75

# Save
output_path = "/home/user/materialking/MaterialKing_Gantt_Chart.xlsx"
wb.save(output_path)
print(f"Gantt chart saved to: {output_path}")
