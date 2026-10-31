import { cjClient } from '../server/integrations/cj/cj.client.js';

async function testDeleteOrder() {
  const orderId = 'SD2610300435330644401';
  console.log('Testing deleteOrder with orderId:', orderId);

  // Test POST with body
  try {
    const res1 = await cjClient.request('/shopping/order/deleteOrder', 'POST', { orderId });
    console.log('POST { orderId }:', res1);
  } catch (err: any) {
    console.log('Error POST body:', err.message);
  }

  // Test POST with query param
  try {
    const res2 = await cjClient.request('/shopping/order/deleteOrder', 'POST', undefined, { orderId });
    console.log('POST query param:', res2);
  } catch (err: any) {
    console.log('Error POST query:', err.message);
  }

  // Test DELETE with query param
  try {
    const res3 = await cjClient.request('/shopping/order/deleteOrder', 'DELETE', undefined, { orderId });
    console.log('DELETE query param:', res3);
  } catch (err: any) {
    console.log('Error DELETE query:', err.message);
  }
}

testDeleteOrder().catch(console.error);
