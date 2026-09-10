# Filtering Data with SQL

## The WHERE Clause

`WHERE`(sql) filters rows based on specific **criteria**. The syntax is:

```sql
SELECT field_name, field_name, ...
FROM table_name
WHERE criteria
```

> [!NOTE]
> Without a `WHERE`(sql) clause, SQL returns **all rows** from the table


## Example - Simple Filter

Only return players at rank 10 or higher:

```sql
SELECT name, rank
FROM players
WHERE rank >= 10
```

Only records matching `rank >= 10`(sql) will be returned.


## Example - Multiple Conditions

Return players in the Wizard class at rank 10 or higher:

```sql
SELECT name, rank, class
FROM players
WHERE class = 'Wizard'
  AND rank >= 10
```

> [!TIP]
> Use `AND`(sql) when **all conditions** must be true
> Use `OR`(sql) when **either condition** can be true


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

Try running some **SELECT** queries with **WHERE** clauses...

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
SELECT forename
FROM students
WHERE house='Ru'
```

> [!TIP]
> If you get `request failed` when you try to run your SQL, just **try again**!
