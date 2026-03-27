# MaterialKing - Phase Planning Questionnaire
**Date:** March 27, 2026 | **Project Deadline:** April 30, 2026 | **Weeks Remaining:** ~5

---

## PHASE 2: Core Modules (Mar 24 - Apr 6) — IN PROGRESS

### Payment Integration (Razorpay)

1. **Do you have a Razorpay account with API keys (key_id + key_secret)?**
   - [ ] Yes, production keys ready
   - [ ] Yes, but only test/sandbox keys
   - [ ] No, not yet created

2. **Which payment methods do you need at launch?**
   - [ ] UPI only
   - [ ] UPI + Netbanking + Cards
   - [ ] UPI + Netbanking + Cards + Wallet
   - [ ] Other: _______________

3. **Do you need partial payments or split payments across vendors?**
   - [ ] No, full payment only
   - [ ] Yes, partial payments (e.g., 50% advance)
   - [ ] Yes, split payments to vendor accounts (Razorpay Route)

4. **What should happen if payment fails midway?**
   - [ ] Order stays as "pending_payment" for retry
   - [ ] Auto-cancel after X hours (specify: ___)
   - [ ] Send reminder notification and hold order

---

### Invoice Generation (PDF)

5. **Do you have a specific invoice format/template?**
   - [ ] Yes (please share sample)
   - [ ] No, use a standard GST-compliant format
   - [ ] Need to discuss with CA/accountant first

6. **What details must appear on the invoice?**
   - [ ] Company logo + address
   - [ ] GSTIN of both buyer and seller
   - [ ] HSN codes for each line item
   - [ ] GST breakup (CGST + SGST / IGST)
   - [ ] E-way bill number
   - [ ] All of the above

7. **Should invoices be auto-generated or manually triggered?**
   - [ ] Auto-generate when order status = "confirmed"
   - [ ] Admin clicks "Generate Invoice" manually
   - [ ] Auto-generate on dispatch/shipping

8. **Do you need credit note / return invoice support at launch?**
   - [ ] Yes, essential
   - [ ] No, can add later
   - [ ] Unsure

---

### Pricing Tiers

9. **How should pricing tiers work?**
   - [ ] Volume-based (e.g., 1-100 pcs = Rs.X, 101-500 = Rs.Y)
   - [ ] Buyer-type based (Builder gets X%, Retailer gets Y%)
   - [ ] Zone-based pricing (Mumbai = Rs.X, Delhi = Rs.Y)
   - [ ] Combination of above: _______________

10. **Should dealers see different prices than buyers?**
    - [ ] Yes, dealers get a separate price list
    - [ ] No, same pricing for all
    - [ ] Dealers get a flat % discount on buyer price

---

## PHASE 3: Business Logic & Dashboard (Apr 7 - 20)

### Notifications (Email / SMS)

11. **Which notification provider do you want to use?**
    - **Email:** [ ] AWS SES  [ ] SendGrid  [ ] SMTP (Gmail/custom)  [ ] Other: ___
    - **SMS:** [ ] MSG91  [ ] Twilio  [ ] Textlocal  [ ] Not needed at launch

12. **Which events should trigger notifications?**
    - [ ] New order placed (to admin + vendor)
    - [ ] Order status change (to buyer)
    - [ ] Payment confirmation
    - [ ] Low stock alert (to admin)
    - [ ] New user registration / OTP verification
    - [ ] Invoice ready for download
    - [ ] Other: _______________

13. **Do you need WhatsApp notifications?**
    - [ ] Yes, essential (via WhatsApp Business API)
    - [ ] Nice to have, not critical
    - [ ] No

---

### Reporting & Analytics

14. **What reports does the admin need on Day 1?**
    - [ ] Sales summary (daily / weekly / monthly)
    - [ ] Top-selling products
    - [ ] Revenue by zone
    - [ ] Vendor-wise order volume
    - [ ] Buyer purchase history
    - [ ] Inventory movement / stock aging
    - [ ] All of the above

15. **Do you need downloadable reports (CSV/Excel)?**
    - [ ] Yes, all reports should be exportable
    - [ ] Only key reports (sales, inventory)
    - [ ] Not needed at launch

---

### Delivery Tracking

16. **How is delivery handled?**
    - [ ] Own fleet (need in-app tracking)
    - [ ] Third-party logistics (Delhivery, Shiprocket, etc.)
    - [ ] Vendor ships directly to buyer
    - [ ] Mix of above: _______________

17. **Do you need real-time GPS tracking at launch?**
    - [ ] Yes
    - [ ] No, just status updates (dispatched / in-transit / delivered)
    - [ ] Can add later

---

### Role-Based Dashboards

18. **Which user roles need separate dashboards?**
    - [ ] Super Admin (sees everything)
    - [ ] Admin (limited admin view)
    - [ ] Vendor (own products, orders, payments)
    - [ ] Dealer (own orders, commission tracking)
    - [ ] Buyer (order history, invoices)
    - [ ] Delivery personnel

19. **Should vendors be able to manage their own products directly?**
    - [ ] Yes, vendor self-service portal
    - [ ] No, admin manages all products
    - [ ] Vendor submits, admin approves

---

## PHASE 4: Polish & Launch (Apr 21 - 30)

### General Launch Readiness

20. **What is the go-live plan?**
    - [ ] Soft launch (invite-only, limited buyers)
    - [ ] Full public launch
    - [ ] Internal use only initially

21. **Where will this be hosted?**
    - [ ] AWS (EC2 / ECS)
    - [ ] DigitalOcean
    - [ ] VPS (Hostinger, Contabo, etc.)
    - [ ] Already decided: _______________

22. **Do you need a custom domain + SSL setup?**
    - [ ] Yes, domain: _______________
    - [ ] Already configured
    - [ ] Need help purchasing

23. **Mobile responsiveness — what's the priority?**
    - [ ] Must be fully mobile-responsive at launch
    - [ ] Desktop-first, mobile can follow
    - [ ] Need a separate mobile app (React Native / Flutter)

24. **Any compliance or legal requirements?**
    - [ ] GST compliance (e-invoicing for turnover > 5 Cr)
    - [ ] Data privacy / terms of service pages
    - [ ] HSN/SAC code validation
    - [ ] None that I know of

---

## Quick Priority Check

**Rank these by importance (1 = most critical for launch):**

| Feature | Priority (1-5) |
|---|---|
| Payment (Razorpay) | ___ |
| Invoice PDF | ___ |
| Email/SMS notifications | ___ |
| Delivery tracking | ___ |
| Reporting/Analytics | ___ |
| Role-based dashboards | ___ |
| Mobile responsiveness | ___ |
| Pricing tiers | ___ |

---

> **Instructions:** Fill out what you can, mark items as "unsure" if needed.
> This helps us prioritize the remaining 5 weeks and avoid surprises close to deadline.
