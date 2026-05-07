import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';
import User from '@/models/User';

function getUserId(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        return decoded?.id || null;
    } catch { return null; }
}

export async function GET(req) {
    try {
        await dbConnect();
        const userId = getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { partnerId } = Object.fromEntries(new URL(req.url).searchParams);
        
        if (!partnerId) {
            // If no partnerId, return list of chat partners (for admin)
            const user = await User.findById(userId);
            if (user.role === 'admin') {
                const messages = await ChatMessage.find({ $or: [{ sender: userId }, { receiver: userId }] })
                    .populate('sender', 'name email role')
                    .populate('receiver', 'name email role')
                    .sort({ createdAt: -1 });
                
                // Group by partner
                const partners = {};
                messages.forEach(msg => {
                    const partner = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
                    if (!partners[partner._id]) {
                        partners[partner._id] = { ...partner._doc, lastMessage: msg.message, lastDate: msg.createdAt };
                    }
                });
                return NextResponse.json({ success: true, partners: Object.values(partners) });
            }
            return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
        }

        const messages = await ChatMessage.find({
            $or: [
                { sender: userId, receiver: partnerId },
                { sender: partnerId, receiver: userId }
            ]
        }).sort({ createdAt: 1 });

        return NextResponse.json({ success: true, messages });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const userId = getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { receiverId, message } = await req.json();

        const chatMessage = await ChatMessage.create({
            sender: userId,
            receiver: receiverId,
            message
        });

        return NextResponse.json({ success: true, message: chatMessage }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
