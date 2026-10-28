const SEED_DATA = {
  villages: ["Ziro Valley", "Pasighat Hub", "Bomdila", "Tezu"],

  crops: [
    { id: "1", name: "Arunachal Kiwi", price: 140, icon: "🥝", unit: "kg" },
    { id: "2", name: "Fresh Ginger", price: 65, icon: "🫚", unit: "kg" },
    { id: "3", name: "Large Cardamom", price: 850, icon: "🫛", unit: "kg" },
    { id: "4", name: "Organic Orange", price: 80, icon: "🍊", unit: "kg" }
  ],

  initialPools: [
    {
      id: "P1",
      village: "Ziro Valley",
      crop: "Arunachal Kiwi",
      currentKg: 420,
      targetKg: 500,
      farmers: 4
    },
    {
      id: "P2",
      village: "Pasighat Hub",
      crop: "Fresh Ginger",
      currentKg: 500,
      targetKg: 500,
      farmers: 5
    },
    {
      id: "P3",
      village: "Bomdila",
      crop: "Large Cardamom",
      currentKg: 180,
      targetKg: 250,
      farmers: 2
    }
  ]
};