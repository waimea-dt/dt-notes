# Creating Many-to-Many Relationships

## Example - Linking Table

For this schema, taken from the [Table Relationships](/db/relationship.md) notes, which uses a **link table** to create a **many-to-many** relationship...

<db-relationship>

- classes
    - 1:m !!
- members ++ !!!
    - m:1 !!
- students --

</db-relationship>

... with this schema ...

<db-schema>

| classes |         |      |
| ------- | ------- | ---- |
| PK      | code    | TEXT |
|         | subject | TEXT |
|         | teacher | TEXT |


| members   |            |         |
| --------- | ---------- | ------- |
| PK FK !!! | class_code | TEXT    |
| PK FK !!! | student_id | INTEGER |
|           | attendance | INTEGER |
|           | grade      | TEXT    |


| students |       |         |
| -------- | ----- | ------- |
| PK       | id    | INTEGER |
|          | name  | TEXT    |
|          | notes | TEXT    |

</db-schema>

## The SQL

We would first create the two outer tables with this SQL:

```sql
CREATE TABLE classes (
	code    TEXT PRIMARY KEY,
	subject TEXT NOT NULL,
    teacher TEXT NOT NULL
)
```

```sql
CREATE TABLE students (
	id    INTEGER PRIMARY KEY,
	name  TEXT NOT NULL,
    notes TEXT
)
```

And then create the link table with its **foreign keys** and **composite primary key**:

```sql
CREATE TABLE members (
    class_code  TEXT    NOT NULL,
	student_id  INTEGER NOT NULL,
    attendance  INTEGER DEFAULT 0,
    grade       TEXT    DEFAULT "NA",

    PRIMARY KEY (student_id, class_code),

	FOREIGN KEY (student_id) REFERENCES students(id),
	FOREIGN KEY (class_code) REFERENCES classes(code)
)
```

