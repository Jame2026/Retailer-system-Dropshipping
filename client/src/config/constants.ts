export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  PENDING_HOLD: {
    label: 'On Hold (6h)',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
  },
  HOLD_EXPIRED: {
    label: 'Ready to Send',
    color: 'text-orange-800',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
  },
  PROCESSING: {
    label: 'Processing',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
  },
  DISPATCHED_TO_SUPPLIER: {
    label: 'Sent to Supplier',
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
  },
  FAILED_BILLING: {
    label: 'Payment Issue',
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
  },
  SUPPLIER_PROCESSING: {
    label: 'Processing',
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'text-teal-800',
    bg: 'bg-teal-50',
    border: 'border-teal-300',
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
  },
  MANUAL_REVIEW: {
    label: 'Needs Review',
    color: 'text-yellow-800',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
  },
};

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

export const DEFAULT_PAGE_LIMIT = 20;
export const HOLD_BUFFER_HOURS = 6;

export const DEFAULT_MARKUP_MULTIPLIER = 2.5;
export const DEFAULT_SHIPPING_BUFFER_USD = 3.0;
export const DEFAULT_SHIPPING_COST_USD = 3.5;
export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';

export const FALLBACK_CJ_CATEGORIES = [
  { categoryId: '', categoryName: 'All Categories', categoryLevel: 1 },
  { categoryId: '2FE8A083-5E7B-4179-896D-561EA116F730', categoryName: "Women's Clothing", categoryLevel: 1 },
  { categoryId: 'B8302697-CF47-4211-9BD0-DFE8995AEB30', categoryName: "Men's Clothing", categoryLevel: 1 },
  { categoryId: '2409110611570657700', categoryName: 'Pet Supplies', categoryLevel: 1 },
  { categoryId: '52FC6CA5-669B-4D0B-B1AC-415675931399', categoryName: 'Home & Garden', categoryLevel: 1 },
  { categoryId: '2C7D4A0B-1AB2-41EC-8F9E-13DC31B1C902', categoryName: 'Health & Beauty', categoryLevel: 1 },
  { categoryId: '2837816E-2FEA-4455-845C-6F40C6D70D1E', categoryName: 'Jewelry & Watches', categoryLevel: 1 },
  { categoryId: '2415A90C-5D7B-4CC7-BA8C-C0949F9FF5D8', categoryName: 'Bags & Shoes', categoryLevel: 1 },
  { categoryId: 'A50A92FA-BCB3-4716-9BD9-BEC629BEE735', categoryName: 'Toys, Kids & Baby', categoryLevel: 1 },
  { categoryId: '4B397425-26C1-4D0E-B6D2-96B0B03689DB', categoryName: 'Sports & Outdoors', categoryLevel: 1 },
  { categoryId: 'D9E66BF8-4E81-4CAB-A425-AEDEC5FBFBF2', categoryName: 'Consumer Electronics', categoryLevel: 1 },
  { categoryId: 'E9FDC79A-8365-4CA6-AC23-64D971F08B8B', categoryName: 'Phones & Accessories', categoryLevel: 1 },
  { categoryId: '1126E280-CB7D-418A-90AB-7118E2D97CCC', categoryName: 'Computer & Office', categoryLevel: 1 },
  { categoryId: '6A5D2EB4-13BD-462E-A627-78CFED11B2A2', categoryName: 'Home Improvement', categoryLevel: 1 },
  { categoryId: 'A2F799BE-FB59-428E-A953-296AA2673FCF', categoryName: 'Automobiles & Motorcycles', categoryLevel: 1 },
];

