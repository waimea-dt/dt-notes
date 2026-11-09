# 🚀 Managing Projects with `uv`

Follow this guide to set up, manage, and run your Python apps without running into IT permission blocks or activation errors.

---

## 🛠️ Step 1: Install `uv` (First Time Only)

Open your project folder in **VS Code**, open the built-in terminal (`Ctrl + ~`), and run:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh | iex"
```

> ⚠️ **CRITICAL STEP:** Once the installation finishes, **close your VS Code terminal and open a new one**. This reloads your system environment paths.
> Verify it works by running: `uv --version`

---

## 📁 Step 2: Start a New Project

Navigate to your project directory in the terminal (ensure you are using local storage like `C:\Temp\` if network drives throw errors) and run:

```bash
uv init
```

### What just happened?
`uv` safely creates a modern Python project structure without touching admin registries:
* `pyproject.toml` 📄 – Your new configuration file (replaces `requirements.txt`).
* `hello.py` 🐍 – A starter script ready to test execution.
* `.python-version` ⚙️ – Pinpoints the Python version for your project.

---

## 📦 Step 3: Managing Packages (No `requirements.txt`)

Instead of writing text files by hand, you use the terminal to instantly fetch packages. `uv` will automatically create your isolated virtual environment (`.venv`) on the fly.

### To add new packages:
```bash
uv add requests pandas
```

### To remove packages you no longer need:
```bash
uv remove requests
```

### Migrating an older project?
If you have an old project that relies on an existing `requirements.txt` file, convert it to the new standard by running:
```bash
uv add -r requirements.txt
```

---

## 🏃 Step 4: Running Your App

**Forget activating virtual environments.** You do not need to run script execution commands that IT blocks. Simply use `uv run`:

```bash
uv run hello.py
```

* `uv run` ensures the file executes using exactly the dependencies listed in your `pyproject.toml`.

---

## 💻 Step 5: Connecting Code Autocomplete in VS Code

To make sure your code suggestions, errors, and imports display correctly inside VS Code:

1. Look at the bottom-right corner of your VS Code window for the Python version (or press `Ctrl + Shift + P` and search **"Python: Select Interpreter"**).
2. Select the interpreter labelled **(.venv) ./ .venv/Scripts/python.exe** (or look inside your local project folder).

---

## ⏱️ Quick Commands Reference

* **`uv init`** ➡️ Setup a brand new folder structure.
* **`uv add <package>`** ➡️ Download a package and add it to your project tracking.
* **`uv remove <package>`** ➡️ Delete a package from your project tracking.
* **`uv run <file.py>`** ➡️ Safely execute your script without terminal activation errors.


---

## 🔍 Troubleshooting Lab Environment Issues

### 🌐 Issue 1: "Network Connection Blocked" / "SSL Certificate Failed"
School networks often route web traffic through strict firewalls or proxies that block standard package downloads.

* **The Fix:** Tell `uv` to look past custom system certificates or explicitly bypass them for package registry calls using native fallbacks. Try running your install or add command with the system native certificate store flag:
  ```bash
  uv add pandas --native-tls
  ```
* **If it still fails:** Ask your IT administrator for the proxy URL. If they provide it (e.g., `http://school.lan`), you can inject it directly into your terminal session before installing:
  ```powershell
  \$env:HTTP_PROXY="http://school.lan"
  \$env:HTTPS_PROXY="http://school.lan"
  ```

### 🐢 Issue 2: "Permission Denied" or Extremely Slow Execution
If your school profiles store your files on a network drive (often mapped to an `H:` or `Z:` drive), Python running from inside a network directory can trigger OS lockouts or crawl to a halt.

* **The Fix:** Move your project folder to a local directory physically attached to the PC's hard drive.
* Open your file manager and find a public or temporary workspace, such as:
  `C:\Temp\` or `C:\Users\Public\Documents\`
* Create your project folder there and open *that* workspace inside VS Code instead.

### 🎨 Issue 3: Missing GUI components (Tkinter, Pygame, Turtle)
Some school IT installations strip down Python to its bare bones to save disk space, which accidentally breaks visual libraries used for programming classes.

* **Tkinter Errors:** If a student imports `tkinter` and gets a module error, the base Python installation on the machine is missing internal components. You cannot fix this with `uv add`. The IT department must reinstall Python on the machine and ensure the **"tcl/tk and IDLE"** checkbox is checked during the installer setup.
* **Pygame / Arcade Blocks:** If you are building video games and the window instantly crashes, ensure the machine's basic display adapter has local hardware acceleration enabled. If IT has blocked graphic driver configurations, have students use `uv run` while outputting logs to a file to find out if it's a driver conflict:
  ```bash
  uv run main.py > debug_log.txt 2>&1
  ```
