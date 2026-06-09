import type {
  AdminStatsDto,
  CapsuleLocationDto,
  CategoryDto,
  ModerationReportDto,
  ProductDto,
  TimeCapsuleDto,
  UserAccountDto,
} from '../types/api';

export const mockUsers: UserAccountDto[] = [
  {
    id: 1, email: 'demo@memorylane.com', displayName: 'Демо пользователь',
    role: 'user', password: 'demo123',
    createdAtUtc: '2024-01-15T10:00:00Z',
    notifyEmailEnabled: true, notifyPushEnabled: true, loginAlertsEnabled: true,
  },
  {
    id: 2, email: 'maria@example.com', displayName: 'Мария',
    role: 'moderator', password: 'maria123',
    createdAtUtc: '2024-02-20T10:00:00Z',
    notifyEmailEnabled: false, notifyPushEnabled: true, loginAlertsEnabled: true,
  },
  {
    id: 3, email: 'admin.one@memorylane.com', displayName: 'Главный админ',
    role: 'admin', password: 'AdminOne123!',
    createdAtUtc: '2024-01-01T10:00:00Z',
    notifyEmailEnabled: true, notifyPushEnabled: true, loginAlertsEnabled: true,
  },
  {
    id: 4, email: 'admin.two@memorylane.com', displayName: 'Резервный админ',
    role: 'admin', password: 'AdminTwo123!',
    createdAtUtc: '2024-01-01T10:00:00Z',
    notifyEmailEnabled: true, notifyPushEnabled: false, loginAlertsEnabled: false,
  },
  {
    id: 5, email: 'alex@example.com', displayName: 'Алексей',
    role: 'user', password: 'password123',
    createdAtUtc: '2024-03-10T10:00:00Z',
    notifyEmailEnabled: true, notifyPushEnabled: false, loginAlertsEnabled: false,
  },
  {
    id: 6, email: 'irina@example.com', displayName: 'Ирина',
    role: 'user', password: 'password123',
    createdAtUtc: '2024-04-05T10:00:00Z',
    notifyEmailEnabled: true, notifyPushEnabled: true, loginAlertsEnabled: true,
  },
  {
    id: 7, email: 'nikita@example.com', displayName: 'Никита',
    role: 'user', password: 'password123',
    createdAtUtc: '2024-05-12T10:00:00Z',
    notifyEmailEnabled: false, notifyPushEnabled: true, loginAlertsEnabled: false,
  },
  {
    id: 8, email: 'sofia@example.com', displayName: 'София',
    role: 'user', password: 'password123',
    createdAtUtc: '2024-06-01T10:00:00Z',
    notifyEmailEnabled: true, notifyPushEnabled: false, loginAlertsEnabled: true,
  },
  {
    id: 9, email: 'user@memorylane.com', displayName: 'Тестовый пользователь',
    role: 'user', password: 'password123',
    createdAtUtc: '2024-07-20T10:00:00Z',
    notifyEmailEnabled: true, notifyPushEnabled: true, loginAlertsEnabled: false,
  },
];

export const mockCategories: CategoryDto[] = [
  { id: 1, name: 'Личное' },
  { id: 2, name: 'Мечты' },
  { id: 3, name: 'Публичное' },
];

function pastDate(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
}

function futureDate(daysAhead: number): string {
  return new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();
}

