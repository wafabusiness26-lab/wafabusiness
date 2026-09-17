-- ==============================================================================
-- Plateforme TataWafa (Wilaya d'Alger, Algérie)
-- Schéma PostgreSQL Supabase Complet & Prêt pour la Production
-- Modèle de Confiance : Vérification Physique en Main Propre & Paiement Espèces DA
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLE PROFILES (Utilisateurs : Familles, Prestataires, Administrateurs)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('client', 'provider', 'admin')) default 'client',
  full_name text not null,
  phone text,
  location text default 'Alger Centre',
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  -- Protocole de vérification physique en main propre
  verification_status text default 'en_attente_physique' check (verification_status in ('non_verifie', 'en_attente_physique', 'verifie_en_main_propre', 'suspendu')),
  id_card_verified boolean default false,
  diploma_verified boolean default false,
  admin_verification_date timestamptz,
  admin_verification_notes text
);

-- 3. TABLE SERVICE LISTINGS (Annonces : Nounous & Professeurs)
create table if not exists public.service_listings (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references public.profiles(id) on delete cascade not null,
  category text not null check (category in ('babysitting', 'teaching')),
  title text not null,
  description text,
  price numeric not null,
  price_unit text not null default 'séance' check (price_unit in ('séance', 'mois', 'heure')),
  availability text default 'Flexible',
  location text default 'Alger Centre',
  supported_communes text[] default array['Alger Centre'],
  photo_url text,
  experience_years int default 2,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. TABLE REQUESTS (Demandes de réservations des familles)
create table if not exists public.requests (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.service_listings(id) on delete cascade not null,
  requested_datetime timestamptz not null,
  note text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'completed', 'cancelled')),
  client_name text,
  client_phone text,
  child_count int default 1,
  child_age_or_grade text,
  address_details text,
  duration_hours numeric default 2,
  admin_notes text,
  created_at timestamptz default now()
);

-- 5. TABLE REVIEWS (Avis et Évaluations certifiés post-prestation)
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.requests(id) on delete cascade not null unique,
  rating int not null check (rating between 1 and 5),
  punctuality_rating int check (punctuality_rating between 1 and 5),
  competence_rating int check (competence_rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- ==============================================================================
-- TRIGGER AUTO-CRÉATION DU PROFIL LORS DU SIGNUP SUPABASE AUTH
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, phone, location, verification_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilisateur TataWafa'),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'location', 'Alger Centre'),
    case 
      when coalesce(new.raw_user_meta_data->>'role', 'client') = 'provider' then 'en_attente_physique'
      else 'non_verifie'
    end
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = coalesce(excluded.phone, profiles.phone),
    location = coalesce(excluded.location, profiles.location);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.service_listings enable row level security;
alter table public.requests enable row level security;
alter table public.reviews enable row level security;

-- PROFILES POLICIES
drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "admin full access to profiles" on public.profiles;
create policy "admin full access to profiles" on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- SERVICE LISTINGS POLICIES
drop policy if exists "listings are public" on public.service_listings;
create policy "listings are public" on public.service_listings for select using (
  is_active = true
  or provider_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "providers manage own listings" on public.service_listings;
create policy "providers manage own listings" on public.service_listings for all using (
  provider_id = auth.uid()
);

drop policy if exists "admin full access to listings" on public.service_listings;
create policy "admin full access to listings" on public.service_listings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- REQUESTS POLICIES
drop policy if exists "clients see own requests" on public.requests;
create policy "clients see own requests" on public.requests for select using (
  client_id = auth.uid()
);

drop policy if exists "providers see their requests" on public.requests;
create policy "providers see their requests" on public.requests for select using (
  exists (select 1 from public.service_listings where id = listing_id and provider_id = auth.uid())
);

drop policy if exists "clients create requests" on public.requests;
create policy "clients create requests" on public.requests for insert with check (
  client_id = auth.uid()
);

drop policy if exists "admin full access to requests" on public.requests;
create policy "admin full access to requests" on public.requests for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- REVIEWS POLICIES
drop policy if exists "reviews are public" on public.reviews;
create policy "reviews are public" on public.reviews for select using (true);

drop policy if exists "client can review own completed request" on public.reviews;
create policy "client can review own completed request" on public.reviews for insert with check (
  exists (
    select 1 from public.requests 
    where id = request_id 
      and client_id = auth.uid() 
      and status = 'completed'
  )
);

drop policy if exists "admin can delete reviews" on public.reviews;
create policy "admin can delete reviews" on public.reviews for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ==============================================================================
-- STORAGE BUCKET POUR PHOTOS DE PROFILS / ANNONCES
-- ==============================================================================
insert into storage.buckets (id, name, public) 
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public listing photos are accessible by all" on storage.objects;
create policy "Public listing photos are accessible by all" 
  on storage.objects for select 
  using (bucket_id = 'listing-photos');

drop policy if exists "Authenticated providers can upload listing photos" on storage.objects;
create policy "Authenticated providers can upload listing photos" 
  on storage.objects for insert 
  with check (
    bucket_id = 'listing-photos' 
    and auth.role() = 'authenticated'
  );

-- Enable Realtime publication pour les demandes
alter publication supabase_realtime add table public.requests;
