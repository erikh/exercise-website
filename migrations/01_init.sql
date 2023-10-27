CREATE TABLE exercises (
  id integer primary key autoincrement,
  name varchar not null unique
);

CREATE TABLE reps (
  id integer primary key autoincrement,
  exercise_id integer not null,
  count integer not null,
  date datetime not null default CURRENT_TIMESTAMP
);

CREATE TABLE done (
  exercise_id integer not null,
  reps_id integer not null,
  count integer not null,
  date datetime not null default CURRENT_TIMESTAMP
);
