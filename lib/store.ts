'use client';

import { 
  Profile, 
  ServiceListing, 
  ServiceRequest, 
  Review, 
  RequestStatus, 
  UserRole,
  VerificationStatus
} from '@/types';
import { 
  INITIAL_PROFILES, 
  INITIAL_LISTINGS, 
  INITIAL_REQUESTS, 
  INITIAL_REVIEWS 
} from './mock-data';
import { createClient, isSupabaseConfigured } from './supabase/client';

const STORAGE_KEYS = {
  PROFILES: 'amana_profiles_v4',
  LISTINGS: 'amana_listings_v4',
  REQUESTS: 'amana_requests_v4',
  REVIEWS: 'amana_reviews_v4',
};

// Nettoyage automatique de tout ancien cache obsolète de test
if (typeof window !== 'undefined') {
  try {
    ['tatawafa_listings', 'tatawafa_listings_v1', 'tatawafa_listings_v2', 'tatawafa_listings_v3', 'tatawafa_listings_v4', 'tatawafa_profiles', 'tatawafa_profiles_v1', 'tatawafa_profiles_v2', 'tatawafa_profiles_v3', 'tatawafa_profiles_v4', 'tatawafa_requests_v4', 'tatawafa_reviews_v4', 'sm_listings', 'listings'].forEach(k => {
      localStorage.removeItem(k);
    });
  } catch (_) {}
}

// Helpers réservés EXCLUSIVEMENT au mode test local hors ligne (sans identifiants Supabase)
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('sm_data_change', { detail: { key } }));
  } catch (e) {
    console.error('Erreur écriture localStorage', e);
  }
}

export class DataStore {
  // --------------------------------------------------------------------------
  // PROFILS & VÉRIFICATION EN MAIN PROPRE
  // --------------------------------------------------------------------------
  static async getProfiles(role?: UserRole): Promise<Profile[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return [];
      let query = supabase.from('profiles').select('*');
      if (role) query = query.eq('role', role);
      const { data, error } = await query;
      if (error) {
        console.error('Supabase getProfiles error:', error);
        return [];
      }
      return (data || []) as Profile[];
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const profiles = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return role ? profiles.filter(p => p.role === role) : profiles;
  }

  static async getProfileById(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (error) {
        console.error('Supabase getProfileById error:', error);
        return null;
      }
      return data as Profile | null;
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const profiles = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return profiles.find(p => p.id === id) || null;
  }

