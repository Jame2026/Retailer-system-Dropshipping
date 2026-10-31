export interface TopLevelCategoryDef {
  id: string;
  name: string;
  aliases: string[];
}

export const CJ_TOP_LEVEL_CATEGORIES: TopLevelCategoryDef[] = [
  { id: '2FE8A083-5E7B-4179-896D-561EA116F730', name: "Women's Clothing", aliases: ['women-clothing', 'womens clothing', "women's clothing", 'women', 'womens', 'dresses'] },
  { id: 'B8302697-CF47-4211-9BD0-DFE8995AEB30', name: "Men's Clothing", aliases: ['men-clothing', 'mens clothing', "men's clothing", 'men', 'mens'] },
  { id: '2409110611570657700', name: 'Pet Supplies', aliases: ['pet-supplies', 'pet supplies', 'pets', 'pet', 'dogs', 'cats'] },
  { id: '52FC6CA5-669B-4D0B-B1AC-415675931399', name: 'Home, Garden & Furniture', aliases: ['home-garden', 'home & garden', 'home, garden & furniture', 'home garden', 'home & kitchen', 'furniture'] },
  { id: '2C7D4A0B-1AB2-41EC-8F9E-13DC31B1C902', name: 'Health, Beauty & Hair', aliases: ['health-beauty', 'health & beauty', 'health, beauty & hair', 'health beauty', 'beauty'] },
  { id: '2837816E-2FEA-4455-845C-6F40C6D70D1E', name: 'Jewelry & Watches', aliases: ['jewelry-watches', 'jewelry & watches', 'jewelry watches', 'jewelry', 'watches'] },
  { id: '2415A90C-5D7B-4CC7-BA8C-C0949F9FF5D8', name: 'Bags & Shoes', aliases: ['bags-shoes', 'bags & shoes', 'bags and shoes', 'bags shoes', 'bags', 'shoes'] },
  { id: 'A50A92FA-BCB3-4716-9BD9-BEC629BEE735', name: 'Toys, Kids & Babies', aliases: ['toys-baby', 'toys, kids & babies', 'toys, kids & baby', 'toys & babies', 'toys', 'kids', 'baby'] },
  { id: '4B397425-26C1-4D0E-B6D2-96B0B03689DB', name: 'Sports & Outdoors', aliases: ['sports-outdoors', 'sports & outdoors', 'sports and outdoors', 'sports', 'outdoors'] },
  { id: 'D9E66BF8-4E81-4CAB-A425-AEDEC5FBFBF2', name: 'Consumer Electronics', aliases: ['consumer-electronics', 'consumer electronics', 'electronics'] },
  { id: 'E9FDC79A-8365-4CA6-AC23-64D971F08B8B', name: 'Phones & Accessories', aliases: ['phones-accessories', 'phones & accessories', 'phones and accessories', 'phones', 'phone accessories'] },
  { id: '1126E280-CB7D-418A-90AB-7118E2D97CCC', name: 'Computer & Office', aliases: ['computer-office', 'computer & office', 'computer and office', 'computer', 'office'] },
  { id: '6A5D2EB4-13BD-462E-A627-78CFED11B2A2', name: 'Home Improvement', aliases: ['home-improvement', 'home improvement', 'tools'] },
  { id: 'A2F799BE-FB59-428E-A953-296AA2673FCF', name: 'Automobiles & Motorcycles', aliases: ['automobiles', 'automobiles & motorcycles', 'automobiles and motorcycles', 'cars', 'motorcycles'] },
];

interface ParentMeta {
  parentName: string;
  parentId: string;
  subName?: string;
}

const aliasToIdMap = new Map<string, string>();
const idToParentMap = new Map<string, ParentMeta>();
const nameToParentMap = new Map<string, ParentMeta>();

for (const cat of CJ_TOP_LEVEL_CATEGORIES) {
  const pMeta: ParentMeta = { parentName: cat.name, parentId: cat.id };
  aliasToIdMap.set(cat.id.toLowerCase(), cat.id);
  aliasToIdMap.set(cat.name.toLowerCase(), cat.id);
  idToParentMap.set(cat.id.toLowerCase(), pMeta);
  nameToParentMap.set(cat.name.toLowerCase(), pMeta);
  for (const a of cat.aliases) {
    aliasToIdMap.set(a.toLowerCase(), cat.id);
  }
}

