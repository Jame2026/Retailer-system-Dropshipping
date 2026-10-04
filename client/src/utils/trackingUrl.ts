export function getCarrierTrackingUrl(trackingNumber: string, carrier: string = 'USPS'): string {
  const cleanNumber = (trackingNumber || '').trim();
  const lowerCarrier = (carrier || '').toLowerCase();

  if (lowerCarrier.includes('usps') || cleanNumber.startsWith('94') || cleanNumber.startsWith('92')) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${cleanNumber}`;
  }

  if (lowerCarrier.includes('yunexpress') || cleanNumber.startsWith('YT')) {
    return `https://www.yuntrack.com/track/detail?nums=${cleanNumber}`;
  }

  if (lowerCarrier.includes('cj') || lowerCarrier.includes('cjpaket')) {
    return `https://cjpacket.com/?trackingNumber=${cleanNumber}`;
  }

  if (lowerCarrier.includes('dhl')) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${cleanNumber}`;
  }

  // 17Track universal fallback
  return `https://t.17track.net/en#nums=${cleanNumber}`;
}
