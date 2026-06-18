import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { rateLimit, getIP } from '@/lib/rateLimit';

const limiter = rateLimit({ interval: 60 * 1000 }); // 60 seconds

export async function POST(req) {
    try {
        try {
            const ip = getIP(req);
            await limiter.check(5, ip);
        } catch {
            return NextResponse.json({ error: 'Too Many Requests.' }, { status: 429 });
        }

        await dbConnect();

        const {
            name, email, password, phone, businessName, vendorCategory, vendorSpecialties,
            vendorAddressLine1, vendorAddressLine2, vendorAddressLine3, vendorAddressLine4,
            vendorCity, vendorState, vendorPostalCode, vendorCountry, vendorTelephone, vendorFax,
            vendorContactOwnerName, vendorDesignation, vendorLegalEntity, vendorYearsInBusiness, vendorNoOfEmployees,
            vendorAssociatedWithEmployee, vendorEmployeeDetails,
            vendorBankName, vendorBankAccountNo, vendorBankBranch, vendorIfscCode, vendorPaymentTerms,
            vendorCoveredUnderMSMED, vendorMsmedRegNo,
            vendorPan, vendorTdsCategory, vendorGstCentral, vendorGstLocal,
            vendorServiceTaxRegNo, vendorCentralExciseNo, vendorAuthorisedDealer,
            vendorDocAddressProof, vendorDocExciseReg, vendorDocPan, vendorDocVatReg,
            vendorDocServiceTax, vendorDocProofLegalEntity, vendorDocCancelledCheque, vendorDocOthers
        } = await req.json();

        if (
            !name || !email || !password || !phone || !businessName || !vendorCategory ||
            !vendorSpecialties || !Array.isArray(vendorSpecialties) || vendorSpecialties.length === 0 ||
            !vendorAddressLine1 || !vendorCity || !vendorState || !vendorPostalCode ||
            !vendorContactOwnerName || !vendorDesignation || !vendorLegalEntity ||
            !vendorBankName || !vendorBankAccountNo || !vendorIfscCode || !vendorPan
        ) {
            return NextResponse.json({ error: 'Please provide all required fields (Address, Contact info, Bank details, PAN, Category, and Specialties are mandatory)' }, { status: 400 });
        }

        if (vendorSpecialties.length > 6) {
            return NextResponse.json({ error: 'A vendor can select a maximum of 6 specialties' }, { status: 400 });
        }

        const userExists = await User.findOne({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } });

        if (userExists) {
            return NextResponse.json({ error: 'A user or vendor with this email already exists' }, { status: 400 });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            businessName,
            role: 'vendor',
            vendorStatus: 'pending',
            vendorCategory,
            vendorSpecialties,
            vendorAddressLine1,
            vendorAddressLine2,
            vendorAddressLine3,
            vendorAddressLine4,
            vendorCity,
            vendorState,
            vendorPostalCode,
            vendorCountry: vendorCountry || 'India',
            vendorTelephone,
            vendorFax,
            vendorContactOwnerName,
            vendorDesignation,
            vendorLegalEntity,
            vendorYearsInBusiness: Number(vendorYearsInBusiness) || 0,
            vendorNoOfEmployees: Number(vendorNoOfEmployees) || 0,
            vendorAssociatedWithEmployee: vendorAssociatedWithEmployee || 'No',
            vendorEmployeeDetails,
            vendorBankName,
            vendorBankAccountNo,
            vendorBankBranch,
            vendorIfscCode,
            vendorPaymentTerms,
            vendorCoveredUnderMSMED: vendorCoveredUnderMSMED || 'No',
            vendorMsmedRegNo,
            vendorPan,
            vendorTdsCategory,
            vendorGstCentral,
            vendorGstLocal,
            vendorServiceTaxRegNo,
            vendorCentralExciseNo,
            vendorAuthorisedDealer,
            vendorDocAddressProof,
            vendorDocExciseReg,
            vendorDocPan,
            vendorDocVatReg,
            vendorDocServiceTax,
            vendorDocProofLegalEntity,
            vendorDocCancelledCheque,
            vendorDocOthers
        });

        return NextResponse.json({
            message: 'Application submitted successfully. Waiting for admin approval.',
        }, { status: 201 });

    } catch (error) {
        console.error('Vendor Signup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
