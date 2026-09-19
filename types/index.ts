export type UserRole = 'client' | 'provider' | 'admin';

export type ServiceCategory = 'babysitting' | 'teaching';

export type RequestStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export type PriceUnit = 'séance' | 'mois' | 'heure';

export type VerificationStatus = 
  | 'non_verifie' 
  | 'en_attente_physique' 
  | 'verifie_en_main_propre' 
  | 'suspendu';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string;
  // Attributs de confiance et vérification physique (7 pièces obligatoires)
  verification_status?: VerificationStatus;
  id_card_verified?: boolean;
  birth_certificate_verified?: boolean;
  family_record_verified?: boolean;
  residence_certificate_verified?: boolean;
  criminal_record_verified?: boolean;
  photos_verified?: boolean;
  diploma_verified?: boolean;
  admin_verification_date?: string | null;
  admin_verification_notes?: string | null;
}

export interface ServiceListing {
  id: string;
  provider_id: string;
  category: ServiceCategory;
  title: string;
  description: string | null;
  price: number;
  price_unit?: PriceUnit;
  availability: string | null;
  location: string | null;
  supported_communes?: string[];
  photo_url: string | null;
  experience_years?: number;
  is_active?: boolean;
  created_at: string;
  // Relations jointes / calculées
  provider?: Profile;
  average_rating?: number;
  review_count?: number;
}

export interface ServiceRequest {
  id: string;
  client_id: string | null;
  listing_id: string;
  requested_datetime: string;
  note: string | null;
  status: RequestStatus;
  created_at: string;
  // Détails enrichis de la demande
  client_name?: string | null;
  client_phone?: string | null;
  child_count?: number;
  child_age_or_grade?: string;
  address_details?: string;
  duration_hours?: number;
  admin_notes?: string | null;
  // Relations jointes
  client?: Profile;
  listing?: ServiceListing;
  review?: Review;
}

export interface Review {
  id: string;
  request_id: string;
  rating: number; // 1 à 5
  punctuality_rating?: number;
  competence_rating?: number;
  comment: string | null;
  created_at: string;
  client?: Profile;
}
