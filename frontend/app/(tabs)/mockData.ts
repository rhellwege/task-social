import type { Club } from './types';

export const initialClubs: Club[] = [
  {
    id: "1",
    name: "Chess Club",
    description: "A club for chess enthusiasts.",
    owner_user_id: 'mock_owner',
    banner_image: null,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Coding Club",
    description: "For coding challenges.",
    owner_user_id: 'mock_owner',
    banner_image: null,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export let allClubs: Club[] = [...initialClubs];
export let joinedClubs: Club[] = [];