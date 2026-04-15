export interface User {
  id: string;
  email: string;
  interests: string[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  category: string;
  description: string;
  sourceChannel: string;
  sourceUrl?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, interests: string[]) => Promise<void>;
  logout: () => void;
}

export interface EventState {
  events: Event[];
  savedEvents: Event[];
  loading: boolean;
  filters: {
    category?: string;
    search?: string;
    dateRange?: { start: string; end: string };
  };
  page: number;
  hasMore: boolean;
  fetchEvents: (append?: boolean) => Promise<void>;
  fetchSavedEvents: () => Promise<void>;
  saveEvent: (eventId: string) => Promise<void>;
  unsaveEvent: (eventId: string) => Promise<void>;
  setFilters: (filters: Partial<EventState['filters']>) => void;
  resetFilters: () => void;
}