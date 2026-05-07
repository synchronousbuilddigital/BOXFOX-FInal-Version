const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
require('dotenv').config();

// Fix for querySrv ECONNREFUSED on some networks/machines
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = "mongodb+srv://boxfox:boxfox@cluster0.7oansfw.mongodb.net/"

mongoose.connect(MONGODB_URI)
    .then(async () => {
        // Basic schema definition
        const UserSchema = new mongoose.Schema({ email: String, password: String, role: String, name: String, phone: String }, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        // Hash password
        const hashed = await bcrypt.hash('admin123', 10);

        // Update or create
        await User.updateOne(
            { email: 'admin@boxfox.com' },
            { $set: { password: hashed, role: 'admin', name: 'Admin', phone: '1234567890' } },
            { upsert: true }
        );

        console.log('Password set successfully in DB.');
        process.exit(0);
    }).catch(console.error);
