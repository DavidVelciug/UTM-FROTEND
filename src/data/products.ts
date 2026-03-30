export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

export const products: Product[] = [
  { 
    id: 1, 
    name: "Послание потомкам", 
    price: 2999, 
    category: "Личное", 
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500", // Красивый закат/рассвет как символ передачи знаний
    description: "Как мы жили в 2024 году"
  },
  { 
    id: 2, 
    name: "Письмо в 2030 год", 
    price: 1999, 
    category: "Личное", 
    image: "https://images.unsplash.com/photo-1484807352052-23338990c6c6?w=500", // Письмо в бутылке/старинное письмо
    description: "Мои цели на десятилетие"
  },
  { 
    id: 3, 
    name: "Мечты о космосе", 
    price: 3999, 
    category: "Мечты", 
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500",
    description: "Записка о полете на Марс"
  },
  { 
    id: 4, 
    name: "Секретный рецепт", 
    price: 1499, 
    category: "Личное", 
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500",
    description: "Бабушкин пирог"
  },
  { 
    id: 5, 
    name: "Капсула времени 2024", 
    price: 4999, 
    category: "Публичное", 
    image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=500",
    description: "События этого года"
  },
  { 
    id: 6, 
    name: "Путешествие в будущее", 
    price: 2499, 
    category: "Мечты", 
    image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500",
    description: "Маршрут моей мечты"
  }
];