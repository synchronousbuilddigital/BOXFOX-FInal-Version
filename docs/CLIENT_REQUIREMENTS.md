# 📋 Client Requirement Checklist & Questions

To complete the **BOXFOX** platform within the next **12 days**, we require the following technical credentials, data, and clarifications. Please provide these assets as soon as possible to avoid project delays.

---

## 1. Technical Credentials (API & Cloud)
*   [ ] **Cloudinary Credentials**: For high-speed image hosting and optimization.
    *   *Need: Cloud Name, API Key, and API Secret.*
*   [ ] **MongoDB Production URI**: A dedicated production database (e.g., MongoDB Atlas) to migrate from development to live data.
*   [ ] **AI Image Generation API**: Which service would you prefer for the customization AI? (OpenAI DALL-E, Stable Diffusion, or Midjourney API).
    *   *Need: API Key for the chosen service.*
*   [ ] **Payment Gateway**: Which platform are we using? (Razorpay or Stripe).
    *   *Need: Live API Keys (Key ID & Secret).*
*   [ ] **Email/SMS Service**: Credentials for automated order confirmations (e.g., SendGrid, Mailgun, or Twilio).

---

## 2. Product Data (Content)
We need a comprehensive list of all products to be live on Day 1. Please provide a spreadsheet (Excel/CSV) containing:
*   [ ] **Product Names & Descriptions**.
*   [ ] **Pricing**: B2C single prices and B2B bulk pricing tiers.
*   [ ] **High-Resolution Images**: Official product photography for the gallery.
*   [ ] **Technical Specs**: Materials, GSM, Dimensions (L x W x H), and weight.
*   [ ] **Categories**: How should products be grouped? (e.g., Bakery, Ecommerce, Luxury).

---

## 3. Feature Scope Clarification
*   [ ] **B2C (User) Side**:
    *   Should users be able to track orders via SMS or just Email?
    *   Do you require a "Guest Checkout" or mandatory login?
*   [ ] **B2B Side**:
    *   How strictly should the **MOQ (Minimum Order Quantity)** be enforced?
    *   Do B2B clients need a "Tax Exemption" (GST/VAT) field during checkout?
    *   Should B2B pricing be hidden from regular users until they apply for a B2B account?

---

## 4. Legal & Brand Assets
*   [ ] **Official Logo**: Confirmation on the final version of the logo.
*   [ ] **Legal Pages**: Finalized text for "Terms & Conditions", "Privacy Policy", and "Refund Policy".
*   [ ] **Customer Support**: Contact email and phone number for the footer and "Contact Us" page.

---

## 5. Deployment & Domain
*   [ ] **Domain Name**: Access to the domain DNS or the hosting platform (Vercel/AWS/DigitalOcean).
*   [ ] **SSL Certificate**: Will this be handled by the hosting provider, or do we need to provide one?

---
**Deadline for Information: Within 48 Hours**
*Providing this information early ensures we have enough time for integration testing and bug fixes before the 12-day deadline.*
