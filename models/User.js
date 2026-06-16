import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailOptIn: { type: Boolean, default: true, required: true },
    password: { type: String },
    role: { type: String, enum: ['user', 'admin', 'staff_fulfillment', 'vendor'], default: 'user' },
    vendorStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    vendorCategory: { type: String },
    vendorSpecialties: { type: [String], default: [] },
    phone: { type: String },
    businessName: { type: String },
    address: String,

    // Detailed Vendor Profile Fields (Pernod Ricard India Private Limited Vendor Form)
    // Section 1: Address and General Details
    vendorAddressLine1: { type: String },
    vendorAddressLine2: { type: String },
    vendorAddressLine3: { type: String },
    vendorAddressLine4: { type: String },
    vendorCity: { type: String },
    vendorState: { type: String },
    vendorPostalCode: { type: String },
    vendorCountry: { type: String, default: 'India' },
    vendorTelephone: { type: String },
    vendorFax: { type: String },

    // Section 2: Owner / Entity Details
    vendorContactOwnerName: { type: String },
    vendorDesignation: { type: String },
    vendorLegalEntity: { type: String }, // Dropdown: Public Limited, Private Limited, Partnership, Proprietor, HUF, Others
    vendorYearsInBusiness: { type: Number },
    vendorNoOfEmployees: { type: Number },
    vendorAssociatedWithEmployee: { type: String, default: 'No' }, // Yes / No
    vendorEmployeeDetails: { type: String },

    // Section 3: Bank Details
    vendorBankName: { type: String },
    vendorBankAccountNo: { type: String },
    vendorBankBranch: { type: String },
    vendorIfscCode: { type: String },
    vendorPaymentTerms: { type: String },
    vendorCoveredUnderMSMED: { type: String, default: 'No' }, // Yes / No
    vendorMsmedRegNo: { type: String },

    // Section 4: Tax and Regulatory Details
    vendorPan: { type: String },
    vendorTdsCategory: { type: String }, // Dropdown: Contractor, Professional/Adv, Comm, Rent, N.A.
    vendorGstCentral: { type: String },
    vendorGstLocal: { type: String },
    vendorServiceTaxRegNo: { type: String },
    vendorCentralExciseNo: { type: String },
    vendorAuthorisedDealer: { type: String },

    // Section 5: Supporting Documents (Uploaded file URLs)
    vendorDocAddressProof: { type: String },
    vendorDocExciseReg: { type: String },
    vendorDocPan: { type: String },
    vendorDocVatReg: { type: String },
    vendorDocServiceTax: { type: String },
    vendorDocProofLegalEntity: { type: String },
    vendorDocCancelledCheque: { type: String },
    vendorDocOthers: { type: String },
    
    // Vendor Wallet & Commission
    walletBalance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 0 }, // BoxFox percentage cut (e.g., 10 for 10%)

    shippingAddress: {
        street: String,
        apartment: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' }
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    lastLogin: { type: Date, default: Date.now },
    aiGenerationCount: { type: Number, default: 0 },
    lastAiGenerationDate: { type: Date },
    aiUnlimitedUntil: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    aiPatterns: [{
        url: String,
        prompt: String,
        createdAt: { type: Date, default: Date.now }
    }],
    brandVault: {
        logos: [{
            url: String,
            name: String,
            createdAt: { type: Date, default: Date.now }
        }],
        colors: [String], // Saved hex codes
        fonts: [String], // Saved preferred font options
    }
}, {
    timestamps: true,
    strict: false
});

export default mongoose.models.User || mongoose.model('User', UserSchema);