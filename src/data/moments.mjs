// The homepage's "Right now" suggestions. Picks only use dishes with a checked photo (DISH_PHOTOS in explore.mjs).
// These are suggestions, not serving times: nothing here may imply a dish is unavailable at other times.
export const MOMENTS = [
  {
    id: 'early',
    until: '10:30',
    heading: "Up early? We're already cooking.",
    picks: [
      { cat: 'set-breakfast', name: 'Titan Breakfast' },
      { cat: 'sandwiches', name: 'Bacon', label: 'Bacon Roll', desc: 'In a roll, sandwich or baguette' },
      { cat: 'sweet-savoury', name: 'Red Ring' },
    ],
  },
  {
    id: 'brunch',
    until: '12:00',
    heading: 'Good time for brunch.',
    picks: [
      { cat: 'brunch', name: 'Sicily Coast' },
      { cat: 'brunch', name: 'Egg Benedict' },
      { cat: 'sweet-savoury', name: 'Blue Ring' },
    ],
  },
  {
    id: 'lunch',
    until: '24:00',
    heading: 'Ready for lunch?',
    picks: [
      { cat: 'lunch', name: 'Grilled Chicken' },
      { cat: 'burgers', name: 'Chicken Burger' },
      { cat: 'jacket-potato', name: 'Tuna Mayo', label: 'Tuna Mayo Jacket', desc: 'Jacket potato served with salad' },
    ],
  },
];

// On an open Sunday from this time, the roast takes over. Owner to confirm the time (docs/HANDOVER.md).
export const ROAST_FROM = '11:00';
export const ROAST_HEADING = "It's Sunday, so the roast is on.";
export const DEFAULT_HEADING = 'A few good places to start.';
export const NEXT_VISIT_HEADING = 'For your next visit.';
