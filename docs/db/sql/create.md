# Creating a Table with SQL

## The CREATE TABLE Command

`CREATE TABLE`(sql) is used to make a new table. The syntax is:

```sql
CREATE TABLE table_name (
	field_name TYPE ATTRIBUTES,
	field_name TYPE ATTRIBUTES,
	field_name TYPE ATTRIBUTES
)
```

> [!TIP]
> Use `CREATE TABLE IF NOT EXISTS table_name (...)`(sql) to avoid an error if the table you are creating might already exist


## Example - Players Table

Let's say we want to create a table to store player data that follows this schema:

<db-schema>

| players |       |         |               |
| ------- | ----- | ------- | ------------- |
| PK      | id    | INTEGER | AUTOINCREMENT |
|         | name  | TEXT    | NOT NULL      |
|         | rank  | INTEGER | DEFAULT 1     |
|         | class | TEXT    | NOT NULL      |

</db-schema>

This is the SQL we would need:

```sql
CREATE TABLE players (
	id    INTEGER PRIMARY KEY AUTOINCREMENT,
	name  TEXT    NOT NULL,
	rank  INTEGER DEFAULT 1,
	class TEXT    NOT NULL
)
```

> [!TIP]
> `AUTOINCREMENT` means that SQLite will **auto-generate an id** when you add a record, going up by 1 each time.


## Avoid Overwriting Existing Tables

You can alter the SQL slightly, adding `IF NOT EXISTS`(sql) to **prevent overwriting** a table that already exists:

```sql
CREATE TABLE IF NOT EXISTS players (
	...
)
```
