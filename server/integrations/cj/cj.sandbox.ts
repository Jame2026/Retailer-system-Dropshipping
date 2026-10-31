import { logger } from '../../utils/logger.js';

/**
 * Returns mock sandbox responses for CJ API endpoints when working offline or in test environments.
 */
export function getCjMockResponse(endpoint: string, data?: any, params?: any): any {
  logger.info({ endpoint }, '🧪 [CJ Sandbox Mode] Calling simulated response');

  if (endpoint.includes('/product/getCategory')) {
    return {
      result: true,
      code: 200,
      message: 'No Categories Available in Sandbox Mode',
      data: [],
    };
  }

  if (endpoint.includes('/product/globalWarehouseList')) {
    return {
      result: true,
      code: 200,
      message: 'Sandbox Warehouses',
      data: [
        { warehouseId: 'wh-us-east', warehouseName: 'US East Warehouse', countryCode: 'US', shippingDays: '3-5' },
      ],
    };
  }

  if (endpoint.includes('/product/listV2') || endpoint.includes('/product/list')) {
    return {
      result: true,
      code: 200,
      message: 'No products in sandbox mode',
      data: {
        list: [],
        total: 0,
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 20,
      },
    };
  }

  if (endpoint.includes('/product/query')) {
    return {
      result: true,
      code: 200,
      message: 'No product query in sandbox mode',
      data: null,
    };
  }

  if (endpoint.includes('/shopping/order/createOrder')) {
    const randomOrderId = `CJ-ORD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      result: true,
      code: 200,
      message: 'Order created successfully in CJ Dropshipping Factory (Sandbox)',
      data: {
        orderId: randomOrderId,
        orderNumber: randomOrderId,
        status: 'SUCCESS',
        totalAmount: 16.7,
      },
    };
  }

  if (endpoint.includes('/logistic/order/queryByOrderNumber') || endpoint.includes('/logistic/')) {
    const randomTrack = `940011189956${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      result: true,
      code: 200,
      message: 'Success (Sandbox Mode)',
      data: {
        trackingNumber: randomTrack,
        logisticName: 'USPS Ground Advantage',
        shippingStatus: 'IN_TRANSIT',
        deliveryDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      },
    };
  }

  return {
    result: true,
    code: 200,
    message: 'Success (Sandbox Mode)',
    data: { success: true },
  };
}
