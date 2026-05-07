# 🗓️ 12-Day Website Completion Roadmap (Sprint Plan)

This plan outlines the final push to launch the BOXFOX e-commerce platform. Success depends on receiving client credentials (AI, DB, Cloudinary) by Day 2.

---

## 🏗️ Phase 1: Setup & Data Migration (Day 1 - 3)
*   **Day 1: Information Gathering**: Finalize client questions, audit current codebase, and prepare migration scripts for real product data.
*   **Day 2: Cloud Infrastructure**: Integrate **Cloudinary** for image handling and migrate existing assets. Connect the production **MongoDB** database.
*   **Day 3: Bulk Data Upload**: Upload all official product data (names, prices, images, specs) into the production database. Set up category hierarchies.

---

## 🛠️ Phase 2: Advanced Feature Integration (Day 4 - 7)
*   **Day 4: B2B vs B2C Logic**: Implement logic to differentiate user types. Enable hidden B2B pricing and enforce MOQ (Minimum Order Quantity) in the cart.
*   **Day 5: Customization AI (Part 1)**: Integrate the **Image Generation API** (OpenAI/Stable Diffusion) into the 3D customizer flow.
*   **Day 6: Customization AI (Part 2)**: Refine UI for AI prompts, loading states, and ensuring generated images map correctly to the Pacdora 3D viewer.
*   **Day 7: User Dashboard**: Finalize "Order History", "Address Management", and "Re-order" functionality for returning customers.

---

## 💳 Phase 3: Transactional Systems (Day 8 - 10)
*   **Day 8: Payment Gateway (Razorpay/Stripe)**: Integrate the live payment API. Implement webhook listeners for "Payment Success" and "Payment Failure".
*   **Day 9: Transactional Notifications**: Set up **Email (SendGrid)** and **SMS** triggers for Order Confirmation, Invoicing, and Shipping updates.
*   **Day 10: Admin Control Polish**: Finalize the Order Management dashboard so the client can update statuses (Shipped, Delivered) and generate reports.

---

## 🚀 Phase 4: Quality Assurance & Launch (Day 11 - 12)
*   **Day 11: End-to-End Testing**: Test the complete flow from Landing -> 3D Customization -> Add to Cart -> Payment -> Admin Dashboard. Fix any UX bugs.
*   **Day 12: Deployment & Handover**: Move the site to the production domain, perform final SEO checks, and hand over the "Admin User Manual" to the client.

---

## ⚠️ Critical Dependencies
1. **API Credentials**: Delayed credentials will push the timeline back day-for-day.
2. **Payment Approval**: The client must ensure their Razorpay/Stripe account is "Live" and "Verified" before Day 8.
3. **Data Accuracy**: Clean product data (Excel/CSV) is required by Day 2 for successful migration.

---
**Projected Launch Date: T-Minus 12 Days**
