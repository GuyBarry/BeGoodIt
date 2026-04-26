export interface MockOutfitItem {
  id: number;
  name: string;
  image: string;
}

export interface MockOutfit {
  id: number;
  name: string;
  image: string;
  clothingItems: MockOutfitItem[];
}

export const mockOutfits: MockOutfit[] = [
  {
    id: 1,
    name: 'Casual Friday',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=400&fit=crop',
    clothingItems: [
      { id: 1, name: 'White Button Shirt', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=150&h=200&fit=crop' },
      { id: 2, name: 'Black Skinny Jeans', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=150&h=200&fit=crop' },
      { id: 3, name: 'White Sneakers',     image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=200&fit=crop' },
    ],
  },
  {
    id: 2,
    name: 'Date Night',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop',
    clothingItems: [
      { id: 1, name: 'Navy Blazer',          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop' },
      { id: 2, name: 'Black Midi Dress',     image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=150&h=200&fit=crop' },
      { id: 3, name: 'Black Heeled Mules',   image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=150&h=200&fit=crop' },
      { id: 4, name: 'Beige Bucket Bag',     image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=150&h=200&fit=crop' },
    ],
  },
  {
    id: 3,
    name: 'Work Meeting',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=300&h=400&fit=crop',
    clothingItems: [
      { id: 1, name: 'Navy Blazer',         image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop' },
      { id: 2, name: 'White Button Shirt',  image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=150&h=200&fit=crop' },
      { id: 3, name: 'Beige Chinos',        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=150&h=200&fit=crop' },
    ],
  },
  {
    id: 4,
    name: 'Weekend Brunch',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=300&h=400&fit=crop',
    clothingItems: [
      { id: 1, name: 'Floral Summer Dress',   image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&h=200&fit=crop' },
      { id: 2, name: 'White Sneakers',        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=200&fit=crop' },
      { id: 3, name: 'Beige Bucket Bag',      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=150&h=200&fit=crop' },
    ],
  },
];

// Filter values match server's garment_category and color_group names exactly
export const CATEGORIES = ['All', 'Top', 'Bottom', 'Dress', 'Shoes', 'Outerwear', 'Accessories', 'Activewear'];
export const COLORS     = ['All', 'Black', 'White', 'Blue', 'Gray', 'Beige', 'Brown', 'Pink', 'Red'];
export const SEASONS    = ['All', 'Spring', 'Summer', 'Fall', 'Winter', 'All-Season'];
