import { MENU } from './menu.mjs';

// The photographic ways into the menu, used on the homepage and at the top of the menu page.
// Each one links to a real menu category. Prices are read from the menu, never typed here.
const TILES = [
  { label: 'Breakfast', cat: 'set-breakfast', crop: 'full-english-fries-2', alt: 'A cooked breakfast with bacon, egg, sausage, beans and chips' },
  { label: 'Brunch', cat: 'brunch', crop: 'egg-royal-salad', alt: 'Egg Benedict on English muffins with a colourful salad' },
  { label: 'Lunch', cat: 'lunch', crop: 'grilled-chicken-rice-plate', alt: 'Grilled chicken with rice, salad and pitta bread' },
  { label: 'Burgers', cat: 'burgers', crop: 'cheeseburger', alt: 'A burger with cheese, lettuce and onion in a sesame bun' },
  { label: 'Sweet & Savoury', cat: 'sweet-savoury', crop: 'french-toast-close', alt: 'French toast topped with banana, berries and kiwi' },
  { label: 'Coffee & Tea', cat: 'hot-drinks', crop: 'latte-art', alt: 'A milky coffee with leaf art in a stoneware cup' },
];

const lowestPrice = (id) => {
  const values = MENU.find((c) => c.id === id).items
    .flatMap((i) => (i.prices ? Object.values(i.prices) : [i.price]))
    .map(Number)
    .filter((v) => v >= 1); // Leaves out add-ons such as extra syrup.
  return Math.min(...values).toFixed(2);
};

export const EXPLORE = TILES.map((t) => ({ ...t, from: lowestPrice(t.cat) }));

// Dishes whose photo was checked against the printed description. Everything else stays text only,
// so the page stays fast and no plate is shown for a dish it doesn't match.
export const DISH_PHOTOS = {
  'set-breakfast/Full Olympic': 'full-english-fries',
  'set-breakfast/Mediterranean Breakfast': 'mediterranean-breakfast',
  'set-breakfast/Titan Breakfast': 'titan-breakfast',
  'brunch/Egg Benedict': 'egg-royal-salad',
  'brunch/Sicily Coast': 'avocado-toast-brie-fries',
  'brunch/Avo Breeze': 'avocado-toast-poached-egg-fries',
  'sweet-savoury/Red Ring': 'pancake-ring-special',
  'sweet-savoury/Blue Ring': 'french-toast-fruit',
  'lunch/Grilled Chicken': 'grilled-chicken-rice-plate',
  'burgers/Chicken Burger': 'chicken-burger',
  'jacket-potato/Tuna Mayo': 'jacket-potato-tuna',
  'sandwiches/Bacon': 'bacon-roll',
  'cold-drinks/Iced Coffee': 'iced-coffee',
  'hot-drinks/Matcha Latte': 'matcha-latte',
  'freshly-squeezed/Orange Juice': 'orange-juice',
};

// Groups for the category dropdown, following the menu organisation in the brand guidelines.
export const MENU_GROUPS = [
  { label: 'Breakfast', ids: ['set-breakfast', 'veggie-breakfast', 'omelettes', 'on-toast'] },
  { label: 'Brunch and sweet', ids: ['brunch', 'sweet-savoury', 'desserts'] },
  { label: 'Lunch and homemade', ids: ['lunch', 'homemade-specials', 'sunday-roast'] },
  { label: 'Burgers, wraps and salads', ids: ['burgers', 'wraps', 'salads', 'jacket-potato'] },
  { label: 'Sandwiches and paninis', ids: ['sandwiches', 'paninis'] },
  { label: 'Sides and kids', ids: ['appetisers', 'kids-meal', 'extras'] },
  { label: 'Drinks', ids: ['hot-drinks', 'cold-drinks', 'freshly-squeezed'] },
];
