# Sorting Data with SQL

## The ORDER BY Clause

`ORDER BY`(sql) sorts query results. The syntax is:

```sql
SELECT field_name, field_name, ...
FROM table_name
ORDER BY field_name ASC|DESC
```

> [!TIP]
> Use `ASC`(sql) for **ascending** order (smallest to largest) or `DESC`(sql) for **descending** order (largest to smallest)


## Example - Ascending Order

Sort by rank from smallest to largest:

```sql
SELECT name, rank
FROM players
ORDER BY rank ASC
```

Results are sorted in **ascending** order by the `rank`(sql) field.


## Example - Descending Order

Sort by rank from largest to smallest:

```sql
SELECT name, rank
FROM players
ORDER BY rank DESC
```

Results are sorted in **descending** order by the `rank`(sql) field.


## Example - Multiple Sort Columns

Sort by multiple columns:

```sql
SELECT name, rank, class
FROM players
ORDER BY class ASC, rank DESC
```

Results are first sorted by `class`(sql) in ascending order, then by `rank`(sql) in descending order within each class.


## Try it Yourself

Here is a table containing some data:

<db-data>

| students |          |           |            |       |
| -------- | -------- | --------- | ---------- | ----- |
| PK num   | forename | surname   | dob        | house |
| -----    | -------- | --------  | ---------- | ----- |
| 17034    | Dave     | McPickle  | 2001-01-01 | Ru    |
| 17037    | Karen    | Cheeto    | 2005-06-02 | Co    |
| 17041    | Pierre   | Fromage   | 2003-12-24 | Ru    |
| 17067    | Nigel    | Pullet    | 2004-01-07 | Ca    |
| 17078    | Helen    | Clark     | 2003-07-15 | Hi    |
| 17079    | Geoff    | Trousers  | 2005-06-18 | Ca    |
| 17088    | Jenny    | Gingernut | 2002-12-23 | Ru    |
| 17092    | Tui      | Davies    | 2005-09-14 | Ng    |

</db-data>

Try running some **SELECT** queries with **ORDER BY** clauses...

```sql id=setup
CREATE TABLE students (
    num      INTEGER PRIMARY KEY,
    forename TEXT NOT NULL,
    surname  TEXT NOT NULL,
    dob      TEXT NOT NULL,
    house    TEXT NOT NULL
);

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
SELECT forename, dob
FROM students
ORDER BY dob DESC
```

> [!TIP]
> If you get `request failed` when you try to run your SQL, just **try again**!