export const mockCapsules: TimeCapsuleDto[] = [
  {
    id: 2, ownerUserId: 1, ownerDisplayName: 'Демо пользователь',
    contentType: 0, title: 'Личное письмо будущему',
    textContent: 'Содержимое скрыто до даты открытия.',
    openAtUtc: futureDate(30), createdAtUtc: pastDate(28),
    recipientEmail: 'demo@memorylane.com', isPublic: false,
    previewText: 'Послание самому себе в будущее',
  },
  {
    id: 3, ownerUserId: 2, ownerDisplayName: 'Мария',
    contentType: 1, title: 'Ссылка на воспоминание',
    linkUrl: 'https://memorylane.example.com/story/1',
    openAtUtc: pastDate(2), createdAtUtc: pastDate(30),
    recipientEmail: 'maria@example.com', isPublic: true,
    previewText: 'Интересная история из жизни',
    openedAtUtc: pastDate(2), openedFrom: 'Публичная капсула',
  },
  {
    id: 4, ownerUserId: 3, ownerDisplayName: 'Главный админ',
    contentType: 0, title: 'Послание потомкам',
    textContent: 'Как мы жили в 2024 году. Записываю свои мысли, чтобы через много лет вспомнить, каким был этот удивительный год.',
    openAtUtc: pastDate(10), createdAtUtc: pastDate(200),
    recipientEmail: 'admin.one@memorylane.com', isPublic: false,
    previewText: 'Как мы жили в 2024 году',
    openedAtUtc: pastDate(10), openedFrom: 'Капсула каталога',
  },
  {
    id: 5, ownerUserId: 3, ownerDisplayName: 'Главный админ',
    contentType: 0, title: 'Письмо в 2030 год',
    textContent: 'Мои цели на десятилетие:\n\n1. Научиться играть на гитаре\n2. Посетить не менее 10 стран\n3. Написать книгу\n4. Выучить испанский язык\n5. Пробежать марафон\n\nНадеюсь, к 2030 году я смогу осуществить всё задуманное! Если ты читаешь это — напомни мне, что я обещал себе это.',
    openAtUtc: pastDate(10), createdAtUtc: pastDate(180),
    recipientEmail: 'admin.one@memorylane.com', isPublic: false,
    previewText: 'Мои цели на десятилетие',
    openedAtUtc: pastDate(10), openedFrom: 'Капсула каталога',
  },
  {
    id: 6, ownerUserId: 3, ownerDisplayName: 'Главный админ',
    contentType: 0, title: 'Мечты о космосе',
    textContent: 'Когда-нибудь человество обязательно полетит на Марс. Я мечтаю увидеть этот момент своими глазами. Представляю, как стою на красной планете и смотрю на Землю в иллюминатор. До встречи на Марсе!',
    openAtUtc: pastDate(15), createdAtUtc: pastDate(90),
    recipientEmail: 'admin.one@memorylane.com', isPublic: false,
    previewText: 'Записка о полете на Марс',
    openedAtUtc: pastDate(15), openedFrom: 'Капсула каталога',
  },
  {
    id: 7, ownerUserId: 3, ownerDisplayName: 'Главный админ',
    contentType: 0, title: 'Секретный рецепт',
    textContent: 'Бабушкин пирог с яблоками:\n\nТесто:\n- Мука 300г\n- Масло сливочное 150г\n- Сахар 100г\n- Яйцо 1шт\n- Щепотка соли\n\nНачинка:\n- Яблоки 4шт\n- Корица 1ч.л.\n- Сахар 2ст.л.\n\nВыпекать 40 минут при 180°C.\n\nСекретный ингредиент — любовь!',
    openAtUtc: pastDate(20), createdAtUtc: pastDate(365),
    recipientEmail: 'admin.one@memorylane.com', isPublic: false,
    previewText: 'Бабушкин пирог',
    openedAtUtc: pastDate(20), openedFrom: 'Капсула каталога',
  },
  {
    id: 8, ownerUserId: 3, ownerDisplayName: 'Главный админ',
    contentType: 0, title: 'Капсула времени 2024',
    textContent: 'События 2024 года, которые нельзя забыть:\n\n- Технологический бум: ИИ проник во все сферы жизни\n- Космические миссии: новые открытия на Луне и Марсе\n- Спортивные рекорды: невероятные достижения на Олимпиаде\n- Культурные события: фильмы, музыка и искусство, которые объединили миллионы\n\nЭтот год навсегда останется в наших сердцах.',
    openAtUtc: pastDate(5), createdAtUtc: pastDate(45),
    recipientEmail: 'admin.one@memorylane.com', isPublic: true,
    previewText: 'События этого года',
    openedAtUtc: pastDate(5), openedFrom: 'Капсула каталога',
  },
  {
    id: 9, ownerUserId: 3, ownerDisplayName: 'Главный админ',
    contentType: 0, title: 'Путешествие в будущее',
    textContent: 'Маршрут моей мечты:\n\nДень 1-3: Токио, Япония\nДень 4-6: Киото, Япония\nДень 7-10: Бангкок, Таиланд\nДень 11-14: Бали, Индонезия\nДень 15-18: Сидней, Австралия\nДень 19-21: Новая Зеландия\n\nОднажды я обязательно отправлюсь в это путешествие!',
    openAtUtc: pastDate(3), createdAtUtc: pastDate(120),
    recipientEmail: 'admin.one@memorylane.com', isPublic: false,
    previewText: 'Маршрут моей мечты',
    openedAtUtc: pastDate(3), openedFrom: 'Капсула каталога',
  },
  {
    id: 10, ownerUserId: 1, ownerDisplayName: 'Демо пользователь',
    contentType: 0, title: 'Гео-капсула в парке Горького',
    textContent: 'Я сидел на этой скамейке летом 2025 и думал о жизни. Если ты читаешь это рядом с этим местом — значит, технологии действительно творят чудеса.',
    fileStoragePath: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    openAtUtc: pastDate(1), createdAtUtc: pastDate(60),
    recipientEmail: 'demo@memorylane.com', isPublic: false,
    previewText: 'Воспоминание из парка Горького',
    openedAtUtc: pastDate(1), openedFrom: 'Гео-капсула',
  },
  {
    id: 11, ownerUserId: 2, ownerDisplayName: 'Мария',
    contentType: 0, title: 'Тайник на набережной',
    textContent: 'Это место всегда было для меня особенным. Закаты здесь невероятные!',
    fileStoragePath: 'https://images.unsplash.com/photo-1504198322253-cfa87a0ff25f?w=500',
    openAtUtc: pastDate(2), createdAtUtc: pastDate(45),
    recipientEmail: 'maria@example.com', isPublic: false,
    previewText: 'Вид на набережную',
    openedAtUtc: pastDate(2), openedFrom: 'Гео-капсула',
  },
];

