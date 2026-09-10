# Relationships Between Tables

When a database has been fully normalised, the resulting tables have **foreign keys** which create relationships between tables.

## One-to-Many Relationships

In the example we looked at in [Database Normalisation](/db/normal.md), the students table contained a foreign key **linking each student to a house**...

<db-data>

| students |          |           |            |              |
| -------- | -------- | --------- | ---------- | ------------ |
| PK num   | forename | surname   | dob        | FK house !!! |
| -----    | -------- | --------  | ---------- | -----        |
| 17034    | Dave     | McPickle  | 2001-01-01 | Ru           |
| 17037    | Karen    | Cheeto    | 2005-06-02 | Co           |
| 17041    | Pierre   | Fromage   | 2003-12-24 | Ru           |
| 17067    | Nigel    | Pullet    | 2004-01-07 | Ca           |
| 17078    | Helen    | Clark     | 2003-07-15 | Hi           |
| 17079    | Geoff    | Trousers  | 2005-06-18 | Ca           |
| 17088    | Jenny    | Gingernut | 2002-12-23 | Ru           |
| 17092    | Tui      | Davies    | 2005-09-14 | Ng           |


| houses      |            |      |
| ----------- | ---------- | ---- |
| PK code !!! | name       | dean |
| -----       | -----      | ---- |
| Ca          | Carrington | KTY  |
| Co          | Cooper     | LGT  |
| Hi          | Hillary    | MRQ  |
| Ru          | Rutherford | SDW  |

</db-data>

This is now the schema (structure) of a our database...

<db-schema>

| students |          |         |
| -------- | -------- | ------- |
| PK       | num      | INTEGER |
|          | forename | TEXT    |
|          | surname  | TEXT    |
|          | dob      | DATE    |
| FK !!!   | house    | TEXT    |

| houses |      |      |
| ------ | ---- | ---- |
| PK !!! | code | TEXT |
|        | name | TEXT |
|        | dean | TEXT |

</db-schema>

In this case, the relationship is a **one-to-many** / **many-to-one** relationship:
- one house has many students, and
- many students belong to one house

<db-relationship>

- students
    - many-to-one !!
- houses

</db-relationship>


> [!NOTE]
> **One-to-many** or **many-to-one**...? It all depends which direction your are looking in! In this example, the relationship between houses and students is read as '**one-to-many**', but looking the other way, the relationship between students and houses is read '**many-to-one**'


## Many-to-Many Relationships

Sometimes data has a **many-to-many** relationship, where records in one table link to many in another and vice-versa.

> [!EXAMPLE]
> What is the relationship between a table of students and a table of classes? Each student has many classes, and each class has many students, so it's a **many-to-many** relationship.

<db-relationship>

- classes
    - many-to-many !!
- students

</db-relationship>

The practical solution to this type of relationship is a **link table**...

### Link Tables

When we have tables requiring a **many-to-many** relationship, the practical solution is to create a small **link table** (sometime called a **join table**) that sits between them, with **one-to-many** relationships to each one...

<db-relationship>

- classes
    - 1:m !!
- members ++ !!!
    - m:1 !!
- students --

</db-relationship>

> [!NOTE]
> **Why Do We Need Link Tables?**
> A many-to-many relationship between tables can't be created using just a single foreign key in each table, since that just lets us connect to a **single item of data**. We could add multiple foreign keys, but where do we stop? We'll either end up with too many, or not enough. This is not a good solution


### Creating the Link Table

The link table:
- Contains a **foreign key** to each table
- These foreign keys can be joined to create a **composite primary key** (no additional key is needed)

So, for the above example, the schema now looks like this:

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


| students |       |         |
| -------- | ----- | ------- |
| PK       | id    | INTEGER |
|          | name  | TEXT    |
|          | notes | TEXT    |

</db-schema>

Note that other fields can be added to the link table if needed. For this example, we might add `grade` and `attendance` fields to let us record the student's grade and attendance for that particular class...

<db-schema>

| classes |         |      |
| ------- | ------- | ---- |
| PK      | code    | TEXT |
|         | subject | TEXT |
|         | teacher | TEXT |


| members |            |         |
| ------- | ---------- | ------- |
| PK FK   | class_code | TEXT    |
| PK FK   | student_id | INTEGER |
|         | attendance | INTEGER |
|         | grade      | TEXT    |


| students |       |         |
| -------- | ----- | ------- |
| PK       | id    | INTEGER |
|          | name  | TEXT    |
|          | notes | TEXT    |

</db-schema>


### Adding Data to the Link Table

Link tables like this are infinitely **flexible** - you can have as many or as few connections between the tables as needed.

In the above example, we add students as members of classes by adding records to the link table like so, adding rows as needed:

<db-data>

| members ++       |                  |            |       |
| ---------------- | ---------------- | ---------- | ----- |
| PK FK class_code | PK FK student_id | attendance | grade |
| 100DTD           | 23123            | 95         | A     |
| 100DTD           | 23321            | 100        | M     |
| 100DTD           | 23246            | 78         | E     |
| ...              |                  |            |       |
| 200DTD           | 22012            | 100        | E     |
| 200DTD           | 22734            | 95         | M     |
| ...              |                  |            |       |
| 300DTD           | 21425            | 100        | NA    |
| ...              |                  |            |       |

</db-data>