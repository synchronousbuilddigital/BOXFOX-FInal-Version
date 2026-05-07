# Backend Documentation - BoxFox Store ⚙️

This document outlines the backend architecture, API endpoints, database models, and core business logic of the BoxFox Store.

## 🏗️ Architecture Overview

The backend is built using **Next.js API Routes** (Serverless functions). It interacts with **MongoDB** for persistent storage and **Redis** for caching and rate-limiting.

### Key Technologies

- **Mongoose**: ODM for MongoDB schema management.
- **JWT**: Secure token-based authentication.
- **Cloudinary SDK**: For server-side image processing and uploads.
- **NodeMailer**: For automated email triggers.

---

## 📂 API Reference

### 1. Authentication (`/api/auth`)

- `POST /login`: Authenticates user and returns JWT.
- `POST /signup`: Registers new user and sends welcome email.
- `POST /verify-otp`: Validates OTP for password resets or signup.

### 2. Products (`/api/products`)

- `GET /`: Retrieves all active products (supports filtering).
- `GET /[id]`: Fetches detailed product info including variants.
- `POST /admin`: (Protected) Create or update product details.
- `POST /admin/bulk-upload`: Processes Excel/CSV files for mass product updates.

### 3. Orders (`/api/orders`)

- `GET /`: Lists user orders.
- `POST /create`: Initializes a new order and generates a unique `orderId`.
- `POST /update-status`: (Protected) Admin endpoint to move order through fulfillment stages.

### 4. Customization & AI (`/api/customize`) - NEURAL_V2.5
- **POST /generate (Ignite_Forge)**: Interface with high-performance AI models to generate textures and logos based on user ideas.
- **Neural_Maps API**: Backend logic for calculating texture offsets and scaling for 3D projection.
- **GET /status/[taskId]**: Polls the status of an ongoing **Ignite_Forge** generation task.
- **POST /save**: Saves a user's custom design including Neural_Maps metadata.

### 5. Lab & Pricing (`/api/lab`)

- `GET /config`: Returns current material rates, formulas, and box specifications.
- `POST /calculate`: A precise endpoint for calculating prices based on custom dimensions, material, and finish.

---

## 🗄️ Database Models (`/models`)

| Model                 | Purpose                                                          |
| :-------------------- | :--------------------------------------------------------------- |
| **User**        | Stores credentials, profile info, and the**Brand Vault**.  |
| **Product**     | Base catalog items (Simple, Variable, Variation).                |
| **BoxProduct**  | Specialized models for customizable packaging.                   |
| **Order**       | Tracks transactions, items, shipping, and payment status.        |
| **SavedDesign** | Stores user-created 3D designs (textures, dimensions, metadata). |
| **LabConfig**   | Global settings for the pricing engine (GSM, Material rates).    |
| **Coupon**      | Stores discount codes and usage limits.                          |

---

## 🧠 Core Logic (`/lib`)

### 1. Pricing Engine (`boxfoxPricing.js`)

This is the heart of the platform. It calculates prices dynamically based on:

- **Surface Area**: Length, Width, and Height calculations for different box types.
- **Material Costs**: Live rates for SBS, Kraft, etc.
- **GSM & Wastage**: Complex factors accounting for paper weight and production loss.
- **Finish & Print**: Add-on costs for Lamination, Foiling, and Four-Color printing.

### 2. Dieline Generator (`dieline-generator.js`)

- Generates SVG paths for box fold lines and cut lines based on dimensions.
- Used to provide customers with accurate templates for their artwork.

### 3. Mailer Service (`mail.js`)

- Handles transactional emails using pre-defined templates.
- Includes logic for sending Invoices (PDF), OTPs, and Order Status updates.

---

## 🔒 Security & Middleware

- **JWT Validation**: Most `/api/admin` and `/api/user` routes are protected by a JWT verification layer.
- **Rate Limiting**: Integrated with Redis to prevent API abuse (especially on AI generation and Auth endpoints).
- **CORS & Environment Protection**: Secure headers and strict environment variable checks.
