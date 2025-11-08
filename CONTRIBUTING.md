# 🧩 Contributing to CarbonX

Thank you for your interest in contributing to **CarbonX**! 🎉  
We’re excited to have you join our open-source community. This guide will help you make your first contribution successfully and maintain consistency across the project.

---

## 🚀 Getting Started

### 1. Fork the Repository
Click the **Fork** button at the top-right corner of the [CarbonX repository](https://github.com/AkshitTiwarii/carbonx).  
This will create a copy of the repository under your GitHub account.

### 2. Clone Your Fork
Clone your forked repository to your local machine:

```bash
git clone https://github.com/<your-username>/carbonx.git
```
### 3. Navigate to the Project Directory

```bash
cd carbonx
```
### 4. Add the Original Repository as a Remote
```bash
git remote add upstream https://github.com/AkshitTiwarii/carbonx.git
```
This helps you keep your fork up to date with the main project.

## Creating a New Branch
Before you start making changes, create a new branch:
```bash
git checkout -b feature/your-feature-name
```
Branch Naming Conventions:
feature/<name> → for new features
fix/<name> → for bug fixes
docs/<name> → for documentation updates
refactor/<name> → for code improvements

Example:
```bash
git checkout -b fix/navbar-alignment
```
## 🛠️ Making Changes

Follow the existing code style and naming conventions.
Keep your changes small and focused on a single topic.
Write clear, descriptive comments in your code.
If you add a new feature, ensure it’s well-documented.

🧑‍💻 Coding Style Guidelines

Indentation: 2 spaces (no tabs)

Naming conventions:
```bash
Variables & functions → camelCase
Components & classes → PascalCase
Constants → UPPER_SNAKE_CASE
```
Use meaningful names for all functions, variables, and files.

Keep your code clean and modular. Avoid duplication.

## Commit Guidelines

Use clear and descriptive commit messages:
```bash
git commit -m "fix: corrected navbar alignment issue"
```

Commit Message Format:

```bash
<type>: <short description>
```

Common Types:
```bash
feat: — new feature

fix: — bug fix

docs: — documentation change

refactor: — code improvement

style: — formatting, missing semi-colons, etc.

chore: — build process, tools, or dependencies
```

Example:
```bash
feat: add user authentication module
fix: resolve login redirect bug
docs: update README with setup steps
```

## 🔄 Keeping Your Fork Updated

Before making a pull request, make sure your fork is up to date:
```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## 📤 Submitting a Pull Request (PR)

- Push your branch to your fork:

```bash
git push origin feature/your-feature-name
```

## 📤 Submitting a Pull Request (PR)

- Go to your fork on **GitHub**.  
- Click **“Compare & pull request”**.  
- **Fill in the PR template:**
  - A clear **title**.  
  - A short **description** of what you changed and why.  
  - Reference related issues using `Fixes #issue-number`.  
- **Wait for the maintainers to review your PR.**  
- Be ready to make changes if requested! ✨


## 🐛 Reporting Issues

Found a bug or want to request a feature? Open an issue!

### Issue Format:

#### Title:
Short and descriptive (e.g., “Navbar not responsive on mobile”)

#### Description:

- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)

#### Labels:
Use labels like ``` bug```, ```enhancement```, ```documentation```, etc. when possible.

## 🧾 Additional Tips

- Keep your PRs **focused** — one feature or bug fix per pull request.  
- Always **test** your changes before submitting.  
- Be respectful and collaborative — we’re all here to learn and build together. 💙

## 🤝 Code of Conduct

By participating in this project, you agree to uphold our community standards:

- Be respectful and welcoming.  
- Offer constructive feedback.  
- Assume good intent from others.  
- Collaborate and share knowledge freely.  

---

## 💡 Need Help?

If you have any questions, feel free to:

- Open a [discussion](https://github.com/AkshitTiwarii/carbonx/discussions)  
- Or reach out via [issues](https://github.com/AkshitTiwarii/carbonx/issues)  

---

## 🧠 Final Note

Every contribution — big or small — makes a difference.  
Thank you for helping improve **CarbonX**! 🌟

