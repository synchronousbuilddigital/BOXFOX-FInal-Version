import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';

export async function GET(req) {
    try {
        await dbConnect();

        // Security check
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        const user = await User.findById(decoded.id);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Date ranges
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

        // Fetch orders for current and previous period
        const currentOrders = await Order.find({ createdAt: { $gte: thirtyDaysAgo } });
        const previousOrders = await Order.find({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
        const allOrders = await Order.find().sort({ createdAt: -1 });

        // Calculate Stats
        const calcTotal = (orders) => orders.reduce((acc, o) => acc + (o.total || 0), 0);
        const calcItems = (orders) => orders.reduce((acc, o) => acc + (o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0), 0);

        const currentSales = calcTotal(currentOrders);
        const previousSales = calcTotal(previousOrders);
        const currentOrderCount = currentOrders.length;
        const previousOrderCount = previousOrders.length;
        const currentItemsSold = calcItems(currentOrders);
        const previousItemsSold = calcItems(previousOrders);

        // Growth Calculation Helper
        const getGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? "+100%" : "+0%";
            const growth = ((current - previous) / previous) * 100;
            return (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%";
        };

        const totalProducts = await Product.countDocuments();

        const data = {
            totalSales: `₹${calcTotal(allOrders).toLocaleString('en-IN')}`,
            totalSalesGrowth: getGrowth(currentSales, previousSales),
            totalOrders: allOrders.length.toString(),
            totalOrdersGrowth: getGrowth(currentOrderCount, previousOrderCount),
            productsSold: calcItems(allOrders).toString(),
            productsSoldGrowth: getGrowth(currentItemsSold, previousItemsSold),
            recentOrders: allOrders.slice(0, 5).map(o => ({
                id: o.orderId,
                customer: o.customer.name,
                product: o.items[0]?.name || 'Multiple items',
                status: o.status,
                amount: `₹${o.total.toLocaleString('en-IN')}`,
                time: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            })),
            labUtilization: [
                { label: 'Pizza Boxes', percent: Math.round(((await Product.countDocuments({ name: { $regex: /Pizza/i } })) / (totalProducts || 1)) * 100) || 15, color: 'bg-emerald-500' },
                { label: 'Cake Boxes', percent: Math.round(((await Product.countDocuments({ name: { $regex: /Cake/i } })) / (totalProducts || 1)) * 100) || 25, color: 'bg-blue-500' },
                { label: 'Mailer Boxes', percent: Math.round(((await Product.countDocuments({ name: { $regex: /Mailer/i } })) / (totalProducts || 1)) * 100) || 40, color: 'bg-purple-500' },
                { label: 'Sweet Boxes', percent: Math.round(((await Product.countDocuments({ name: { $regex: /Sweet/i } })) / (totalProducts || 1)) * 100) || 10, color: 'bg-orange-500' },
                { label: 'Carry Bags', percent: Math.round(((await Product.countDocuments({ name: { $regex: /Bag|Carry/i } })) / (totalProducts || 1)) * 100) || 10, color: 'bg-yellow-500' },
            ]
        };

        return NextResponse.json(data);
    } catch (e) {
        console.error("Dashboard Stats API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

