begin;

create or replace function public.generate_profile_pre_trip(
  p_profile_id uuid,
  p_limit integer default 10
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer := greatest(1, least(coalesce(p_limit, 10), 14));
  v_itinerary jsonb := '[]'::jsonb;
  v_pre_trip jsonb;
begin
  with ranked as (
    select
      v.id,
      v.name,
      v.description,
      v.tips,
      v.display_order,
      coalesce(p.friendliness_pct, 50) as friendliness_pct
    from public.venue_scores v
    left join public.get_profile_venue_scores(p_profile_id) p on p.id = v.id
    where v.is_active = true
    order by coalesce(p.friendliness_pct, 50) desc, v.display_order asc, v.id asc
    limit v_limit
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ranked.id,
        'name', ranked.name,
        'note',
        trim(
          both ' '
          from concat(
            coalesce(ranked.description, ''),
            case
              when coalesce(ranked.tips, '') <> '' then ' 建议：' || ranked.tips
              else ''
            end
          )
        )
      )
      order by ranked.friendliness_pct desc, ranked.display_order asc, ranked.id asc
    ),
    '[]'::jsonb
  )
  into v_itinerary
  from ranked;

  v_pre_trip := jsonb_build_object(
    'closing', '行程已根据当前感官测评结果自动生成，可按现场状态灵活调整停留顺序和时长。',
    'itinerary', v_itinerary
  );

  insert into public.asd_details (profile_id, pre_trip)
  values (p_profile_id, v_pre_trip)
  on conflict (profile_id) do update
  set pre_trip = excluded.pre_trip;

  return v_pre_trip;
end;
$$;

comment on function public.generate_profile_pre_trip(uuid, integer) is
'Generates and persists pre_trip in asd_details using venue_scores and get_profile_venue_scores.';

commit;
