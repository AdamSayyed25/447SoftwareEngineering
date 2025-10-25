export const LOCATIONS = [
  { id: 'caton', name: 'Catons Café', hours: '8:00 - 20:00', address: 'Campus Center' },
  { id: 'dunk', name: "Dunkin' @ Commons", hours: '7:00 - 17:00', address: 'Commons' },
  { id: 'yummy', name: 'Yummy Noodles', hours: '11:00 - 22:00', address: 'Science & Engineering' }
]

export const MENUS = {
  caton: [
    { id: 'c1', name: 'Chicken Wrap', desc: 'Grilled chicken, lettuce, sauce', price: 7.5 },
    { id: 'c2', name: 'Veggie Salad', desc: 'Greens, tomato, vinaigrette', price: 6.0 }
  ],
  dunk: [
    { id: 'd1', name: 'Coffee (16 oz)', desc: 'Fresh brewed', price: 2.5 },
    { id: 'd2', name: 'Bagel', desc: 'Plain or everything', price: 1.99 }
  ],
  yummy: [
    { id: 'y1', name: 'Beef Ramen', desc: 'Savory broth, noodles', price: 9.0 },
    { id: 'y2', name: 'Veggie Stir Fry', desc: 'Seasonal veggies, rice', price: 8.0 }
  ]
}

export const DROP_OFFS = [
  { code: 'SH', name: 'Sherman Hall' },
  { code: 'CC', name: 'Campus Center' },
  { code: 'ENG', name: 'Engineering Building' }
]
