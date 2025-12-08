export interface Club {
  id: string;
  name: string;
  description: string;
  owner_user_id: string;
  banner_image: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  title: string;
  price: string;
  seller: string;
}