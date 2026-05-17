create table if not exists assets (
  asset_id text primary key,
  asset_name text not null,
  asset_type text not null,
  region text not null,
  longitude real,
  latitude real,
  status text not null,
  base_score integer not null
);

create table if not exists links (
  link_id text primary key,
  source_asset_id text not null references assets(asset_id),
  target_asset_id text not null references assets(asset_id),
  link_type text not null,
  load integer not null,
  status text not null
);

create table if not exists services (
  service_id text primary key,
  service_name text not null,
  source_asset_id text not null references assets(asset_id),
  target_asset_id text not null references assets(asset_id),
  importance text not null,
  status text not null
);

create table if not exists alerts (
  alert_id text primary key,
  asset_id text not null references assets(asset_id),
  level text not null,
  message text not null,
  owner text not null,
  age_minutes integer not null
);
