-- ==============================================================================
-- MIGRATION : Protocole d'Agrément Prestataires — 7 Pièces Légalisées
-- ==============================================================================

-- 1. Ajout des 5 nouvelles colonnes de vérification physique dans public.profiles
alter table public.profiles add column if not exists birth_certificate_verified boolean default false;
alter table public.profiles add column if not exists family_record_verified boolean default false;
alter table public.profiles add column if not exists residence_certificate_verified boolean default false;
alter table public.profiles add column if not exists criminal_record_verified boolean default false;
alter table public.profiles add column if not exists photos_verified boolean default false;

-- 2. Mise à jour du Trigger Anti-Escalade de Privilèges
-- Empêche tout utilisateur non-administrateur de modifier les 7 drapeaux de vérification
create or replace function public.protect_profile_privileged_fields()
returns trigger as $$
begin
  -- Permettre les modifications directes via SQL Editor / Service Role (auth.uid() est null)
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.verification_status := old.verification_status;
    new.id_card_verified := old.id_card_verified;
    new.birth_certificate_verified := old.birth_certificate_verified;
    new.family_record_verified := old.family_record_verified;
    new.residence_certificate_verified := old.residence_certificate_verified;
    new.criminal_record_verified := old.criminal_record_verified;
    new.photos_verified := old.photos_verified;
    new.diploma_verified := old.diploma_verified;
    new.admin_verification_date := old.admin_verification_date;
    new.admin_verification_notes := old.admin_verification_notes;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 3. Rechargement du cache de schéma Supabase
notify pgrst, 'reload schema';
