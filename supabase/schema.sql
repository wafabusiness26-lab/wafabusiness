-- ==============================================================================
-- Plateforme TataWafa (Wilaya d'Alger, Algérie)
-- Schéma PostgreSQL Supabase Hardened & Sécurisé (RLS Audité)
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
  price numeric not null check (price >= 0),
  price_unit text not null default 'séance' check (price_unit in ('séance', 'mois', 'heure')),
  availability text default 'Flexible',
  location text default 'Alger Centre',
  supported_communes text[] default array['Alger Centre'],
  photo_url text,
  experience_years int default 2 check (experience_years >= 0),
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
  child_count int default 1 check (child_count >= 1),
  child_age_or_grade text,
  address_details text,
  duration_hours numeric default 2 check (duration_hours > 0),
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
-- FONCTIONS DE SÉCURITÉ & TRIGGER ANTI-ESCALADE DE PRIVILÈGES
-- ==============================================================================

-- Fonction SECURITY DEFINER pour tester le rôle admin sans récursion infinie
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger d'auto-création du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, phone, location, verification_status)
  values (
    new.id,
    case 
      when new.raw_user_meta_data->>'role' in ('client', 'provider') then new.raw_user_meta_data->>'role'
      else 'client' -- Empêche l'auto-attribution du rôle admin lors du signup
    end,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilisateur TataWafa'),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'location', 'Alger Centre'),
    case 
      when new.raw_user_meta_data->>'role' = 'provider' then 'en_attente_physique'
      else 'non_verifie'
    end
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = coalesce(excluded.phone, profiles.phone),
    location = coalesce(excluded.location, profiles.location);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger Anti-Escalade de Privilèges : empêche un non-admin de modifier son rôle ou son badge vérifié
create or replace function public.protect_profile_privileged_fields()
returns trigger as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.verification_status := old.verification_status;
    new.id_card_verified := old.id_card_verified;
    new.diploma_verified := old.diploma_verified;
    new.admin_verification_date := old.admin_verification_date;
    new.admin_verification_notes := old.admin_verification_notes;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists tr_protect_profile_privileged_fields on public.profiles;
create trigger tr_protect_profile_privileged_fields
  before update on public.profiles
  for each row execute procedure public.protect_profile_privileged_fields();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES AUDITÉES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.service_listings enable row level security;
alter table public.requests enable row level security;
alter table public.reviews enable row level security;

-- ------------------------------------------------------------------------------
-- 1. POLITIQUES PROFILES
-- ------------------------------------------------------------------------------
drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone" on public.profiles 
  for select using (true);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles 
  for update using (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile" on public.profiles 
  for insert with check (auth.uid() = id);

drop policy if exists "admin full access to profiles" on public.profiles;
create policy "admin full access to profiles" on public.profiles 
  for all using (public.is_admin());

-- ------------------------------------------------------------------------------
-- 2. POLITIQUES SERVICE_LISTINGS (Règle stricte de vérification physique)
-- ------------------------------------------------------------------------------
drop policy if exists "listings are public" on public.service_listings;
-- Seules les annonces de prestataires vérifiés en main propre sont visibles par le public
create policy "listings are public" on public.service_listings 
  for select using (
    (
      is_active = true and exists (
        select 1 from public.profiles p 
        where p.id = service_listings.provider_id 
          and p.verification_status = 'verifie_en_main_propre'
      )
    )
    or provider_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "providers manage own listings" on public.service_listings;
drop policy if exists "providers insert own listings" on public.service_listings;
drop policy if exists "providers update own listings" on public.service_listings;
drop policy if exists "providers delete own listings" on public.service_listings;

create policy "providers insert own listings" on public.service_listings 
  for insert with check (provider_id = auth.uid());

create policy "providers update own listings" on public.service_listings 
  for update using (provider_id = auth.uid());

create policy "providers delete own listings" on public.service_listings 
  for delete using (provider_id = auth.uid());

drop policy if exists "admin full access to listings" on public.service_listings;
create policy "admin full access to listings" on public.service_listings 
  for all using (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. POLITIQUES REQUESTS (Protection des coordonnées des familles)
-- ------------------------------------------------------------------------------
drop policy if exists "clients see own requests" on public.requests;
create policy "clients see own requests" on public.requests 
  for select using (client_id = auth.uid());

drop policy if exists "providers see their requests" on public.requests;
create policy "providers see their requests" on public.requests 
  for select using (
    exists (
      select 1 from public.service_listings 
      where id = listing_id and provider_id = auth.uid()
    )
  );

drop policy if exists "clients create requests" on public.requests;
-- Les clients créent leurs demandes obligatoirement avec le statut 'new'
create policy "clients create requests" on public.requests 
  for insert with check (
    client_id = auth.uid() 
    and (status = 'new' or status is null)
  );

drop policy if exists "clients cancel own requests" on public.requests;
create policy "clients cancel own requests" on public.requests 
  for update using (
    client_id = auth.uid() and status = 'new'
  ) with check (
    status = 'cancelled'
  );

drop policy if exists "admin full access to requests" on public.requests;
create policy "admin full access to requests" on public.requests 
  for all using (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. POLITIQUES REVIEWS (Modération Delete-Only & Anti-Falsification)
-- ------------------------------------------------------------------------------
drop policy if exists "reviews are public" on public.reviews;
create policy "reviews are public" on public.reviews 
  for select using (true);

drop policy if exists "client can review own completed request" on public.reviews;
-- Uniquement le client de la mission terminée peut déposer un avis
create policy "client can review own completed request" on public.reviews 
  for insert with check (
    exists (
      select 1 from public.requests 
      where id = request_id 
        and client_id = auth.uid() 
        and status = 'completed'
    )
  );

-- AUCUNE politique d'update : un avis déposé ne peut pas être altéré
-- Seul l'administrateur peut supprimer un avis diffamatoire ou illégal (delete-only)
drop policy if exists "admin can delete reviews" on public.reviews;
create policy "admin can delete reviews" on public.reviews 
  for delete using (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. STORAGE BUCKET (Photos uniquement, aucun document sensible en ligne)
-- ------------------------------------------------------------------------------
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
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'avif')
  );

drop policy if exists "Authenticated providers can update/delete their own photos" on storage.objects;
create policy "Authenticated providers can update/delete their own photos" 
  on storage.objects for all 
  using (
    bucket_id = 'listing-photos' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ------------------------------------------------------------------------------
-- 6. REALTIME PUBLICATION POUR LE DISPATCHING ADMIN
-- ------------------------------------------------------------------------------
alter publication supabase_realtime add table public.requests;
