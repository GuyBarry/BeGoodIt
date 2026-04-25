export interface ClosetItem {
  id: number;
  name: string;
  type: string;
  image: string;
}

export const closetItems: ClosetItem[] = [
  { id: 1, name: 'White Shirt',    type: 'top',       image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=150&h=200&fit=crop' },
  { id: 2, name: 'Navy Blazer',    type: 'outerwear', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop' },
  { id: 3, name: 'Black Jeans',    type: 'bottom',    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=150&h=200&fit=crop' },
  { id: 4, name: 'Cream Sweater',  type: 'top',       image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=150&h=200&fit=crop' },
  { id: 5, name: 'Brown Jacket',   type: 'outerwear', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150&h=200&fit=crop' },
  { id: 6, name: 'Floral Dress',   type: 'dress',     image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&h=200&fit=crop' },
  { id: 7, name: 'Beige Chinos',   type: 'bottom',    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=150&h=200&fit=crop' },
  { id: 8, name: 'Striped Tee',    type: 'top',       image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=150&h=200&fit=crop' },
];

export const categories = ['all', 'top', 'bottom', 'outerwear', 'dress'];
