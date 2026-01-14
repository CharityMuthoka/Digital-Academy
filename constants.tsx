
import { Course } from './types';

export const COURSES: Course[] = [
  {
    id: '1',
    title: 'Microsoft Office Essentials',
    category: 'Computer Packages',
    description: 'Master Word, Excel, and PowerPoint for professional productivity.',
    price: 15.00,
    thumbnail: 'https://picsum.photos/seed/office/400/250',
    enrolled: false,
    progress: 0,
    lessons: [
      { id: 'l1', title: 'Introduction to Word', duration: '15m', completed: false, content: 'Learning the ribbon, formatting text, and paragraph styles.' },
      { id: 'l2', title: 'Excel Formulas 101', duration: '25m', completed: false, content: 'Basic sum, average, and cell referencing.' },
      { id: 'l3', title: 'Designing Powerful Slides', duration: '20m', completed: false, content: 'Animations, transitions, and layout principles.' }
    ]
  },
  {
    id: '2',
    title: 'Modern Web Design with HTML & CSS',
    category: 'Web Development',
    description: 'Learn to build responsive, beautiful websites from scratch.',
    price: 25.00,
    thumbnail: 'https://picsum.photos/seed/web/400/250',
    enrolled: false,
    progress: 0,
    lessons: [
      { id: 'l4', title: 'Semantic HTML5', duration: '12m', completed: false, content: 'Structural tags like header, main, section, and article.' },
      { id: 'l5', title: 'CSS Box Model', duration: '30m', completed: false, content: 'Margin, padding, border, and content sizing.' },
      { id: 'l6', title: 'Flexbox & Grid', duration: '45m', completed: false, content: 'Modern layout techniques for responsive design.' }
    ]
  },
  {
    id: '3',
    title: 'JavaScript Fundamentals',
    category: 'Web Development',
    description: 'The core programming language that powers the web.',
    price: 30.00,
    thumbnail: 'https://picsum.photos/seed/js/400/250',
    enrolled: false,
    progress: 0,
    lessons: [
      { id: 'l7', title: 'Variables & Types', duration: '20m', completed: false, content: 'Let, const, strings, numbers, and booleans.' },
      { id: 'l8', title: 'Functions & Scope', duration: '35m', completed: false, content: 'Arrow functions, closures, and local variables.' }
    ]
  },
  {
    id: '4',
    title: 'PC Hardware & OS Basics',
    category: 'Computer Packages',
    description: 'Understand how computers work and how to navigate Windows/Linux.',
    price: 10.00,
    thumbnail: 'https://picsum.photos/seed/pc/400/250',
    enrolled: false,
    progress: 0,
    lessons: [
      { id: 'l9', title: 'Inside the Box', duration: '15m', completed: false, content: 'CPU, RAM, Motherboard, and Storage.' },
      { id: 'l10', title: 'File Management', duration: '10m', completed: false, content: 'Folders, file paths, and compression.' }
    ]
  }
];
