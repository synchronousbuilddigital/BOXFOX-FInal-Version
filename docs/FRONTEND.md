# Frontend Documentation - BoxFox Store 🎨

This document provides a detailed overview of the frontend architecture, pages, and components of the BoxFox Store.

## 🏗️ Architecture Overview

The frontend is built using **Next.js 16** with the **App Router**. It leverages **Tailwind CSS 4** for styling and **Three.js** for 3D visualization.

### State Management
- **AuthContext**: Manages user session, login state, and brand vault sync.
- **CartContext**: Handles shopping cart operations, persistent storage, and pricing calculations.
- **ToastContext**: Provides global notification system.

---

## 📄 Page Breakdown

### User-Facing Pages

| Page Path | Purpose | Key Features |
| :--- | :--- | :--- |
| `/` | **Home Page** | Dynamic hero section, featured products, AI showcase. |
| `/shop` | **Shop / Catalog** | Grid view of products with category filters. |
| `/products/[id]` | **Product Details** | Detailed specifications, variant selection, "Customize" CTA. |
| `/customize` | **The Design Lab** | 3D box customizer, AI pattern generator, brand vault integration. |
| `/cart` | **Shopping Cart** | Item management, shipping estimation, coupon application. |
| `/checkout` | **Checkout** | Secure payment integration (Razorpay/Stripe), address management. |
| `/account` | **User Dashboard** | Profile management, Order history, **Brand Vault** access. |
| `/b2b` | **B2B Portal** | Bulk order inquiries and wholesale information. |
| `/login` / `/signup` | **Authentication** | Secure user onboarding with OTP support. |

### Admin Dashboard (`/admin`)

The admin portal is a restricted area for store managers and fulfillment staff.

| Page Path | Purpose |
| :--- | :--- |
| `/admin` | **Dashboard Overview** | Sales charts, recent orders, and quick stats. |
| `/admin/products` | **Product Manager** | CRUD for products, bulk upload via Excel, inventory tracking. |
| `/admin/orders` | **Order Manager** | Status updates, invoice generation, fulfillment tracking. |
| `/admin/customers` | **Customer CRM** | View user details, order history, and account status. |
| `/admin/coupons` | **Marketing** | Create and manage discount codes. |
| `/admin/lab-config` | **Lab Settings** | Manage material rates, GSM options, and pricing formulas. |
| `/admin/analytics` | **Deep Insights** | Detailed reports on traffic and sales trends. |

---

## 🧩 Key Components

### 1. `Navbar` & `Footer`
- Responsive navigation with cart count and user profile status.
- Context-aware links (Admin vs User).

### 2. `3D Box Previewer` (in `/customize`)
- Uses `@react-three/fiber` to render 3D box geometries.
- Supports dynamic resizing based on user input.
- Maps uploaded textures and AI-generated patterns to specific box faces.

### 3. `AI Forge` (Powered by NEURAL_V2.5)
- **Ignite_Forge Engine**: The main generation interface where users "ignite" their design ideas.
- **Neural_Maps**: Handles the complex projection of AI textures onto 3D geometries.
- **Active Asset Pool (0/3)**: A dedicated management system for up to three concurrent high-resolution assets.
- **Mix & Match Enabled**: Allows users to blend multiple AI textures or uploaded images onto different box faces seamlessly.
- **Smart Prompt Builder**: 
  - Supports industry-standard styling chips.
  - Categories include: *Luxury Premium*, *Eco & Sustainable*, *Bold & Playful*, *Minimal & Clean*, *Festive & Celebratory*, *Professional Corporate*, *Rustic Artisan*, *Modern High-End*, *Vintage Classic*, and *Ultra Sleek*.
- **Brand Text on Box**: Dynamic text overlay with live preview and positioning controls.

### 4. `AIChatBot`
- An integrated AI assistant for real-time customer support.
- Leverages local API routes to provide intelligent answers about products and customization.
- Seamlessly transitions from chat to design lab.

### 5. `AuthModal`
- A unified modal for quick login/signup without leaving the current page.

---

## 🎨 Styling & Animations

- **Tailwind CSS 4**: Utilizes modern CSS variables and utility classes.
- **Framer Motion**: Used for page transitions, modal animations, and interactive hover effects.
- **GSAP**: Employed for complex timeline animations, specifically the "rolling price" effect in the customization lab.

---

## 🛠️ Development Guidelines

- **Component Structure**: Keep components small and reusable. Store global components in `app/components`.
- **Responsive Design**: Always test designs on mobile. The 3D Lab includes a mobile-specific warning and optimized controls.
- **Performance**: Use Next.js `Image` component for optimized assets. Lazy load the 3D canvas where possible.
