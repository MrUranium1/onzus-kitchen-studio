export interface Product {
  id: number | string;
  name: string;
  price: number;
  img: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  rating: number;
  reviews: number;
  ribbon?: string;
  featured?: boolean;
  featuredOrder?: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Chocolate Fudge Cake',
    price: 850,
    img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    category: 'cakes',
    shortDescription: 'Rich 3-layer dark chocolate',
    longDescription: 'Rich 3-layer dark chocolate cake with silky fudge frosting. Our #1 bestseller!',
    rating: 5,
    reviews: 42,
    ribbon: 'BESTSELLER'
  },
  {
    id: 2,
    name: 'Red Velvet Cake',
    price: 920,
    img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
    category: 'cakes',
    shortDescription: 'Cream cheese frosted elegance',
    longDescription: 'Classic red velvet with smooth cream cheese frosting.',
    rating: 5,
    reviews: 36
  },
  {
    id: 3,
    name: 'Vanilla Chiffon Cake',
    price: 750,
    img: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&q=80',
    category: 'cakes',
    shortDescription: 'Light & airy with whipped cream',
    longDescription: 'Light & airy vanilla cake with whipped cream.',
    rating: 4,
    reviews: 28
  },
  {
    id: 4,
    name: 'Caramel Drizzle Cake',
    price: 980,
    img: 'https://images.unsplash.com/photo-1562440499-64b9a2a2ca62?w=800&q=80',
    category: 'cakes specials',
    shortDescription: 'Salted caramel & toffee crunch',
    longDescription: 'Salted caramel cake with toffee crunch and caramel drizzle.',
    rating: 5,
    reviews: 19,
    ribbon: 'SPECIAL'
  },
  {
    id: 5,
    name: 'Butter Croissants (6 pcs)',
    price: 320,
    img: 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=800&q=80',
    category: 'pastries',
    shortDescription: 'Flaky, golden & buttery',
    longDescription: 'Flaky golden butter croissants (6 pcs)',
    rating: 5,
    reviews: 67,
    ribbon: 'POPULAR'
  },
  {
    id: 6,
    name: 'Fruit Danish Pastry (4 pcs)',
    price: 280,
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    category: 'pastries',
    shortDescription: 'Jam-filled flaky layers',
    longDescription: 'Jam-filled flaky Danish pastry (4 pcs)',
    rating: 4,
    reviews: 31
  },
  {
    id: 7,
    name: 'Cinnamon Rolls (4 pcs)',
    price: 360,
    img: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800&q=80',
    category: 'pastries',
    shortDescription: 'Glazed with vanilla icing',
    longDescription: 'Soft cinnamon rolls glazed with vanilla icing (4 pcs)',
    rating: 5,
    reviews: 53
  },
  {
    id: 8,
    name: 'Choco Chip Cookies (8 pcs)',
    price: 220,
    img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80',
    category: 'cookies',
    shortDescription: 'Chewy centre, crisp edges',
    longDescription: 'Classic chewy chocolate chip cookies (8 pcs)',
    rating: 5,
    reviews: 89,
    ribbon: 'BESTSELLER'
  },
  {
    id: 9,
    name: 'Oatmeal Raisin Cookies (8 pcs)',
    price: 200,
    img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80',
    category: 'cookies',
    shortDescription: 'Wholesome & spiced',
    longDescription: 'Wholesome oatmeal cookies with sweet raisins (8 pcs)',
    rating: 4,
    reviews: 44
  },
  {
    id: 10,
    name: 'Butter Shortbread (10 pcs)',
    price: 240,
    img: 'https://images.unsplash.com/photo-1612201142855-7873bc1661b4?w=800&q=80',
    category: 'cookies',
    shortDescription: 'Melt-in-mouth Scottish style',
    longDescription: 'Classic melt-in-mouth butter shortbread cookies (10 pcs)',
    rating: 5,
    reviews: 57
  },
  {
    id: 11,
    name: 'Sourdough Loaf',
    price: 450,
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    category: 'breads',
    shortDescription: 'Tangy, crusty, artisan baked',
    longDescription: 'Tangy artisan sourdough bread with crispy crust',
    rating: 5,
    reviews: 38
  },
  {
    id: 12,
    name: 'Whole Wheat Bread',
    price: 380,
    img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&q=80',
    category: 'breads',
    shortDescription: 'Nutty, healthy sandwich loaf',
    longDescription: 'Nutty and healthy whole wheat sandwich loaf',
    rating: 4,
    reviews: 25
  },
  {
    id: 13,
    name: 'Garlic Herb Focaccia',
    price: 400,
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    category: 'breads',
    shortDescription: 'Olive oil, rosemary & roasted garlic',
    longDescription: 'Soft focaccia with olive oil, rosemary and roasted garlic',
    rating: 5,
    reviews: 22
  },
  {
    id: 14,
    name: 'Blueberry Muffins (4 pcs)',
    price: 260,
    img: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&q=80',
    category: 'muffins',
    shortDescription: 'Bursting with fresh blueberries',
    longDescription: 'Bursting with fresh juicy blueberries (4 pcs)',
    rating: 5,
    reviews: 61,
    ribbon: 'POPULAR'
  },
  {
    id: 15,
    name: 'Choco Chip Muffins (4 pcs)',
    price: 270,
    img: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=80',
    category: 'muffins',
    shortDescription: 'Double chocolate dream',
    longDescription: 'Double chocolate dream muffins (4 pcs)',
    rating: 5,
    reviews: 48
  },
  {
    id: 16,
    name: 'Banana Walnut Muffin (4 pcs)',
    price: 250,
    img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80',
    category: 'muffins',
    shortDescription: 'Moist, nutty & naturally sweet',
    longDescription: 'Moist banana muffin with crunchy walnuts (4 pcs)',
    rating: 4,
    reviews: 33
  },
  {
    id: 17,
    name: 'Chocolate Éclairs (4 pcs)',
    price: 340,
    img: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800&q=80',
    category: 'specials',
    shortDescription: 'Custard-filled choux pastry',
    longDescription: 'Custard-filled choux pastry with chocolate glaze (4 pcs)',
    rating: 5,
    reviews: 27,
    ribbon: 'SPECIAL'
  },
  {
    id: 18,
    name: 'French Macarons (8 pcs)',
    price: 480,
    img: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?w=800&q=80',
    category: 'specials',
    shortDescription: 'Assorted flavours gift box',
    longDescription: 'Assorted flavour French macarons gift box (8 pcs)',
    rating: 5,
    reviews: 52,
    ribbon: 'SPECIAL'
  }
];