  static async saveProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
    const current = await this.getProfileById(profile.id);
    const updatedProfile: Profile = {
      id: profile.id,
      role: profile.role || current?.role || 'client',
      full_name: profile.full_name || current?.full_name || 'Utilisateur',
      phone: profile.phone ?? current?.phone ?? null,
      location: profile.location ?? current?.location ?? 'Alger Centre',
      avatar_url: profile.avatar_url ?? current?.avatar_url ?? null,
      bio: profile.bio ?? current?.bio ?? null,
      created_at: current?.created_at || new Date().toISOString(),
      verification_status: profile.verification_status 
        ?? (profile.role === 'provider' && (!current?.verification_status || current?.verification_status === 'non_verifie')
            ? 'en_attente_physique' 
            : current?.verification_status) 
        ?? (profile.role === 'provider' ? 'en_attente_physique' : 'non_verifie'),
      id_card_verified: profile.id_card_verified ?? current?.id_card_verified ?? false,
      birth_certificate_verified: profile.birth_certificate_verified ?? current?.birth_certificate_verified ?? false,
      family_record_verified: profile.family_record_verified ?? current?.family_record_verified ?? false,
      residence_certificate_verified: profile.residence_certificate_verified ?? current?.residence_certificate_verified ?? false,
      criminal_record_verified: profile.criminal_record_verified ?? current?.criminal_record_verified ?? false,
      photos_verified: profile.photos_verified ?? current?.photos_verified ?? false,
      diploma_verified: profile.diploma_verified ?? current?.diploma_verified ?? false,
      admin_verification_date: profile.admin_verification_date ?? current?.admin_verification_date ?? null,
      admin_verification_notes: profile.admin_verification_notes ?? current?.admin_verification_notes ?? null,
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        try {
          const { id, created_at, ...fieldsToUpdate } = updatedProfile;
          const { data, error } = await supabase
            .from('profiles')
            .update(fieldsToUpdate)
            .eq('id', profile.id)
            .select()
            .single();

          if (error) {
            console.warn('Supabase update profile notice:', error.message);
          } else if (data) {
            return data as Profile;
          }
        } catch (e) {
          console.warn('Supabase update profile exception:', e);
        }
      }
      return updatedProfile;
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const profiles = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const index = profiles.findIndex(p => p.id === updatedProfile.id);
    let updatedList: Profile[];
    if (index >= 0) {
      updatedList = [...profiles];
      updatedList[index] = updatedProfile;
    } else {
      updatedList = [updatedProfile, ...profiles];
    }
    setLocal(STORAGE_KEYS.PROFILES, updatedList);
    return updatedProfile;
  }

  static async updateVerificationStatus(
    providerId: string, 
    status: VerificationStatus,
    checklist?: { 
      id_card_verified?: boolean; 
      birth_certificate_verified?: boolean;
      family_record_verified?: boolean;
      residence_certificate_verified?: boolean;
      criminal_record_verified?: boolean;
      photos_verified?: boolean;
      diploma_verified?: boolean; 
      notes?: string;
    }
  ): Promise<boolean> {
    const updatePayload: any = {
      verification_status: status,
      id_card_verified: checklist?.id_card_verified ?? false,
      birth_certificate_verified: checklist?.birth_certificate_verified ?? false,
      family_record_verified: checklist?.family_record_verified ?? false,
      residence_certificate_verified: checklist?.residence_certificate_verified ?? false,
      criminal_record_verified: checklist?.criminal_record_verified ?? false,
      photos_verified: checklist?.photos_verified ?? false,
      diploma_verified: checklist?.diploma_verified ?? false,
      admin_verification_notes: checklist?.notes ?? null,
      admin_verification_date: status === 'verifie_en_main_propre' ? new Date().toISOString() : null,
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        // Plain UPDATE only - NEVER upsert or insert to guarantee no RLS policy violations
        const { data, error } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', providerId)
          .select()
          .single();

        if (error) {
          console.error('Supabase updateVerificationStatus error:', error.message);
          throw error;
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sm_data_change', { detail: { key: 'profiles' } }));
        }
        return true;
      }
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const profiles = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const index = profiles.findIndex(p => p.id === providerId);
    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...updatePayload };
      setLocal(STORAGE_KEYS.PROFILES, profiles);
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // ANNONCES DE SERVICES (BABYSITTING & SOUTIEN SCOLAIRE)
  // --------------------------------------------------------------------------
  static async getListings(filters?: { 
    category?: string; 
    query?: string;
    commune?: string;
    includeUnverified?: boolean;
    maxPrice?: number;
  }): Promise<ServiceListing[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return [];

      let q = supabase.from('service_listings').select(`
        *,
        provider:profiles(*)
      `).order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        q = q.eq('category', filters.category);
      }

      const { data, error } = await q;
      if (error) {
        console.error('Supabase getListings error:', error);
        return [];
      }

      let listings = (data || []) as ServiceListing[];

      // Règle stricte de vérification physique
      if (!filters?.includeUnverified) {
        listings = listings.filter(l => l.provider?.verification_status === 'verifie_en_main_propre');
      }

      if (filters?.commune && filters.commune !== 'all') {
        const c = filters.commune.toLowerCase();
        listings = listings.filter(l => 
          (l.location && l.location.toLowerCase().includes(c)) ||
          (l.supported_communes && l.supported_communes.some(sc => sc.toLowerCase().includes(c)))
        );
      }

      if (filters?.query) {
        const queryStr = filters.query.toLowerCase();
        listings = listings.filter(l => 
          l.title.toLowerCase().includes(queryStr) || 
          (l.description && l.description.toLowerCase().includes(queryStr)) ||
          (l.location && l.location.toLowerCase().includes(queryStr)) ||
          (l.provider?.full_name && l.provider.full_name.toLowerCase().includes(queryStr))
        );
      }

      if (filters?.maxPrice) {
        listings = listings.filter(l => l.price <= (filters.maxPrice as number));
      }

      // Récupérer les avis pour calculer les moyennes
      const reviews = await this.getAllReviews();
      const requests = await this.getRequestsRaw();

      return listings.map(item => {
        const itemRequestIds = requests.filter(r => r.listing_id === item.id).map(r => r.id);
        const itemReviews = reviews.filter(rev => itemRequestIds.includes(rev.request_id));
        const ratingCount = itemReviews.length;
        const avgRating = ratingCount > 0 
          ? itemReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount 
          : 0;

        return {
          ...item,
          review_count: ratingCount,
          average_rating: avgRating > 0 ? Number(avgRating.toFixed(1)) : undefined,
        };
      });
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const profiles = await this.getProfiles();
    const reviews = await this.getAllReviews();
    const requests = await this.getRequestsRaw();

    let listings = getLocal<ServiceListing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
    
    listings = listings.map(item => ({
      ...item,
      provider: profiles.find(p => p.id === item.provider_id) || {
        id: item.provider_id,
        role: 'provider',
        full_name: 'Prestataire Amana',
        location: item.location,
        verification_status: 'en_attente_physique',
      }
    }));

    if (!filters?.includeUnverified) {
      listings = listings.filter(l => l.provider?.verification_status === 'verifie_en_main_propre');
    }

    if (filters?.category && filters.category !== 'all') {
      listings = listings.filter(l => l.category === filters.category);
    }
    if (filters?.commune && filters.commune !== 'all') {
      const c = filters.commune.toLowerCase();
      listings = listings.filter(l => 
        (l.location && l.location.toLowerCase().includes(c)) ||
        (l.supported_communes && l.supported_communes.some(sc => sc.toLowerCase().includes(c)))
      );
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      listings = listings.filter(l => 
        l.title.toLowerCase().includes(q) || 
        (l.description && l.description.toLowerCase().includes(q)) ||
        (l.location && l.location.toLowerCase().includes(q)) ||
        (l.provider?.full_name && l.provider.full_name.toLowerCase().includes(q))
      );
    }
    if (filters?.maxPrice) {
      listings = listings.filter(l => l.price <= (filters.maxPrice as number));
    }

    return listings.map(item => {
      const itemRequestIds = requests.filter(r => r.listing_id === item.id).map(r => r.id);
      const itemReviews = reviews.filter(rev => itemRequestIds.includes(rev.request_id));
      const ratingCount = itemReviews.length;
      const avgRating = ratingCount > 0 
        ? itemReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount 
        : 0;

      return {
        ...item,
        review_count: ratingCount,
        average_rating: avgRating > 0 ? Number(avgRating.toFixed(1)) : undefined,
      };
    });
  }

  static async getListingById(id: string, includeUnverified = false): Promise<ServiceListing | null> {
    const all = await this.getListings({ includeUnverified });
    return all.find(l => l.id === id) || null;
  }

  static async getProviderListing(providerId: string): Promise<ServiceListing | null> {
    const all = await this.getListings({ includeUnverified: true });
    return all.find(l => l.provider_id === providerId) || null;
  }

  static async saveListing(listing: Partial<ServiceListing> & { provider_id: string }): Promise<ServiceListing> {
    const now = new Date().toISOString();
    const completeListing: ServiceListing = {
      id: listing.id || `lst_${Date.now()}`,
      provider_id: listing.provider_id,
      category: listing.category || 'babysitting',
      title: listing.title || 'Service de garde / soutien',
      description: listing.description || '',
      price: listing.price || 2000,
      price_unit: listing.price_unit || 'séance',
      availability: listing.availability || 'Flexible',
      location: listing.location || 'Alger Centre',
      supported_communes: listing.supported_communes || [listing.location || 'Alger Centre'],
      photo_url: listing.photo_url || null,
      experience_years: listing.experience_years || 2,
      is_active: listing.is_active !== undefined ? listing.is_active : true,
      created_at: listing.created_at || now,
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) throw new Error('Client Supabase inaccessible.');

      const payload: any = {
        provider_id: completeListing.provider_id,
        category: completeListing.category,
        title: completeListing.title,
        description: completeListing.description,
        price: completeListing.price,
        price_unit: completeListing.price_unit,
        availability: completeListing.availability,
        location: completeListing.location,
        supported_communes: completeListing.supported_communes,
        photo_url: completeListing.photo_url,
        experience_years: completeListing.experience_years,
        is_active: completeListing.is_active,
      };

      const isUuid = listing.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listing.id);
      let data: any = null;
      let error: any = null;

      if (isUuid) {
        payload.id = listing.id;
        const res = await supabase.from('service_listings').update(payload).eq('id', listing.id).select().single();
        data = res.data;
        error = res.error;
      } else {
        const res = await supabase.from('service_listings').insert(payload).select().single();
        data = res.data;
        error = res.error;
      }

      if (error) {
        console.error('Supabase saveListing error:', error);
        throw error;
      }
      return data as ServiceListing;
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const listings = getLocal<ServiceListing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
    const idx = listings.findIndex(l => l.id === completeListing.id);
    let updated: ServiceListing[];
    if (idx >= 0) {
      updated = [...listings];
      updated[idx] = { ...updated[idx], ...completeListing };
    } else {
      updated = [completeListing, ...listings];
    }
    setLocal(STORAGE_KEYS.LISTINGS, updated);
    return completeListing;
  }

  // --------------------------------------------------------------------------
  // DEMANDES DE SERVICES & COORDINATION
  // --------------------------------------------------------------------------
  private static async getRequestsRaw(): Promise<ServiceRequest[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.from('requests').select('*');
        if (error) {
          console.error('Supabase getRequestsRaw error:', error);
          return [];
        }
        return (data || []) as ServiceRequest[];
      }
      return [];
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    return getLocal<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  }

  static async getRequests(options?: { role?: UserRole; userId?: string }): Promise<ServiceRequest[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return [];

      try {
        let q = supabase.from('requests').select(`
          *,
          client:profiles(*),
          listing:service_listings(
            *,
            provider:profiles(*)
          ),
          review:reviews(*)
        `).order('created_at', { ascending: false });

        if (options?.role === 'client' && options.userId) {
          q = q.eq('client_id', options.userId);
        }

        const { data, error } = await q;
        if (!error && data) {
          return data as ServiceRequest[];
        }
        
        console.warn('Supabase joined query notice, executing resilient fallback:', error?.message);
      } catch (err) {
        console.warn('Supabase query exception, using direct table query:', err);
      }

      // Robust fallback: direct query on requests table, then hydrate client and listing
      try {
        let directQ = supabase.from('requests').select('*').order('created_at', { ascending: false });
        if (options?.role === 'client' && options.userId) {
          directQ = directQ.eq('client_id', options.userId);
        }

        const { data: rawRequests, error: rawError } = await directQ;
        if (rawError || !rawRequests) {
          console.error('Supabase raw getRequests error:', rawError);
          return [];
        }

        const [profiles, listings] = await Promise.all([
          this.getProfiles(),
          this.getListings({ includeUnverified: true }),
        ]);

        return rawRequests.map(r => ({
          ...r,
          client: profiles.find(p => p.id === r.client_id),
          listing: listings.find(l => l.id === r.listing_id),
        })) as ServiceRequest[];
      } catch (e) {
        console.error('Supabase getRequests fallback error:', e);
        return [];
      }
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const listings = await this.getListings();
    const profiles = await this.getProfiles();
    const reviews = await this.getAllReviews();
    const requests = getLocal<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);

    let hydrated = requests.map(req => {
      const listing = listings.find(l => l.id === req.listing_id);
      const client = profiles.find(p => p.id === req.client_id);
      const review = reviews.find(r => r.request_id === req.id);
      return {
        ...req,
        client,
        listing,
        review,
      };
    });

    if (options?.role === 'client' && options.userId) {
      hydrated = hydrated.filter(r => r.client_id === options.userId);
    } else if (options?.role === 'provider' && options.userId) {
      hydrated = hydrated.filter(r => r.listing?.provider_id === options.userId);
    }

    return hydrated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getRequestById(id: string): Promise<ServiceRequest | null> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('requests')
            .select(`
              *,
              client:profiles(*),
              listing:service_listings(
                *,
                provider:profiles(*)
              ),
              review:reviews(*)
            `)
            .eq('id', id)
            .maybeSingle();

          if (error) {
            console.error('Supabase getRequestById error:', error);
          }
          if (data) {
            return data as ServiceRequest;
          }
        } catch (err) {
          console.error('Supabase getRequestById exception:', err);
        }
      }
    }

    const all = await this.getRequests();
    return all.find(r => r.id === id) || null;
  }

  static async createRequest(data: {
    client_id?: string | null;
    listing_id: string;
    requested_datetime: string;
    note?: string;
    client_name?: string;
    client_phone?: string;
    child_count?: number;
    child_age_or_grade?: string;
    address_details?: string;
    duration_hours?: number;
  }): Promise<ServiceRequest> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Client Supabase inaccessible : vérifiez vos identifiants.');
      }

      // Valider si client_id est un UUID Supabase valide, sinon null (ex: invités)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const validClientId = (data.client_id && uuidRegex.test(data.client_id)) ? data.client_id : null;

      const payload: any = {
        listing_id: data.listing_id,
        requested_datetime: data.requested_datetime,
        note: data.note || null,
        status: 'new',
        child_count: Math.max(1, data.child_count || 1),
        duration_hours: data.duration_hours && data.duration_hours > 0 ? data.duration_hours : 2,
      };

      if (validClientId) payload.client_id = validClientId;
      if (data.client_name) payload.client_name = data.client_name;
      if (data.client_phone) payload.client_phone = data.client_phone;
      if (data.child_age_or_grade) payload.child_age_or_grade = data.child_age_or_grade;
      if (data.address_details) payload.address_details = data.address_details;

      let { data: created, error } = await supabase.from('requests').insert([payload]).select().single();

      // En cas de colonne manquante dans un schéma Supabase non migré, repli propre
      if (error && (error.message?.includes('column') || error.code === 'PGRST204')) {
        console.warn('Repli création de demande (schéma minimal sans colonnes secondaires):', error.message);
        const minimalPayload: any = {
          listing_id: data.listing_id,
          requested_datetime: data.requested_datetime,
          note: `${data.note || ''} | Contact: ${data.client_name || ''} (${data.client_phone || ''}) | Enfants: ${data.child_count || 1} (${data.child_age_or_grade || ''}) | Adresse: ${data.address_details || ''}`,
          status: 'new',
        };
        if (validClientId) minimalPayload.client_id = validClientId;
        const retry = await supabase.from('requests').insert([minimalPayload]).select().single();
        created = retry.data;
        error = retry.error;
      }

      // Vérification explicite et stricte de la réponse Supabase
      if (error) {
        console.error('Supabase createRequest error detail:', error);
        if (error.code === '42501') {
          throw new Error("Erreur de sécurité Supabase (RLS 42501) : La politique de sécurité de la table 'requests' a refusé l'insertion. Assurez-vous d'appliquer la politique autorisant les réservations (voir migration SQL).");
        }
        if (error.code === '22P02') {
          throw new Error(`Erreur de format Supabase (22P02) : Syntaxe UUID invalide sur client_id ou listing_id (${error.message}).`);
        }
        if (error.code === '23503') {
          throw new Error("Erreur de contrainte Supabase (23503) : Le prestataire (listing_id) ou le compte client (client_id) n'existe pas dans la base de données.");
        }
        if (error.code === '23514') {
          throw new Error(`Erreur de contrainte Supabase CHECK (23514) : Statut ou données invalides (${error.message}).`);
        }
        throw new Error(`Échec d'enregistrement Supabase [${error.code || 'DB'}]: ${error.message || 'Erreur inconnue'}`);
      }

      if (!created || !created.id) {
        throw new Error("La base de données Supabase n'a retourné aucun enregistrement après l'insertion.");
      }

      return created as ServiceRequest;
    }

    // Avertissement explicite si Supabase n'est pas configuré : NE JAMAIS masquér l'absence de base de données
    throw new Error("Supabase n'est pas configuré dans votre fichier .env.local (NEXT_PUBLIC_SUPABASE_URL est vide). Veuillez renseigner vos identifiants Supabase pour enregistrer vos demandes.");
  }

  static async updateRequestStatus(requestId: string, status: RequestStatus, adminNotes?: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return false;

      const updatePayload: any = { status };
      if (adminNotes !== undefined) updatePayload.admin_notes = adminNotes;
      const { error } = await supabase
        .from('requests')
        .update(updatePayload)
        .eq('id', requestId);

      if (error) {
        console.error('Supabase updateRequestStatus error:', error);
        return false;
      }
      return true;
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const current = getLocal<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const index = current.findIndex(r => r.id === requestId);
    if (index >= 0) {
      current[index].status = status;
      if (adminNotes !== undefined) current[index].admin_notes = adminNotes;
      setLocal(STORAGE_KEYS.REQUESTS, [...current]);
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // AVIS & NOTATION
  // --------------------------------------------------------------------------
  static async getAllReviews(): Promise<Review[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return [];

      const { data, error } = await supabase.from('reviews').select('*');
      if (error) {
        console.error('Supabase getAllReviews error:', error);
        return [];
      }
      return (data || []) as Review[];
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    return getLocal<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }

  static async getReviewsForListing(listingId: string): Promise<Review[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return [];

      const { data: reqs, error: reqsError } = await supabase.from('requests').select('id').eq('listing_id', listingId);
      if (reqsError) {
        console.error('Supabase getReviewsForListing reqs error:', reqsError);
        return [];
      }
      const reqIds = (reqs || []).map(r => r.id);
      if (reqIds.length === 0) return [];

      const { data: revs, error: revsError } = await supabase.from('reviews').select(`
        *,
        request:requests(
          client:profiles!requests_client_id_fkey(*)
        )
      `).in('request_id', reqIds).order('created_at', { ascending: false });

      if (revsError) {
        console.error('Supabase getReviewsForListing revs error:', revsError);
        return [];
      }

      return (revs || []).map((r: any) => ({
        ...r,
        client: r.request?.client,
      })) as Review[];
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const requests = await this.getRequestsRaw();
    const reviews = await this.getAllReviews();
    const profiles = await this.getProfiles();

    const matchingRequests = requests.filter(r => r.listing_id === listingId);
    const requestMap = new Map(matchingRequests.map(r => [r.id, r]));

    return reviews
      .filter(rev => requestMap.has(rev.request_id))
      .map(rev => {
        const req = requestMap.get(rev.request_id);
        const client = req ? profiles.find(p => p.id === req.client_id) : undefined;
        return { ...rev, client };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getReviewsForProvider(providerId: string): Promise<Review[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return [];

      // Annonces du prestataire
      const listings = await this.getListings({ includeUnverified: true });
      const providerListingIds = listings.filter(l => l.provider_id === providerId).map(l => l.id);
      if (providerListingIds.length === 0) return [];

      const { data: reqs, error: reqsError } = await supabase.from('requests').select('id').in('listing_id', providerListingIds);
      if (reqsError) {
        console.error('Supabase getReviewsForProvider reqs error:', reqsError);
        return [];
      }
      const reqIds = (reqs || []).map(r => r.id);
      if (reqIds.length === 0) return [];

      const { data: revs, error: revsError } = await supabase.from('reviews').select(`
        *,
        request:requests(
          client:profiles!requests_client_id_fkey(*)
        )
      `).in('request_id', reqIds).order('created_at', { ascending: false });

      if (revsError) {
        console.error('Supabase getReviewsForProvider revs error:', revsError);
        return [];
      }

      return (revs || []).map((r: any) => ({
        ...r,
        client: r.request?.client,
      })) as Review[];
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const listings = await this.getListings();
    const providerListingIds = listings.filter(l => l.provider_id === providerId).map(l => l.id);
    const requests = await this.getRequestsRaw();
    const reviews = await this.getAllReviews();
    const profiles = await this.getProfiles();

    const matchingRequests = requests.filter(r => providerListingIds.includes(r.listing_id));
    const requestMap = new Map(matchingRequests.map(r => [r.id, r]));

    return reviews
      .filter(rev => requestMap.has(rev.request_id))
      .map(rev => {
        const req = requestMap.get(rev.request_id);
        const client = req ? profiles.find(p => p.id === req.client_id) : undefined;
        return { ...rev, client };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async createReview(data: { 
    request_id: string; 
    rating: number; 
    comment: string;
    punctuality_rating?: number;
    competence_rating?: number;
  }): Promise<Review> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) throw new Error('Client Supabase inaccessible.');

      const { data: created, error } = await supabase.from('reviews').insert({
        request_id: data.request_id,
        rating: data.rating,
        punctuality_rating: data.punctuality_rating || data.rating,
        competence_rating: data.competence_rating || data.rating,
        comment: data.comment,
      }).select().single();

      if (error) {
        console.error('Supabase createReview error:', error);
        throw error;
      }
      return created as Review;
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      request_id: data.request_id,
      rating: data.rating,
      punctuality_rating: data.punctuality_rating || data.rating,
      competence_rating: data.competence_rating || data.rating,
      comment: data.comment,
      created_at: new Date().toISOString(),
    };

    const current = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const filtered = current.filter(r => r.request_id !== data.request_id);
    setLocal(STORAGE_KEYS.REVIEWS, [newReview, ...filtered]);
    return newReview;
  }

  static async deleteReview(reviewId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) return false;

      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) {
        console.error('Supabase deleteReview error:', error);
        return false;
      }
      return true;
    }

    // MODE TEST LOCAL HORS LIGNE UNIQUEMENT
    const current = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    setLocal(STORAGE_KEYS.REVIEWS, current.filter(r => r.id !== reviewId));
    return true;
  }

  static async getAdminReviews(): Promise<Array<Review & {
    client?: Profile;
    provider?: Profile;
    listing?: ServiceListing;
    request?: ServiceRequest;
  }>> {
    const reviews = await this.getAllReviews();
    const requests = await this.getRequestsRaw();
    const profiles = await this.getProfiles();
    const listings = await this.getListings({ includeUnverified: true });

    const requestMap = new Map(requests.map(r => [r.id, r]));
    const profileMap = new Map(profiles.map(p => [p.id, p]));
    const listingMap = new Map(listings.map(l => [l.id, l]));

    return reviews.map(rev => {
      const req = requestMap.get(rev.request_id);
      const listing = req ? listingMap.get(req.listing_id) : undefined;
      const client = (req && req.client_id) ? profileMap.get(req.client_id) : undefined;
      const provider = listing ? profileMap.get(listing.provider_id) : undefined;

      return {
        ...rev,
        request: req,
        listing,
        client,
        provider,
      };
    });
  }

  // --------------------------------------------------------------------------
  // RESET DATA HELPER (Uniquement disponible en mode test local hors ligne)
  // --------------------------------------------------------------------------
  static resetToDemoData() {
    if (isSupabaseConfigured()) {
      console.warn('Action interdite : la remise à zéro locale est désactivée lorsque Supabase est connecté.');
      return;
    }
    setLocal(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    setLocal(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
    setLocal(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    setLocal(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }
}
