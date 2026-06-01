export interface Product {
  id: number;
  capsuleId?: number | null;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  creatorName: string;
  creatorEmail: string;
}

export const products: Product[] = [
  { 
    id: 1, 
    name: "Послание потомкам", 
    price: 2999, 
    category: "Личное", 
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500", 
    description: "Как мы жили в 2024 году",
    creatorName: "Алексей",
    creatorEmail: "alex@example.com"
  },
  { 
    id: 2, 
    name: "Письмо в 2030 год", 
    price: 1999, 
    category: "Личное", 
    image: "https://images.unsplash.com/photo-1484807352052-23338990c6c6?w=500",
    description: "Мои цели на десятилетие",
    creatorName: "Мария",
    creatorEmail: "maria@example.com"
  },
  { 
    id: 3, 
    name: "Мечты о космосе", 
    price: 3999, 
    category: "Мечты", 
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500",
    description: "Записка о полете на Марс",
    creatorName: "Демо пользователь",
    creatorEmail: "demo@memorylane.com"
  },
  { 
    id: 4, 
    name: "Секретный рецепт", 
    price: 1499, 
    category: "Личное", 
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500",
    description: "Бабушкин пирог",
    creatorName: "Ирина",
    creatorEmail: "irina@example.com"
  },
  { 
    id: 5, 
    name: "Капсула времени 2024", 
    price: 4999, 
    category: "Публичное", 
    image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=500",
    description: "События этого года",
    creatorName: "Никита",
    creatorEmail: "nikita@example.com"
  },
  { 
    id: 6, 
    name: "Путешествие в будущее", 
    price: 2499, 
    category: "Мечты", 
    image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500",
    description: "Маршрут моей мечты",
    creatorName: "София",
    creatorEmail: "sofia@example.com"
  }
];