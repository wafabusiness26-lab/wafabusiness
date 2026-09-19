-- ==============================================================================
-- MIGRATION : Correction de l'insertion des demandes (requests) & RLS Supabase
-- Date : 19/09/2026
-- Résout :
-- 1. L'erreur 42501 (RLS rejection) pour les réservations clients / invités
-- 2. L'erreur 22P02 (invalid UUID) lors de soumissions sans compte
-- 3. L'erreur 23502 (NOT NULL constraint sur client_id)
-- 4. L'erreur 23503 (foreign key constraint) sur les clients invités
-- ==============================================================================

-- 1. S'assurer que toutes les colonnes secondaires existent dans requests
alter table public.requests add column if not exists client_name text;
alter table public.requests add column if not exists client_phone text;
alter table public.requests add column if not exists child_count int default 1;
alter table public.requests add column if not exists child_age_or_grade text;
alter table public.requests add column if not exists address_details text;
alter table public.requests add column if not exists duration_hours numeric default 2;
alter table public.requests add column if not exists admin_notes text;

-- 2. Permettre à client_id d'être NULL (pour les parents qui réservent sans créer de compte)
alter table public.requests alter column client_id drop not null;

-- 3. Mettre à jour la clé étrangère pour accepter la suppression propre sans violation
alter table public.requests drop constraint if exists requests_client_id_fkey;
alter table public.requests add constraint requests_client_id_fkey 
  foreign key (client_id) references public.profiles(id) on delete set null;

-- 4. Contrainte de contact obligatoire : soit client_id est fourni, soit client_name + client_phone
alter table public.requests drop constraint if exists requests_client_contact_check;
alter table public.requests add constraint requests_client_contact_check 
  check (
    client_id is not null or (client_name is not null and client_phone is not null)
  );

-- 5. Activer le RLS sur requests
alter table public.requests enable row level security;

-- 6. Politique d'insertion : autorise à la fois les clients connectés et les familles invitées
drop policy if exists "clients create requests" on public.requests;
create policy "clients create requests" on public.requests 
  for insert with check (
    -- Cas A : Utilisateur connecté créant sa propre demande
    (auth.uid() is not null and (client_id = auth.uid() or client_id is null) and (status = 'new' or status is null))
    or
    -- Cas B : Famille invitée renseignant son nom et téléphone de contact
    (client_name is not null and client_phone is not null and (status = 'new' or status is null))
  );

-- 7. Politique de lecture : le client voit ses demandes, le prestataire voit celles qui le concernent, ou accès par id
drop policy if exists "clients see own requests" on public.requests;
create policy "clients see own requests" on public.requests 
  for select using (
    (auth.uid() is not null and client_id = auth.uid())
    or
    -- Permet la consultation du bon de confirmation pour les demandes sans compte
    (client_id is null)
    or
    public.is_admin()
  );

-- 8. Politique pour les prestataires : voir les demandes associées à leurs annonces
drop policy if exists "providers see their requests" on public.requests;
create policy "providers see their requests" on public.requests 
  for select using (
    exists (
      select 1 from public.service_listings 
      where id = listing_id and provider_id = auth.uid()
    )
  );

-- 9. Politique pour les annulations clients
drop policy if exists "clients cancel own requests" on public.requests;
create policy "clients cancel own requests" on public.requests 
  for update using (
    (auth.uid() is not null and client_id = auth.uid() and status = 'new')
    or
    public.is_admin()
  ) with check (
    status = 'cancelled' or public.is_admin()
  );

-- 10. Accès complet pour l'administrateur
drop policy if exists "admin full access to requests" on public.requests;
create policy "admin full access to requests" on public.requests 
  for all using (public.is_admin());
