require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['user', 'admin', 'staff_fulfillment', 'vendor'], default: 'user' }
}, { strict: false });

// Try to get model or define it
let User;
try {
    User = mongoose.model('User');
} catch {
    User = mongoose.model('User', UserSchema);
}

async function seedAdmin() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('MONGODB_URI is not defined in .env');
            process.exit(1);
        }

        console.log('Connecting to database...');
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB.');

        const email = process.env.ADMIN_EMAIL || 'admin@boxfox.com';
        const password = process.env.ADMIN_PASSWORD || 'admin';
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let adminUser = await User.findOne({ email });

        if (adminUser) {
            console.log('Admin user found. Updating password and role...');
            adminUser.password = hashedPassword;
            adminUser.role = 'admin';
            await adminUser.save();
            console.log('Admin user updated successfully.');
        } else {
            console.log('Admin user not found. Creating a new one...');
            adminUser = new User({
                name: 'BoxFox Admin',
                email: email,
                password: hashedPassword,
                role: 'admin',
                emailOptIn: true
            });
            await adminUser.save();
            console.log('Admin user created successfully.');
        }

        console.log(`\n--- Admin Credentials ---`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`-------------------------\n`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
