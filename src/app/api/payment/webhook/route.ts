import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const supabase = createServerSupabaseClient();

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;

        // Update order
        await supabase
          .from('payment_orders')
          .update({
            status: 'captured',
            razorpay_payment_id: payment.id,
            paid_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', orderId);

        // Get order to find user and plan
        const { data: order } = await supabase
          .from('payment_orders')
          .select('*')
          .eq('razorpay_order_id', orderId)
          .single();

        if (order) {
          await supabase
            .from('profiles')
            .update({
              subscription_tier: order.plan_id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.user_id);
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        await supabase
          .from('payment_orders')
          .update({ status: 'failed' })
          .eq('razorpay_order_id', payment.order_id);
        break;
      }

      case 'refund.created': {
        const refund = event.payload.refund.entity;
        const paymentId = refund.payment_id;

        // Find the order and downgrade
        const { data: order } = await supabase
          .from('payment_orders')
          .select('*')
          .eq('razorpay_payment_id', paymentId)
          .single();

        if (order) {
          await supabase
            .from('payment_orders')
            .update({ status: 'refunded' })
            .eq('razorpay_payment_id', paymentId);

          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.user_id);
        }
        break;
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
