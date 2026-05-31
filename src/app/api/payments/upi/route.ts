import { NextResponse } from 'next/server';
import { generateUpiLink } from '@/lib/upi';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, amount, merchantUpiId, merchantName } = body;

    if (!orderId || !amount || !merchantUpiId) {
      return NextResponse.json({ error: 'Missing required fields for UPI payment' }, { status: 400 });
    }

    // Check order in DB to verify it's legitimate
    const order = await db.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Generate UPI Intent Link
    const upiLink = generateUpiLink({
      payeeAddress: merchantUpiId,
      payeeName: merchantName || 'Online Vepar Store',
      amount: amount,
      transactionNote: `Order ${order.orderNumber}`,
      transactionRefId: order.id,
      currency: 'INR'
    });

    // We can also create a Payment record with 'pending' status here
    await db.payment.create({
      data: {
        orderId: order.id,
        method: 'upi',
        gateway: 'direct_upi',
        amount: amount,
        currency: 'INR',
        status: 'pending'
      }
    });

    return NextResponse.json({ 
      success: true, 
      upiLink, 
      message: 'Use this link to generate a QR code on the frontend or redirect on mobile.' 
    });

  } catch (error) {
    console.error('Error generating UPI link:', error);
    return NextResponse.json({ error: 'Failed to process UPI payment' }, { status: 500 });
  }
}
