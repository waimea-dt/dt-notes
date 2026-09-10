# Getting Summary Data with SQL

## The GROUP BY Clause

Summary queries use **aggregate functions** to calculate totals, counts, and averages. The syntax is:

```sql
SELECT field_name, FUNCTION(field_name)
FROM table_name
GROUP BY field_name
```

> [!TIP]
> Common aggregate functions include `COUNT()`(sql), `SUM()`(sql), `AVG()`(sql), `MIN()`(sql), and `MAX()`(sql)


## Example - Count Records

Count how many players are in each class:

```sql
SELECT class, COUNT(*) AS total_players
FROM players
GROUP BY class
```

The `COUNT(*)`(sql) function counts the **number of records** in each group.


## Example - Calculate Average

Calculate the average rank in each class:

```sql
SELECT class, AVG(rank) AS avg_rank
FROM players
GROUP BY class
```

The `AVG()`(sql) function calculates the **average value** of the `rank`(sql) field for each group.


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

Try running some **SELECT** queries that have **summary** fields, using **GROUP BY**...

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
SELECT house, COUNT(*) AS num_students
FROM students
GROUP BY house
```

> [!TIP]
> If you get `request failed` when you try to run your SQL, just **try again**!
