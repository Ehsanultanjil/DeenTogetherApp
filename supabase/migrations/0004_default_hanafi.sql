-- App defaults to Hanafi (the majority madhab in Bangladesh, the app's
-- primary audience) rather than Shafi'i.
alter table profiles alter column madhab set default 'hanafi';
