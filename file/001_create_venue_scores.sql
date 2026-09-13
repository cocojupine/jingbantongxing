-- Ocean / Supabase
-- venue_scores schema + personalized friendliness calculation
--
-- Core formula requested by product:
-- 1. user dimension u = (raw - 1) / 4
-- 2. P = average(u_i * s_i) over effective dimensions only
-- 3. stimulation_pct = min(100, P / 0.15 * 100)
-- 4. friendliness_pct = 100 - stimulation_pct
--
-- Notes:
-- - This script recalculates user u from asd_details.sensory_matrix.raw on the DB side.
-- - That avoids coupling to any older frontend formula versions.
-- - Jellyfish venue can leave taste stimulation as NULL, then SQL will only average 4 dimensions.

begin;

create schema if not exists public;

create table if not exists public.venue_scores (
  id bigint primary key,
  slug text not null unique,
  name text not null,
  description text default '',
  image text default '',
  tips text default '',
  story_intro text default '',
  social_stories jsonb not null default '[]'::jsonb,
  s_visual numeric(6,4) not null check (s_visual >= 0 and s_visual <= 1),
  s_auditory numeric(6,4) not null check (s_auditory >= 0 and s_auditory <= 1),
  s_olfactory numeric(6,4) not null check (s_olfactory >= 0 and s_olfactory <= 1),
  s_tactile numeric(6,4) not null check (s_tactile >= 0 and s_tactile <= 1),
  s_taste numeric(6,4) check (s_taste is null or (s_taste >= 0 and s_taste <= 1)),
  display_order integer not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_venue_scores_active_order
  on public.venue_scores (is_active, display_order, id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_venue_scores_updated_at on public.venue_scores;
create trigger trg_venue_scores_updated_at
before update on public.venue_scores
for each row
execute function public.set_updated_at();

alter table public.venue_scores enable row level security;

drop policy if exists "venue_scores_select_all" on public.venue_scores;
create policy "venue_scores_select_all"
on public.venue_scores
for select
using (true);

create or replace function public.extract_dimension_u(
  p_sensory_matrix jsonb,
  p_dimension text
)
returns numeric
language sql
stable
as $$
  with raw_items as (
    select
      nullif(item ->> 'raw', '')::numeric as raw_value
    from jsonb_array_elements(coalesce(p_sensory_matrix -> p_dimension, '[]'::jsonb)) as item
    where jsonb_typeof(item) = 'object'
      and item ? 'raw'
      and nullif(item ->> 'raw', '') is not null
  ),
  raw_avg as (
    select avg(raw_value) as avg_raw
    from raw_items
  )
  select case
    when avg_raw is null then null
    else round(greatest(0, least(1, (avg_raw - 1) / 4.0))::numeric, 4)
  end
  from raw_avg;
$$;

comment on function public.extract_dimension_u(jsonb, text) is
'Reads asd_details.sensory_matrix and computes u=(raw-1)/4 for a dimension using average raw.';

create or replace function public.get_profile_venue_scores(
  p_profile_id uuid,
  p_p_max numeric default 0.15,
  p_red_cutoff numeric default 45,
  p_yellow_cutoff numeric default 65
)
returns table (
  id bigint,
  slug text,
  name text,
  description text,
  image text,
  tips text,
  story_intro text,
  social_stories jsonb,
  s_visual numeric,
  s_auditory numeric,
  s_olfactory numeric,
  s_tactile numeric,
  s_taste numeric,
  u_visual numeric,
  u_auditory numeric,
  u_olfactory numeric,
  u_tactile numeric,
  u_taste numeric,
  p_score numeric,
  stimulation_pct numeric,
  friendliness_pct numeric,
  friendliness_color text
)
language sql
stable
security definer
set search_path = public
as $$
  with user_profile as (
    select
      d.profile_id,
      public.extract_dimension_u(d.sensory_matrix, 'visual') as u_visual,
      public.extract_dimension_u(d.sensory_matrix, 'auditory') as u_auditory,
      public.extract_dimension_u(d.sensory_matrix, 'olfactory') as u_olfactory,
      public.extract_dimension_u(d.sensory_matrix, 'tactile') as u_tactile,
      public.extract_dimension_u(d.sensory_matrix, 'taste') as u_taste
    from public.asd_details d
    where d.profile_id = p_profile_id
    limit 1
  ),
  scored as (
    select
      v.id,
      v.slug,
      v.name,
      v.description,
      v.image,
      v.tips,
      v.story_intro,
      v.social_stories,
      v.s_visual,
      v.s_auditory,
      v.s_olfactory,
      v.s_tactile,
      v.s_taste,
      u.u_visual,
      u.u_auditory,
      u.u_olfactory,
      u.u_tactile,
      u.u_taste,
      (
        select avg(multiplied.value)
        from (
          values
            (case when v.s_visual   is not null and u.u_visual   is not null then u.u_visual   * v.s_visual   end),
            (case when v.s_auditory is not null and u.u_auditory is not null then u.u_auditory * v.s_auditory end),
            (case when v.s_olfactory is not null and u.u_olfactory is not null then u.u_olfactory * v.s_olfactory end),
            (case when v.s_tactile  is not null and u.u_tactile  is not null then u.u_tactile  * v.s_tactile  end),
            (case when v.s_taste    is not null and u.u_taste    is not null then u.u_taste    * v.s_taste    end)
        ) as multiplied(value)
        where multiplied.value is not null
      ) as p_score
    from public.venue_scores v
    cross join user_profile u
    where v.is_active = true
  )
  select
    s.id,
    s.slug,
    s.name,
    s.description,
    s.image,
    s.tips,
    s.story_intro,
    s.social_stories,
    s.s_visual,
    s.s_auditory,
    s.s_olfactory,
    s.s_tactile,
    s.s_taste,
    s.u_visual,
    s.u_auditory,
    s.u_olfactory,
    s.u_tactile,
    s.u_taste,
    round(coalesce(s.p_score, 0)::numeric, 4) as p_score,
    round(least(100, coalesce((s.p_score / nullif(p_p_max, 0)) * 100, 0))::numeric, 2) as stimulation_pct,
    round((100 - least(100, coalesce((s.p_score / nullif(p_p_max, 0)) * 100, 0)))::numeric, 2) as friendliness_pct,
    case
      when (100 - least(100, coalesce((s.p_score / nullif(p_p_max, 0)) * 100, 0))) >= p_yellow_cutoff then 'green'
      when (100 - least(100, coalesce((s.p_score / nullif(p_p_max, 0)) * 100, 0))) >= p_red_cutoff then 'yellow'
      else 'red'
    end as friendliness_color
  from scored s
  order by s.id;
$$;

comment on function public.get_profile_venue_scores(uuid, numeric, numeric, numeric) is
'Returns personalized venue friendliness using u=(raw-1)/4, effective-dimension averaging, p_max normalization, and red/yellow/green labels.';

-- Seed data
-- Replace the s_* values with your final venue audit data when available.
insert into public.venue_scores (
  id, slug, name, description, image, tips, story_intro, social_stories,
  s_visual, s_auditory, s_olfactory, s_tactile, s_taste, display_order
)
values
  (1,  'qiantang-river', '钱塘江流域', '开阔自然湿地环境，整体刺激较低。', '/static/images/map-background.png', '适合作为开场缓冲区域。', '提前了解开放区域和步行动线。', '[]'::jsonb, 0.18, 0.20, 0.15, 0.18, 0.10, 1),
  (2,  'jellyfish-palace', '梦幻水母宫', '灯光柔和但局部人流会波动。', '/static/images/jellyfish.png', '注意局部灯光变化，味觉维度不参与计算。', '提前告诉孩子这里主要是灯光与漂浮视觉刺激。', '[]'::jsonb, 0.42, 0.18, 0.12, 0.16, null, 2),
  (3,  'walrus-theater', '海象剧场', '剧场时段噪音和聚集度较高。', '/static/images/sea-lion.png', '建议避开演出高峰。', '告诉孩子这里可能会出现掌声和扩音。', '[]'::jsonb, 0.56, 0.82, 0.24, 0.38, 0.10, 3),
  (4,  'manatee-bay', '海牛湾', '节奏平缓，适合短暂停留。', '/static/images/beluga.png', '适合短暂停留和状态恢复。', '提前说明这里节奏较慢、观看距离稳定。', '[]'::jsonb, 0.28, 0.24, 0.16, 0.20, 0.10, 4),
  (5,  'capybara-village', '水豚部落', '可从外围低刺激区域开始适应。', '/static/images/restaurant.png', '从外围慢慢靠近更舒适。', '先在外围看，再决定是否进一步停留。', '[]'::jsonb, 0.24, 0.22, 0.20, 0.18, 0.12, 5),
  (6,  'polar-wolf-valley', '北极狼谷', '场地安静，但通道偶有会车。', '/static/images/map-background.png', '转弯与会车时提前提醒。', '提前说好如果人多就先停一下。', '[]'::jsonb, 0.34, 0.28, 0.14, 0.26, 0.10, 6),
  (7,  'otter-beaver-house', '水獭海狸屋', '动物活跃，视觉动态较多。', '/static/images/restaurant.png', '如果视觉追踪压力大，可缩短停留时间。', '说明这里动物移动会比较频繁。', '[]'::jsonb, 0.50, 0.32, 0.14, 0.18, 0.10, 7),
  (8,  'walrus-hall', '海象馆', '静态科普展示为主，整体友好。', '/static/images/sea-lion.png', '适合安静浏览。', '这是偏静态展陈，可以慢慢看。', '[]'::jsonb, 0.22, 0.18, 0.12, 0.18, 0.08, 8),
  (9,  'rainforest-dolphin-bay', '雨林海豚湾', '局部湿热与声音变化较明显。', '/static/images/map-background.png', '注意湿热和局部环境声。', '提前说明温度和声音会有变化。', '[]'::jsonb, 0.44, 0.46, 0.30, 0.24, 0.10, 9),
  (10, 'sea-lion-theater', '海狮剧场', '演出前后人流和欢呼声较强。', '/static/images/sea-lion.png', '优先避开演出前后时段。', '演出区会更响、更拥挤。', '[]'::jsonb, 0.60, 0.88, 0.18, 0.34, 0.10, 10),
  (11, 'north-sea-lion-hall', '北海狮馆', '非演出时段相对平稳。', '/static/images/sea-lion.png', '可优先选择非演出时段参观。', '提前说好如果人变多就先离开。', '[]'::jsonb, 0.36, 0.40, 0.14, 0.22, 0.10, 11),
  (12, 'beluga-bay', '白鲸海', '观赏节奏缓慢，易建立预期。', '/static/images/beluga.png', '适合作为舒缓站点。', '这里节奏会更稳定，适合慢慢看。', '[]'::jsonb, 0.20, 0.18, 0.10, 0.16, 0.08, 12),
  (13, 'penguin-island', '企鹅岛', '温度偏低，建议提前保暖。', '/static/images/map-background.png', '提前做好保暖会提升舒适度。', '告诉孩子这里比较冷，先准备好。', '[]'::jsonb, 0.34, 0.30, 0.16, 0.20, 0.10, 13),
  (14, 'polar-bear-seal-zone', '棕熊馆/北极熊馆/海豹馆', '通路较长，局部人流密度较高。', '/static/images/map-background.png', '如果疲劳或拥挤，可以拆分参观。', '把长路线拆成几段会更容易接受。', '[]'::jsonb, 0.58, 0.52, 0.20, 0.36, 0.10, 14)
on conflict (id) do update
set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  tips = excluded.tips,
  story_intro = excluded.story_intro,
  social_stories = excluded.social_stories,
  s_visual = excluded.s_visual,
  s_auditory = excluded.s_auditory,
  s_olfactory = excluded.s_olfactory,
  s_tactile = excluded.s_tactile,
  s_taste = excluded.s_taste,
  display_order = excluded.display_order,
  is_active = true;

commit;

-- Example usage:
-- select * from public.get_profile_venue_scores('47f3b8e2-9a1c-4b6d-8e5f-2c3d4e5f6a78');
--
-- Frontend suggestion:
-- - Map page should call RPC get_profile_venue_scores(profile_id)
-- - Use friendliness_pct for width / score
-- - Use friendliness_color in {'red','yellow','green'} for three-color rendering
