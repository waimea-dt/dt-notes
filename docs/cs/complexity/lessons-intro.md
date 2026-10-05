# Algorithmic Complexity Lesson

## Introduction to Complexity

Covers what we mean by 'complexity' and what it is a measure of.

<slides>

# Algorithmic Complexity

What it is and how we measure it

---

||| 3fr 2fr

## Algorithm

An algorithm is a **set of steps or instructions**

|||

![Flowchart](_assets/algorithm.png)

|||

---

||| 5fr 3fr

## Example Algorithm

1. Put a teabag in the cup
2. Pour in boiling water
3. Wait for 1 min
4. Remove teabag
5. Add a splash of milk
6. Drink!

|||

![Tea](_assets/tea.webp)

|||

---

|||

## Computer Algorithm

Computer algorithms are more formally written using a **programming language**

|||

```python
def sum_array(array):
  total = 0
  for item in array:
    total += item
  return total
```

|||

---

||| 2fr 1fr

## Effort

Algorithms require '**effort**' to run...

The computer's **CPU** needs to perform various **operations**, which take **time**

|||

![CPU](_assets/cpu.png)

|||

---

||| 3fr 2fr

## Complexity

Complexity is the **measure of the effort required** to run an algorithm

Or, we could also say, it's a measure of the **time taken** to run the algorithm

|||

![Effort Meter](_assets/effort-gauge.png)

|||


</slides>




## Measuring Complexity

Covers how effort relates to problem size, and different algorithms have different relationships.

<slides>

# Measuring Complexity

---

## Problem Size, N

Algorithms usually get feed a **set of data values**, e.g. a list of names, or the location of enemy ships in a game.

The **size** of this data is written as **N**

---

# **N** = **size of the input data** for an algorithm or problem

---

## Effort can Vary with N

The **effort** to solve an algorithm can change as the **size of the input data (N) increases**

---

## Example 1 - Sum a List of Numbers

If we have a list of **three numbers**:

```python
[12, 4, 7]
```

How many steps / operations will it take to add them up?

---

## Example 1 - Sum a List of Numbers

It will take **three operations** (three additions):

+++ list
- Add the first value to the total
- Add the second value to the total
- Add the third value to the total

---

## Example 1 - Sum a List of Numbers

So, how about a list of a **hundred numbers**:

```python
[12, 4, 7, 56, 25, 5, 41, 17, 3, 83, 1, ... ,67]
```

How many steps / operations will it take to add them up?

---

## Example 1 - Sum a List of Numbers

It will take a **hundred operations** (all additions):

+++ list
- Add the first value to the total
- Add the second value to the total
- Add the third value to the total
- ...
- Add the hundredth value to the total

---

## Example 1 - Sum a List of Numbers

For this algorithm:

# effort = **N**

*Remember that effort = operations / steps = time taken*

---

## Example 2 - Access First List Value

If we have a list of **three numbers**:

```python
[12, 4, 7]
```

How many operations will it take to access the first value?

---

## Example 2 - Access First List Value

It will take **one operation**:

+++

- Go to the start of the list and get the value

---

## Example 2 - Access First List Value

So, how about a list of a **hundred numbers**:

```python
[12, 4, 7, 56, 25, 5, 41, 17, 3, 83, 1, ... ,67]
```

How many operations will it take to access the first value?

---

## Example 2 - Access First List Value

It will still take just **one operations**:

+++

- Go to the start of the list and get the value

+++

*The the size of the list, N, does not matter!*

---

## Example 2 - Access First List Value

For this algorithm:

# effort = **1**

*The the size of the list, N, does not matter!*

---

## Example 3 - Sorting a List of Values

If we have a list of a **hundred numbers**:

```python
[12, 4, 7, 56, 25, 5, 41, 17, 3, 83, 1, ... ,67]
```

How many operations will it take to put them into order?

---

## Example 3 - Sorting a List of Values

<videoembed id="Cq7SMsQBEUw"></videoembed>

---

## Example 3 - Sorting a List of Values

Using a simple **Bubble Sort** algorithm on a **hundred numbers**, requires:
- Running through the numbers a **hundred times**,
- Each time performing a **hundred operations**

That's **10,000 operations** in total!

---

## Example 3 - Sorting a List of Values

For this algorithm:

# effort = **N<sup>2</sup>**

---

# Best, Average and Worst Cases

Considering using a Bubble Sort to sort a list...

---

## Bubble Sort, **Best**-Case

If **the values are already in order**, the sorting would just take just a single pass through to check.

If this case:

## effort = **N**

---

## Bubble Sort, **Average**-Case

If **the values are in a random order**, the sorting would involve multiple passes, but some would involve few operations.

If this case:

## effort = **N<sup>2</sup> / 2**

---

## Bubble Sort, **Worst**-Case

If **the values are completely in reverse order**, the sorting would involve multiple passes, each involving many operations.

If this case:

## effort = **N<sup>2</sup>**

---

## Which case is the most **important** / **interesting**?

---

# We focus on the **Worst Case**

- If we understand the worst-case scenario, we can design systems to cope with that.
- If the situation is not the worst-case, the system will still work just fine.

</slides>




## Big-O Notation

Covers how we categorise algorithmic complexity using BigO notation.

<slides>

# Big-O Notation

---

## Effort Varies with N

We know that:
- **Effort** can vary as **N increases**
- The effort depends on the **algorithm** (1, N, N<sup>2</sup>, etc.)
- We focus on the **worst-case** scenario

---

## Categorising Algorithms

We group algorithms into **categories** based on **how their effort varies as N increases**, so we group:

- All the **effort-never-changes** algorithms together
- All the **effort = N** algorithms together
- All the **effort = N<sup>2</sup>** algorithms together
- etc.

---

## Naming the Categories

We use a system called **Big-O Notation** to name the categories. Each name takes the form:

# O(...)

*The 'O' means 'order of'*

We refer the them as **Big-O Time Complexity** categories

---

## Big-O Time Complexities

| Complexity           | Name        |
| -------------------- | ----------- |
| **O(1)**             | Constant    |
| **O(log N)**         | Logarithmic |
| **O(N)**             | Linear      |
| **O(N log N)**       | Log-Linear  |
| **O(N<sup>2</sup>)** | Quadratic   |
| **O(N<sup>3</sup>)** | Cubic       |
| **O(2<sup>N</sup>)** | Exponential |
| **O(N!)**            | Factorial   |

---

<big-o-chart></big-o-chart>

---

||| 1fr 1fr

## **O(1)** - **Constant** Time Complexity

The effort / time taken is **always the same** and doesn't vary as N increases

|||

![O(1) chart](_assets/constant.png)

|||

---

||| 2fr 1fr

## **O(N)** - **Linear** Time Complexity

The effort / time taken is increases **proportinally to N** as N increases

|||

![O(N) chart](_assets/linear.png)

|||

</slides>
