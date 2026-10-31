import jwt from 'jsonwebtoken';

async function testOrders() {
  const baseURL = 'http://localhost:4000';
  const token = jwt.sign(
    { adminId: 'test-admin', email: 'admin@dropship.com', role: 'admin' },
    process.env.JWT_SECRET || 'supersecret_dropship_jwt_dev_key_2026',
    { expiresIn: '1h' }
  );

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  console.log('Testing GET /api/orders...');
  const res = await fetch(`${baseURL}/api/orders`);
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Orders count:', data.data?.orders?.length);
  console.log('Total:', data.data?.total);
  console.log('Counts:', data.data?.counts);

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
          title: 'Wireless Charger Lamp',
          sku: 'TEST-LAMP-01',
          quantity: 1,
          price: '49.99',
          variant_id: '2610300340461623900',
        },
      ],
    }),
  });

  const simData = await simRes.json();
  const createdOrder = simData.data;
  console.log('Simulated Order Created ID:', createdOrder.id, 'Status:', createdOrder.status);

  console.log('\nTesting GET /api/orders/:id...');
  const getRes = await fetch(`${baseURL}/api/orders/${createdOrder.id}`);
  const getData = await getRes.json();
  console.log('Fetched single order:', getData.data.shopifyOrderNumber, 'Status:', getData.data.status);

  console.log('\nTesting PATCH /api/orders/:id/address...');
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
  const patchData = await patchRes.json();
  console.log('Address update result:', patchData.data?.shippingName, patchData.data?.shippingAddress1);

  console.log('\nTesting manual override RELEASE_NOW with CJ factory...');
  const overrideRes = await fetch(`${baseURL}/api/orders/override`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      orderId: createdOrder.id,
      action: 'RELEASE_NOW',
      targetSupplier: 'CJ',
    }),
  });
  const overrideData = await overrideRes.json();
  console.log('Override dispatched status:', overrideData.data?.status, 'Supplier Order ID:', overrideData.data?.supplierOrderId);

  console.log('\nTesting sync-cj on the released order...');
  const syncRes = await fetch(`${baseURL}/api/orders/${createdOrder.id}/sync-cj`, {
    method: 'POST',
    headers: authHeaders,
  });
  const syncData = await syncRes.json();
  console.log('Sync CJ result status:', syncData.data?.status);
}

testOrders().catch((err) => {
  console.error('Test failed:', err);
});
