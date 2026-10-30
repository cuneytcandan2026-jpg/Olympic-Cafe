// Art-directed crops of the photos in assets/img, made at build time. Every source is 1440x810.
// Square crops default to the full height of the centre of the frame, where the plate sits.
const square = (src, { name = src, left = 315, top = 0, size = 810, widths = [160, 320, 640] } = {}) =>
  ({ name, src, left, top, width: size, height: size, widths });

export const CROPS = [
  // Long-table tiles and the menu strip
  square('full-english-fries-2', { left: 250, top: 50, size: 760 }),
  square('egg-royal-salad'),
  square('grilled-chicken-rice-plate'),
  square('cheeseburger', { left: 370, top: 50, size: 700 }),
  square('french-toast-fruit', { name: 'french-toast-close', left: 690, top: 210, size: 420, widths: [160, 320, 420] }),
  square('latte-art', { left: 340, top: 0, size: 760 }),
  // Plates for the rings, pairings, signature rows and menu thumbnails
  square('french-toast-fruit'),
  square('pancake-ring-special'),
  square('full-english-fries', { left: 312, top: 130, size: 680 }),
  square('mediterranean-breakfast', { left: 301, top: 130, size: 680 }),
  square('titan-breakfast', { left: 318, top: 147, size: 660 }),
  square('avocado-toast-brie-fries'),
  square('avocado-toast-poached-egg-fries'),
  square('chicken-burger', { left: 340, top: 30, size: 760 }),
  square('jacket-potato-tuna'),
  square('bacon-roll', { left: 330, top: 13, size: 780 }),
  square('iced-coffee'),
  square('matcha-latte'),
  square('orange-juice'),
  square('chocolate-milkshake'),
  // The large signature photo: closer in than the full frame, keeping the toast
  { name: 'mediterranean-feature', src: 'mediterranean-breakfast', left: 240, top: 40, width: 1000, height: 770, widths: [480, 800, 1000] },
];

export const cropOf = (name) => {
  const crop = CROPS.find((c) => c.name === name);
  if (!crop) throw new Error(`Unknown crop: ${name}`);
  return crop;
};
