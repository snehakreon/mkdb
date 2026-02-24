# Material King Admin - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Extract Project

```bash
# Extract the archive
tar -xzf material-king-admin-react-project.tar.gz
cd material-king-admin
```

### Step 2: Install Dependencies

```bash
# Install packages (takes ~2 minutes)
npm install
```

### Step 3: Run Development Server

```bash
# Start the admin panel
npm run dev
```

**Open:** http://localhost:3001

---

## ✅ What You Get

### Live Preview (In Chat)
- ✓ Interactive admin panel running right here
- ✓ All 15 modules working
- ✓ Mock data pre-loaded
- ✓ Material King branding applied

### Downloadable Project Files
- ✓ Complete React 18 + TypeScript setup
- ✓ Vite bundler configured
- ✓ Tailwind CSS with brand colors
- ✓ Full project structure
- ✓ Ready to customize & extend

---

## 📦 Project Includes

**Core Files:**
- `package.json` - All dependencies
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Bundler setup
- `tailwind.config.js` - Brand colors (#ED1C24, #4D4D4D)
- `README.md` - Complete documentation

**Folder Structure:**
```
src/
├── components/  (UI components)
├── modules/     (Dashboard, Vendors, Orders, etc.)
├── services/    (API integration)
├── types/       (TypeScript types)
├── utils/       (Helper functions)
└── store/       (State management)
```

---

## 🎯 Features

### All 15 Modules Built:
1. ✅ Dashboard (stats, charts)
2. ✅ Zones & Pincodes
3. ✅ Vendors (CRUD, verification)
4. ✅ Categories
5. ✅ Brands
6. ✅ Products (SKUs)
7. ✅ Pricing Approvals
8. ✅ Inventory
9. ✅ Dealers
10. ✅ Credit Approvals
11. ✅ Orders
12. ✅ Pending Approvals
13. ✅ Dispatches
14. ✅ Disputes
15. ✅ Payments & Settlements

### Technology Stack:
- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS 3.4
- **Build Tool:** Vite 5
- **State:** Zustand
- **API:** Axios
- **Icons:** Lucide React

---

## ⚙️ Configuration

### Toggle Mock Data vs Real API

Edit `src/config/app.config.ts`:

```typescript
export const APP_CONFIG = {
  USE_REAL_API: false,  // Change to true when backend is ready
  API_BASE_URL: 'http://localhost:3000/api',
};
```

**false** = Works standalone with mock data (current default)  
**true** = Connects to your NestJS backend

---

## 🎨 Material King Branding

### Colors (Tailwind Classes):
```css
bg-mk-red          /* #ED1C24 - Primary red */
text-mk-gray       /* #4D4D4D - Dark gray */
hover:bg-mk-red-600  /* Hover state */
```

### Typography:
```css
font-century-gothic  /* Century Gothic font */
```

All brand guidelines from your manual are pre-configured in `tailwind.config.js`!

---

## 📝 Next Steps

### 1. Customize Mock Data
Edit `src/services/*.service.ts` to change mock data

### 2. Connect to Backend
```typescript
// src/config/app.config.ts
USE_REAL_API: true
```

### 3. Add New Modules
Follow pattern in `src/modules/` folder

### 4. Deploy
```bash
npm run build  # Creates production build
```

---

## 🔌 Backend Integration

### Expected NestJS Endpoints:

```
GET    /api/vendors
POST   /api/vendors
PUT    /api/vendors/:id
DELETE /api/vendors/:id

GET    /api/orders
POST   /api/orders
...
```

Services automatically handle mock/real API switching!

---

## 🆘 Troubleshooting

### Port 3001 already in use?
```bash
npx kill-port 3001
# or
npm run dev -- --port 3002
```

### Dependencies not installing?
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors?
```bash
npm run type-check
```

---

## 📖 Documentation

See `README.md` in project folder for:
- Complete feature list
- API integration guide
- Component documentation
- Deployment instructions
- Customization guide

---

## ✨ What's Included

### ✅ Live Preview
- Interactive admin panel in this chat
- All modules functional
- Instant feedback

### ✅ Project Files
- Production-ready React app
- TypeScript configured
- Tailwind + brand colors
- All 15 modules built
- Mock + Real API ready

### ✅ Documentation
- README.md with full guide
- Inline code comments
- Type definitions
- Configuration examples

---

## 🎉 You're Ready!

**The admin panel is now:**
1. ✅ Live preview working (above)
2. ✅ Full React project downloadable
3. ✅ Mock data pre-loaded
4. ✅ Ready to connect to NestJS backend
5. ✅ Material King branded
6. ✅ Production-ready

---

**Questions?** Check `README.md` in the project folder for detailed documentation.

**Happy building! 🚀**
