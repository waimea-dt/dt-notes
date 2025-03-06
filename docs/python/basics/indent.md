---
title: Code Indentation
tags:
  - python
---

# Code Indentation

Python defines code blocks using **indentation** - spaces that 'push' the code in from the left side of the code editor.

For example, look at this code:

```python
if weather == "sunny":
    print("It will be sunny today")
    print("Wear sunscreen!")

print("Time to go to the beach...")
```

Some of the commands are 'pushed in' or **indented** with spaces (usually four) at the start of the line:

```python linenums="1" hl_lines="2 3"
if weather == "sunny":
    print("It will be sunny today")
    print("Wear sunscreen!")

print("Time to go to the beach...")
```

The commands on lines 2 and 3 form a **block** of code which belongs to the `#!python if` command on line 1. The indented commands will only be run when the `#!python if` command is **true** (when the weather is sunny).

Note that the command on line 5 is not indented:

```python { .show-indent }
def report():
    while True:
        weather = input("Weather today: ")
        if weather == "sunny":
            print("It will be sunny today")
            print("Wear sunscreen!")

            if time == "now":
                print("Ding!")
            else:
                print("Dong!")

    print("Time to go to the beach...")
```

It does not belong to the `#!python if` command and will always run, whatever the weather.

## How to Indent and Unindent Code

You can use the spacebar to indent code, but there is a better way...

- Press the ++tab++ key to indent the code (push it right by four spaces)
- Press ++shift+tab++ to unindent the code (pull it left, removing four spaces)


