import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        // 1. Revenue last 30 days (daily breakdown)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const dailyRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$total" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Category Performance
        const categoryPerformance = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.category", // Note: Category should be saved in order items or looked up
                    sales: { $sum: "$items.quantity" },
                    revenue: {
                        $sum: {
                            $multiply: [
                                { $convert: { input: "$items.price", to: "double", onError: 0, onNull: 0 } },
                                { $convert: { input: "$items.quantity", to: "double", onError: 0, onNull: 0 } }
                            ]
                        }
                    }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // 3. Customer Growth
        const totalCustomers = await User.countDocuments({ role: 'user' });
        const newCustomersThisMonth = await User.countDocuments({
            role: 'user',
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        });

        // 4. Order Status Distribution
        const statusDistribution = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const allOrders = await Order.find();
        const totalSalesSum = allOrders.reduce((acc, o) => acc + (o.total || 0), 0);
        const avgOrderValue = allOrders.length > 0 ? (totalSalesSum / allOrders.length).toFixed(2) : 0;
        const totalOrders = allOrders.length;
        const totalRevenue = totalSalesSum;
        const totalDiscounts = allOrders.reduce((acc, o) => acc + (o.discount || 0), 0);
        let totalProductsSold = 0;
        allOrders.forEach(o => {
            if (o.items) {
                totalProductsSold += o.items.reduce((acc, i) => acc + (i.quantity || 1), 0);
            }
        });

        const allUsers = await User.find();
        let totalWishlistItems = 0;
        let totalCartItems = 0;
        allUsers.forEach(u => {
            if (u.wishlist) totalWishlistItems += u.wishlist.length;
            if (u.cart) totalCartItems += u.cart.length;
        });

        // 5. Repeat Customer Rate
        const customersWithMultipleOrders = await Order.aggregate([
            { $group: { _id: { $ifNull: ["$customer.email", "$userId"] }, count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        const uniqueCustomersWithOrders = await Order.aggregate([
            { $group: { _id: { $ifNull: ["$customer.email", "$userId"] } } }
        ]);

        const repeatCustomerRate = uniqueCustomersWithOrders.length > 0
            ? ((customersWithMultipleOrders.length / uniqueCustomersWithOrders.length) * 100).toFixed(1)
            : 0;

        // 6. Conversion Engine (Orders vs Users with Cart/Wish items)
        const engagedUsers = allUsers.filter(u => (u.cart && u.cart.length > 0) || (u.wishlist && u.wishlist.length > 0)).length;
        const totalBuyers = uniqueCustomersWithOrders.length;
        const conversionRate = engagedUsers > 0 ? ((totalBuyers / (engagedUsers + totalBuyers)) * 100).toFixed(1) : (totalBuyers > 0 ? 100 : 0);

        // EXTRA REPORT PARAMS (18+ Requirements)

        // 7. Monthly Revenue (Yearly Analysis)
        const monthlyRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: oneYearAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total: { $sum: "$total" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 8. Order Size Distribution
        const orderSizeBuckets = await Order.aggregate([
            {
                $bucket: {
                    groupBy: "$total",
                    boundaries: [0, 500, 1500, 5000, 15000, 50000],
                    default: "50000+",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        // 9. Coupon Usage
        const couponUsage = await Order.aggregate([
            { $match: { couponCode: { $ne: null, $ne: "" } } },
            { $group: { _id: "$couponCode", uses: { $sum: 1 }, discountGenerated: { $sum: "$discount" } } },
            { $sort: { uses: -1 } }
        ]);

        // 10. Wishlist vs Order conversion (Estimated Demand)
        const productsInWishlists = {};
        allUsers.forEach(u => {
            if (u.wishlist) {
                u.wishlist.forEach(w => {
                    productsInWishlists[w] = (productsInWishlists[w] || 0) + 1;
                });
            }
        });

        const data = {
            dailyRevenue,
            categoryPerformance,
            totalCustomers,
            newCustomersThisMonth,
            statusDistribution,
            avgOrderValue,
            repeatCustomerRate,
            totalOrders,
            totalRevenue,
            totalWishlistItems,
            totalCartItems,
            totalDiscounts,
            totalProductsSold,
            conversionRate,
            productsInWishlistsCount: Object.keys(productsInWishlists).length, // Unique products wished for
            monthlyRevenue,
            orderSizeBuckets,
            couponUsage,
            b2bAccounts: allUsers.filter(u => u.businessName).length,
            b2cAccounts: allUsers.filter(u => !u.businessName).length,
        };



        return NextResponse.json(data);
    } catch (e) {
        console.error("Analytics API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