const COMMON_LEAF_MAP: Array<{ leaf: string; parentName: string }> = [
  { leaf: 'Woman Boots', parentName: 'Bags & Shoes' },
  { leaf: 'Man Boots', parentName: 'Bags & Shoes' },
  { leaf: 'Formal Shoes', parentName: 'Bags & Shoes' },
  { leaf: 'Smart Watches', parentName: 'Consumer Electronics' },
  { leaf: 'Necklace & Pendants', parentName: 'Jewelry & Watches' },
  { leaf: 'Pet Mats', parentName: 'Pet Supplies' },
  { leaf: 'Human Hair Wigs', parentName: 'Health, Beauty & Hair' },
  { leaf: 'Wall Lamps', parentName: 'Home Improvement' },
  { leaf: 'Silicone Cases', parentName: 'Phones & Accessories' },
  { leaf: 'Sports Accessories', parentName: 'Sports & Outdoors' },
  { leaf: 'Wide Leg Pants', parentName: "Women's Clothing" },
  { leaf: "Men's Sweaters", parentName: "Men's Clothing" },
  { leaf: 'Girl Clothing Sets', parentName: 'Toys, Kids & Babies' },
  { leaf: 'Home Office Storage', parentName: 'Home, Garden & Furniture' },
  { leaf: 'Office & School Supplies', parentName: 'Computer & Office' },
  { leaf: 'Helmet Headset', parentName: 'Automobiles & Motorcycles' },
];

for (const item of COMMON_LEAF_MAP) {
  const pCat = CJ_TOP_LEVEL_CATEGORIES.find((c) => c.name === item.parentName);
  if (pCat) {
    nameToParentMap.set(item.leaf.toLowerCase(), {
      parentName: pCat.name,
      parentId: pCat.id,
      subName: item.leaf,
    });
  }
}

export function registerCjCategoryTree(rawCategories: any[]) {
  if (!Array.isArray(rawCategories)) return;
  for (const cat of rawCategories) {
    const pId = cat.categoryFirstId || cat.categoryId || String(cat.id || '');
    const pName = cat.categoryFirstName || cat.categoryName || '';
    if (!pId || !pName) continue;

    const pMeta: ParentMeta = { parentName: pName, parentId: pId };
    aliasToIdMap.set(pId.toLowerCase(), pId);
    aliasToIdMap.set(pName.toLowerCase(), pId);
    idToParentMap.set(pId.toLowerCase(), pMeta);
    nameToParentMap.set(pName.toLowerCase(), pMeta);

    const subList = cat.categoryFirstList || cat.children || [];
    for (const sub of subList) {
      const sId = sub.categorySecondId || sub.categoryId || String(sub.id || '');
      const sName = sub.categorySecondName || sub.categoryName || '';
      if (sId) idToParentMap.set(sId.toLowerCase(), { parentName: pName, parentId: pId, subName: sName });
      if (sName) nameToParentMap.set(sName.toLowerCase(), { parentName: pName, parentId: pId, subName: sName });

      const leafList = sub.categorySecondList || sub.children || [];
      for (const leaf of leafList) {
        const lId = leaf.categoryThirdId || leaf.categoryId || String(leaf.id || '');
        const lName = leaf.categoryThirdName || leaf.categoryName || '';
        if (lId) idToParentMap.set(lId.toLowerCase(), { parentName: pName, parentId: pId, subName: lName });
        if (lName) nameToParentMap.set(lName.toLowerCase(), { parentName: pName, parentId: pId, subName: lName });
      }
    }
  }
}

export function resolveCjCategoryId(rawCat?: string): string | undefined {
  if (!rawCat) return undefined;
  const trimmed = rawCat.trim();
  const lower = trimmed.toLowerCase();
  if (!trimmed || lower === 'all' || lower === 'all categories') return undefined;
  return aliasToIdMap.get(lower) || trimmed;
}

export function formatCategoryBreadcrumb(categoryName?: string, categoryId?: string, queryCatId?: string): string {
  const rawName = (categoryName || '').trim();
  if (!rawName && !categoryId && !queryCatId) return 'General';

  if (queryCatId) {
    const resolvedQueryId = resolveCjCategoryId(queryCatId);
    const parentMeta = resolvedQueryId ? idToParentMap.get(resolvedQueryId.toLowerCase()) : undefined;
    if (parentMeta) {
      if (rawName && rawName.toLowerCase() !== parentMeta.parentName.toLowerCase()) {
        return `${parentMeta.parentName} › ${rawName}`;
      }
      return parentMeta.parentName;
    }
  }

  if (categoryId) {
    const byId = idToParentMap.get(categoryId.toLowerCase());
    if (byId) {
      if (rawName && rawName.toLowerCase() !== byId.parentName.toLowerCase()) {
        return `${byId.parentName} › ${rawName}`;
      }
      return byId.parentName;
    }
  }

  if (rawName) {
    const byName = nameToParentMap.get(rawName.toLowerCase());
    if (byName) {
      if (rawName.toLowerCase() !== byName.parentName.toLowerCase()) {
        return `${byName.parentName} › ${rawName}`;
      }
      return byName.parentName;
    }
  }

  return rawName || 'General';
}
