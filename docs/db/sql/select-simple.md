# Reading Data from a Table with SQL

## The SELECT Command

`SELECT`(sql) reads data from a table. The syntax is:

```sql
SELECT field_name, field_name, ...
FROM table_name
```

> [!TIP]
> Use `SELECT *`(sql) to retrieve all columns, but specify individual column names for better performance and readability


## Example - Selecting All Columns

Get all columns from all rows:

```sql
SELECT *
FROM players
```

The `*`(sql) means **all columns** will be returned.


## Example - Selecting Specific Columns

Get specific columns only:

```sql
SELECT name, rank
FROM players
```

Only the `name`(sql) and `rank`(sql) columns are returned. Selecting fewer columns can make results easier to read and improves query performance.


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

Try running some simple **SELECT** queries...

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
SELECT forename, house
FROM students
```

> [!TIP]
> If you get `request failed` when you try to run your SQL, just **try again**!
