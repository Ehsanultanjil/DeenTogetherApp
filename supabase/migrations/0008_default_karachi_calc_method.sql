-- App defaults to University of Islamic Sciences, Karachi (recommended for
-- Bangladesh) rather than Muslim World League. Only changes the default for
-- new signups — existing users keep whatever they already have selected.
alter table profiles alter column calc_method set default 'Karachi';
