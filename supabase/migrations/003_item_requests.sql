create table if not exists public.item_requests (
  id          bigserial   primary key,
  org         text        not null,
  item_name   text        not null,
  category    text,
  notes       text,
  created_by  uuid        references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.item_requests enable row level security;

drop policy if exists "Anyone authenticated can view requests" on public.item_requests;
drop policy if exists "Eboard can post requests" on public.item_requests;
drop policy if exists "Own org or admin can delete requests" on public.item_requests;

-- All authenticated users can see all requests
create policy "Anyone authenticated can view requests"
  on public.item_requests for select
  to authenticated
  using (true);

-- Any eboard member or OSI admin can post a request
create policy "Eboard can post requests"
  on public.item_requests for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.is_osi_admin = true
        or exists (
          select 1 from jsonb_array_elements(p.organizations) as o
          where o->>'role' = 'eboard'
        )
      )
    )
  );

-- Only the posting org or OSI admin can delete
create policy "Own org or admin can delete requests"
  on public.item_requests for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.is_osi_admin = true
        or (
          exists (
            select 1 from jsonb_array_elements(p.organizations) as o
            where o->>'org' = org
            and o->>'role' = 'eboard'
          )
        )
      )
    )
  );
