import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function handler(req, res) {
  if (req.method === 'POST') {
    const client = new MongoClient(MONGODB_URI);

    try {
      await client.connect();
      const db = client.db('boxfox');
      const collection = db.collection('exchange_requests');

      const { name, email, orderNumber, subject, contactNumber, reason, message } = req.body;

      // Validate required fields
      if (!name || !email || !orderNumber || !contactNumber || !reason || !message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields' 
        });
      }

      const newRequest = {
        name,
        email,
        orderNumber,
        subject: subject || '',
        contactNumber,
        reason,
        message,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newRequest);

      return res.status(201).json({
        success: true,
        message: 'Exchange request submitted successfully',
        requestId: result.insertedId
      });
    } catch (error) {
      console.error('Error submitting exchange request:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit exchange request'
      });
    } finally {
      await client.close();
    }
  } else if (req.method === 'GET') {
    // Get all exchange requests (admin only)
    const client = new MongoClient(MONGODB_URI);

    try {
      await client.connect();
      const db = client.db('boxfox');
      const collection = db.collection('exchange_requests');

      const requests = await collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json({
        success: true,
        data: requests,
        total: requests.length
      });
    } catch (error) {
      console.error('Error fetching exchange requests:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch exchange requests'
      });
    } finally {
      await client.close();
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

export async function POST(request) {
  const body = await request.json();
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('boxfox');
    const collection = db.collection('exchange_requests');

    const { name, email, orderNumber, subject, contactNumber, reason, message } = body;

    if (!name || !email || !orderNumber || !contactNumber || !reason || !message) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), { status: 400 });
    }

    const newRequest = {
      name,
      email,
      orderNumber,
      subject: subject || '',
      contactNumber,
      reason,
      message,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newRequest);

    return new Response(JSON.stringify({
      success: true,
      message: 'Exchange request submitted successfully',
      requestId: result.insertedId
    }), { status: 201 });
  } catch (error) {
    console.error('Error submitting exchange request:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to submit exchange request'
    }), { status: 500 });
  } finally {
    await client.close();
  }
}

export async function GET(request) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('boxfox');
    const collection = db.collection('exchange_requests');

    const requests = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify({
      success: true,
      data: requests,
      total: requests.length
    }), { status: 200 });
  } catch (error) {
    console.error('Error fetching exchange requests:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch exchange requests'
    }), { status: 500 });
  } finally {
    await client.close();
  }
}