export const mockLocations: CapsuleLocationDto[] = [
  { id: 2, capsuleId: 10, latitude: 55.7297, longitude: 37.6010, placeLabel: 'Парк Горького, Москва' },
  { id: 3, capsuleId: 11, latitude: 55.7385, longitude: 37.6115, placeLabel: 'Набережная Воробьёвых гор, Москва' },
];

export const mockProducts: ProductDto[] = [
  { id: 1, name: 'Послание потомкам', price: 2999, description: 'Как мы жили в 2024 году', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500', capsuleId: 4, categoryId: 1, category: 'Личное' },
  { id: 2, name: 'Письмо в 2030 год', price: 1999, description: 'Мои цели на десятилетие', image: 'https://images.unsplash.com/photo-1484807352052-23338990c6c6?w=500', capsuleId: 5, categoryId: 1, category: 'Личное' },
  { id: 3, name: 'Мечты о космосе', price: 3999, description: 'Записка о полете на Марс', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500', capsuleId: 6, categoryId: 2, category: 'Мечты' },
  { id: 4, name: 'Секретный рецепт', price: 1499, description: 'Бабушкин пирог', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500', capsuleId: 7, categoryId: 1, category: 'Личное' },
  { id: 5, name: 'Капсула времени 2024', price: 4999, description: 'События этого года', image: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=500', capsuleId: 8, categoryId: 3, category: 'Публичное' },
  { id: 6, name: 'Путешествие в будущее', price: 2499, description: 'Маршрут моей мечты', image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500', capsuleId: 9, categoryId: 2, category: 'Мечты' },
];

export const mockReports: ModerationReportDto[] = [
  { id: 1, capsuleId: 3, reporterEmail: 'moderator@memorylane.com', reporterDisplayName: null, reason: 'Подозрение на спам в публичной ленте', status: 0, createdAtUtc: pastDate(1) },
];

function genLastDays(n: number, counts: number[]): { date: string; count: number }[] {
  return Array.from({ length: n }, (_, i) => ({
    date: pastDate(n - 1 - i).split('T')[0],
    count: counts[i % counts.length],
  })).reverse();
}

export const mockStats: AdminStatsDto = {
  userRegistrationsByDay: genLastDays(21, [0, 1, 0, 2, 0, 0, 1, 0, 3, 0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 0, 1]),
  capsulesCreatedByDay: genLastDays(21, [1, 0, 0, 2, 0, 1, 0, 3, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 2, 0, 0]),
};

interface MockEntry<T> {
  data: T;
  merge: 'concat' | 'replace' | 'skip';
}

function matchPath<T>(
  path: string,
  method: string | undefined,
  body: string | undefined,
): MockEntry<T> | undefined {
  const url = new URL(path, 'http://mock');
  const pathname = url.pathname;
  const params = Object.fromEntries(url.searchParams.entries());

  const isMutation = method && method !== 'GET';

  if (pathname === '/api/user/login' && method === 'POST') {
    const { email, password } = JSON.parse(body ?? '{}') as { email?: string; password?: string };
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) {
      return { data: { isSuccess: false, message: 'Неверный email или пароль', role: 'guest' } as T, merge: 'skip' };
    }
    return {
      data: {
        isSuccess: true, message: 'Успешный вход',
        userId: user.id, role: user.role, displayName: user.displayName,
        email: user.email,
        accessToken: 'mock-access-token-' + user.id,
        refreshToken: 'mock-refresh-token-' + user.id,
        accessExpiresUtc: futureDate(1),
      } as T,
      merge: 'skip',
    };
  }

  if ((pathname === '/api/user' || pathname === '/api/user/') && method === 'POST') {
    return { data: { isSuccess: true, message: 'Пользователь зарегистрирован' } as T, merge: 'skip' };
  }

  if (pathname === '/api/user/getAll') {
    return { data: mockUsers as T, merge: 'concat' };
  }

  if (pathname.startsWith('/api/user/id') && !method) {
    const id = Number(params['id'] ?? 0);
    return { data: mockUsers.find((u) => u.id === id) as T, merge: 'skip' };
  }

  if ((pathname === '/api/user' || pathname === '/api/user/') && method === 'PUT') {
    return { data: { isSuccess: true, message: 'Роль обновлена' } as T, merge: 'skip' };
  }

  if (pathname === '/api/timecapsule/getByOwner') {
    const ownerId = Number(params['ownerUserId'] ?? 0);
    return { data: mockCapsules.filter((c) => c.ownerUserId === ownerId) as T, merge: 'concat' };
  }

  if (pathname === '/api/timecapsule/getByRecipient') {
    const recipientId = Number(params['recipientUserId'] ?? 0);
    const recipient = mockUsers.find((u) => u.id === recipientId);
    if (!recipient) return { data: [] as T, merge: 'concat' };
    return { data: mockCapsules.filter((c) => c.recipientEmail.toLowerCase() === recipient.email.toLowerCase()) as T, merge: 'concat' };
  }

  if (pathname === '/api/timecapsule/getOpenedForUser') {
    const userId = Number(params['userId'] ?? 0);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) return { data: [] as T, merge: 'concat' };
    const opened = mockCapsules.filter(
      (c) =>
        c.openedAtUtc != null ||
        (c.recipientEmail.toLowerCase() === user.email.toLowerCase() && new Date(c.openAtUtc).getTime() < Date.now()) ||
        (c.isPublic && new Date(c.openAtUtc).getTime() < Date.now()) ||
        c.ownerUserId === userId,
    );
    return {
      data: opened.map((c) => ({
        ...c,
        openedAtUtc: c.openedAtUtc ?? new Date(c.openAtUtc).toISOString(),
        openedFrom: c.openedFrom ?? (c.isPublic ? 'Публичная капсула' : 'Присланная капсула'),
      })) as T,
      merge: 'concat',
    };
  }

  if (pathname === '/api/timecapsule/getPublicFeed') {
    return { data: mockCapsules.filter((c) => c.isPublic && new Date(c.openAtUtc).getTime() < Date.now() && !c.title.includes('[Демо]')) as T, merge: 'concat' };
  }

  if (pathname === '/api/timecapsule/idForUser') {
    const id = Number(params['id'] ?? 0);
    const viewerId = Number(params['viewerUserId'] ?? 0);
    const capsule = mockCapsules.find((c) => c.id === id);
    if (!capsule) return { data: undefined as T, merge: 'skip' };

    const viewer = mockUsers.find((u) => u.id === viewerId);
    if (!viewer) return { data: undefined as T, merge: 'skip' };

    const isOwner = capsule.ownerUserId === viewerId;
    const isRecipient = capsule.recipientEmail?.toLowerCase() === viewer.email?.toLowerCase();
    const isCatalogCapsule = mockProducts.some((p) => p.capsuleId === id);
    const canView = isOwner || capsule.isPublic || isRecipient || isCatalogCapsule;
    if (!canView) return { data: undefined as T, merge: 'skip' };

    return { data: capsule as T, merge: 'concat' };
  }

  if (pathname === '/api/timecapsule/getAll' && !method) {
    return { data: mockCapsules as T, merge: 'concat' };
  }

  if (pathname.startsWith('/api/timecapsule/') && isMutation) {
    return { data: { isSuccess: true, message: 'Капсула обработана' } as T, merge: 'skip' };
  }

  if (pathname === '/api/capsulelocation/getAll') {
    return { data: mockLocations as T, merge: 'concat' };
  }

  if (pathname === '/api/product/getAll') {
    return { data: mockProducts as T, merge: 'concat' };
  }

  if (pathname.startsWith('/api/product/') && isMutation) {
    return { data: { isSuccess: true, message: 'Товар обработан' } as T, merge: 'skip' };
  }

  if (pathname === '/api/category/getAll') {
    return { data: mockCategories as T, merge: 'concat' };
  }

  if ((pathname === '/api/category' || pathname === '/api/category/') && method === 'POST') {
    return { data: { isSuccess: true, message: 'Категория добавлена' } as T, merge: 'skip' };
  }

  if (pathname.startsWith('/api/category/') && isMutation) {
    return { data: { isSuccess: true, message: 'Категория обработана' } as T, merge: 'skip' };
  }

  if (pathname === '/api/moderationreport/getAll') {
    return { data: mockReports as T, merge: 'concat' };
  }

  if ((pathname === '/api/moderationreport' || pathname === '/api/moderationreport/') && isMutation) {
    return { data: { isSuccess: true, message: 'Жалоба обработана' } as T, merge: 'skip' };
  }

  if (pathname === '/api/admin/stats/getAnalytics') {
    return { data: mockStats as T, merge: 'concat' };
  }

  if (pathname === '/api/user/refresh' && method === 'POST') {
    return {
      data: { isSuccess: true, message: 'Токен обновлён', userId: 1, role: 'user', displayName: 'Демо пользователь' } as T,
      merge: 'skip',
    };
  }

  return undefined;
}

export function getMockEntry<T>(path: string, init?: RequestInit): MockEntry<T> | undefined {
  try {
    return matchPath<T>(path, init?.method, init?.body as string | undefined);
  } catch {
    return undefined;
  }
}
