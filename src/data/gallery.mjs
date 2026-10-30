// Captions were checked against each photo and the printed menu. Generic wording is used
// where the plate could not be matched to a single menu item with confidence.
// menu: the category a visitor can jump to from the photo viewer.
export const GROUPS = [
  { id: 'breakfast', title: 'Breakfast', menu: 'set-breakfast', link: 'See Set Breakfast' },
  { id: 'brunch', title: 'Brunch and Rings', menu: 'brunch', link: 'See Brunch' },
  { id: 'lunch', title: 'Lunch and burgers', menu: 'lunch', link: 'See Lunch' },
  { id: 'drinks', title: 'Drinks', menu: 'hot-drinks', link: 'See Hot Drinks' },
  { id: 'table', title: 'For the table' },
];

export const PHOTOS = [
  { group: 'breakfast', img: 'mediterranean-breakfast', label: 'Mediterranean Breakfast', menu: 'set-breakfast' },
  { group: 'breakfast', img: 'titan-breakfast', label: 'Titan Breakfast', menu: 'set-breakfast' },
  { group: 'breakfast', img: 'full-english-fries', label: 'Full Olympic', menu: 'set-breakfast' },
  { group: 'breakfast', img: 'full-english-hash-browns', label: 'Cooked breakfast with hash browns', menu: 'set-breakfast' },
  { group: 'breakfast', img: 'full-english-fritter', label: 'Cooked breakfast with bubble & squeak', menu: 'set-breakfast' },
  { group: 'breakfast', img: 'full-english-fries-2', label: 'Cooked breakfast with chips and toast', menu: 'set-breakfast', wide: true },
  { group: 'breakfast', img: 'full-english-bread', label: 'Cooked breakfast with bread', menu: 'set-breakfast' },
  { group: 'breakfast', img: 'bacon-roll', label: 'Bacon roll', menu: 'sandwiches' },
  { group: 'brunch', img: 'french-toast-fruit', label: 'Blue Ring with French toast', menu: 'sweet-savoury' },
  { group: 'brunch', img: 'pancake-ring-special', label: 'Red Ring with pancakes', menu: 'sweet-savoury' },
  { group: 'brunch', img: 'egg-royal-salad', label: 'Egg Benedict with salad', menu: 'brunch' },
  { group: 'brunch', img: 'avocado-toast-poached-egg-fries', label: 'Avo Breeze', menu: 'brunch' },
  { group: 'brunch', img: 'avocado-toast-brie-fries', label: 'Sicily Coast', menu: 'brunch' },
  { group: 'lunch', img: 'grilled-chicken-rice-plate', label: 'Grilled Chicken with rice and salad', menu: 'lunch' },
  { group: 'lunch', img: 'cheeseburger', label: 'Burger with cheese, lettuce and onion', menu: 'burgers' },
  { group: 'lunch', img: 'chicken-burger', label: 'Chicken Burger', menu: 'burgers' },
  { group: 'lunch', img: 'jacket-potato-tuna', label: 'Jacket potato with tuna mayo', menu: 'jacket-potato' },
  { group: 'lunch', img: 'baguette-sandwich', label: 'Baguette', menu: 'sandwiches' },
  { group: 'drinks', img: 'latte-art', label: 'Coffee with latte art', menu: 'hot-drinks' },
  { group: 'drinks', img: 'chocolate-milkshake', label: 'Chocolate milkshake', menu: 'cold-drinks' },
  { group: 'drinks', img: 'matcha-latte', label: 'Matcha Latte', menu: 'hot-drinks' },
  { group: 'drinks', img: 'iced-coffee', label: 'Iced Coffee', menu: 'cold-drinks' },
  { group: 'drinks', img: 'orange-juice', label: 'Freshly squeezed orange juice', menu: 'freshly-squeezed' },
  { group: 'table', img: 'table-spread-overhead-1', label: 'A table full of Olympic Cafe favourites', wide: true },
  { group: 'table', img: 'table-spread-overhead-2', label: 'Brunch for the table', wide: true },
];
