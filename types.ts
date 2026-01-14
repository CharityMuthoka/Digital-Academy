
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  content: string;
}

export interface Course {
  id: string;
  title: string;
  category: 'Computer Packages' | 'Web Development';
  description: string;
  price: number;
  thumbnail: string;
  lessons: Lesson[];
  enrolled: boolean;
  progress: number;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
  balance: number;
}

export type ViewState = 'landing' | 'dashboard' | 'course-catalog' | 'course-detail' | 'profile';
