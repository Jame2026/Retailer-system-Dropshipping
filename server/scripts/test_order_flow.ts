import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

async function testOrders() {
  const baseURL = 'http://localhost:4000';
  const token = jwt.sign(
    { adminId: 'test-admin', email: 'admin@dropship.com', role: 'admin' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  console.log('Testing GET /api/orders...');
  const res = await fetch(`${baseURL}/api/orders`);
  const data = (await res.json()) as any;
  console.log('Status:', res.status, 'Total orders:', data.data?.total, 'Counts:', data.data?.counts);

  console.log('\nTesting POST /api/orders/simulate...');
  const simNum = Math.floor(1000 + Math.random() * 9000);
  const simRes = await fetch(`${baseURL}/api/orders/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: Date.now().toString(),
      order_number: simNum,
      name: `#${simNum}`,
      created_at: new Date().toISOString(),
      financial_status: 'paid',
      currency: 'USD',
      total_price: '49.99',
      subtotal_price: '44.99',
      email: 'test.admin@dropship.com',
      shipping_address: {
        name: 'John Test Admin',
        address1: '100 Main St',
        city: 'Portland',
        province: 'Oregon',
        province_code: 'OR',
        zip: '97201',
        country: 'United States',
        country_code: 'US',
      },
      line_items: [
        {
          id: Date.now().toString(),
          title: 'Wireless Charger RGB Lamp',
          sku: 'TEST-LAMP-01',
          quantity: 1,
          price: '49.99',
          variant_id: '2610300340461623900',
        },
      ],
    }),
  });

  const simData = (await simRes.json()) as any;
  const createdOrder = simData.data;
  console.log('Simulated Order Created ID:', createdOrder.id, 'Status:', createdOrder.status);

  console.log('\nTesting PATCH /api/orders/:id/address (Clean/Normalize address)...');
  const patchRes = await fetch(`${baseURL}/api/orders/${createdOrder.id}/address`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      shippingName: 'John Verified Admin',
      shippingAddress1: '742 Evergreen Terrace',
      shippingCity: 'Springfield',
      shippingProvince: 'Oregon',
      shippingZip: '97477',
      customerPhone: '+1 555-0199',
    }),
  });
  const patchData = (await patchRes.json()) as any;
  console.log('Address update HTTP:', patchRes.status, patchData);

  console.log('\nTesting manual override RELEASE_NOW (Dispatching to CJ API v2.0)...');
  const overrideRes = await fetch(`${baseURL}/api/orders/override`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      orderId: createdOrder.id,
      action: 'RELEASE_NOW',
      targetSupplier: 'CJ',
    }),
  });
  const overrideData = (await overrideRes.json()) as any;
  console.log('Override dispatched HTTP:', overrideRes.status, overrideData);

  console.log('\nTesting manual override CANCEL (Cancelling and deleting from CJ)...');
  const cancelRes = await fetch(`${baseURL}/api/orders/override`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      orderId: createdOrder.id,
      action: 'CANCEL',
      notes: 'Customer changed mind before warehouse dispatch',
    }),
  });
  const cancelData = (await cancelRes.json()) as any;
  console.log('Cancel HTTP:', cancelRes.status, 'Status:', cancelData.data?.status, 'Notes:', cancelData.data?.manualReviewNotes);

  console.log('\nAll order flow checks PASSED!');
}

testOrders().catch((err) => {
  console.error('Test failed:', err);
});
