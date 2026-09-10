# Combining Data from Multiple Tables with SQL

## The JOIN Clause

`JOIN`(sql) combines rows from two tables using related columns. The syntax is:

```sql
SELECT table1.field, table2.field, ...
FROM table1
JOIN table2 ON table1.foreign_key = table2.primary_key
```

> [!NOTE]
> The `ON`(sql) clause specifies how rows are matched - typically using the **foreign key** / **primary key** connection


## Example - Simple Join

Given these tables:

- `players(id, name, rank, notes, team_id)`
- `teams(id, name, notes)`

Get each player with their team name:

```sql
SELECT
    players.name,
    teams.name
FROM players
JOIN teams ON players.team_id = teams.id
```

This combines data from both tables where `players.team_id`(sql) matches `teams.id`(sql).


## Example - Using Column Aliases

When both tables have fields with the same name (like `name`), use **aliases** to differentiate them:

```sql
SELECT
    players.name AS p_name,
    teams.name   AS t_name
FROM players
JOIN teams ON players.team_id = teams.id
```

The `AS`(sql) keyword creates an **alias** for each column in the results.


## Try it Yourself

Here are some connected tables, linked by a **foreign key**, containing some data:

<db-data>

| students |          |           |            |          |
| -------- | -------- | --------- | ---------- | -------- |
| PK num   | forename | surname   | dob        | FK house |
| -----    | -------- | --------  | ---------- | -----    |
| 17034    | Dave     | McPickle  | 2001-01-01 | Ru       |
| 17037    | Karen    | Cheeto    | 2005-06-02 | Co       |
| 17041    | Pierre   | Fromage   | 2003-12-24 | Ru       |
| 17067    | Nigel    | Pullet    | 2004-01-07 | Ca       |
| 17078    | Helen    | Clark     | 2003-07-15 | Hi       |
| 17079    | Geoff    | Trousers  | 2005-06-18 | Ca       |
| 17088    | Jenny    | Gingernut | 2002-12-23 | Ru       |
| 17092    | Tui      | Davies    | 2005-09-14 | Ng       |


| houses  |            |      |
| ------- | ---------- | ---- |
| PK code | name       | dean |
| -----   | -----      | ---- |
| Ca      | Carrington | KTY  |
| Co      | Cooper     | LGT  |
| Hi      | Hillary    | MRQ  |
| Ng      | Ngata      | CFQ  |
| Ru      | Rutherford | SDW  |
| Sh      | Sheppard   | HJE  |

</db-data>

Try running some **SELECT** queries that pull data from both tables at once, using **JOIN**...

```sql id=setup
CREATE TABLE houses (
	code TEXT PRIMARY KEY,
	name TEXT NOT NULL,
    dean TEXT NOT NULL
);

CREATE TABLE students (
    num      INTEGER PRIMARY KEY,
    forename TEXT NOT NULL,
    surname  TEXT NOT NULL,
    dob      TEXT NOT NULL,
    house    TEXT NOT NULL,

	FOREIGN KEY (house) REFERENCES houses(code)
);

INSERT INTO houses (code, name, dean)
VALUES
    ('Ca', 'Carrington', 'KTY'),
    ('Co', 'Cooper',     'LGT'),
    ('Hi', 'Hillary',    'MRQ'),
    ('Ng', 'Ngata',      'CFQ'),
    ('Ru', 'Rutherford', 'SDW'),
    ('Sh', 'Sheppard',   'HJE');

INSERT INTO students (num, forename, surname, dob, house)
VALUES
    (17034, 'Dave',   'McPickle',  '2001-01-01', 'Ru'),
    (17037, 'Karen',  'Cheeto',    '2005-06-02', 'Co'),
    (17041, 'Pierre', 'Fromage',   '2003-12-24', 'Ru'),
    (17067, 'Nigel',  'Pullet',    '2004-01-07', 'Ca'),
    (17078, 'Helen',  'Clark',     '2003-07-15', 'Hi'),
    (17079, 'Geoff',  'Trousers',  '2005-06-18', 'Ca'),
    (17088, 'Jenny',  'Gingernut', '2002-12-23', 'Ru'),
    (17092, 'Tui',    'Davies',    '2005-09-14', 'Ng');
```

```sql run depends=setup
SELECT
    students.num,
    students.forename,
    houses.name AS house,
    houses.dean
FROM students
JOIN houses ON students.house = houses.code
```

> [!TIP]
> If you get `request failed` when you try to run your SQL, just **try again**!
