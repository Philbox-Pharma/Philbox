# 🎉 Philbox Project Documentation

## ⚠️ IMPORTANT: User Management System Implementation Complete

**Status**: ✅ **COMPLETE AND OPERATIONAL** (Updated Jan 15, 2024)

The Philbox User Management system has been fully implemented with type-specific handling for Admin and Salesperson users. The server is running on port 5000 with MongoDB connected.

### 📚 User Management Documentation

- **Quick Start**: Read [VISUAL_SUMMARY.md](./VISUAL_SUMMARY.md) (5 min)
- **Quick Reference**: See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (2 min lookup)
- **API Documentation**: See [docs/USER_MANAGEMENT_API_GUIDE.md](./docs/USER_MANAGEMENT_API_GUIDE.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **All Docs**: See [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) (navigation guide)

### 🌐 API Endpoints

- **Admin Management**: 6 endpoints (create, list, get, search, update, delete)
- **Salesperson Management**: 7 endpoints (create, list, get, search, update, change status, delete)
- **Base URL**: `http://localhost:5000/api/super-admin/users`
- **Authentication**: Bearer token + super_admin role required

### 📊 Implementation Stats

- **Total Endpoints**: 13
- **Service Methods**: 13
- **Lines of Code**: 978
- **Documentation Files**: 7
- **Server Status**: Running on port 5000 ✅
- **Database**: MongoDB Connected ✅

---

# Git Branching Strategy & Workflow

## Table of Contents

- [Overview](#overview)
- [Branch Structure](#branch-structure)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Workflow Guide](#workflow-guide)
- [Pull Request Process](#pull-request-process)
- [Common Scenarios](#common-scenarios)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project follows a modified Git Flow strategy with three main branches and feature-based development. This approach ensures code quality, enables parallel development, and maintains stable releases.

**Key Principles:**

- Never commit directly to `main`, `staging`, or `dev`
- Always work in feature branches
- All changes must go through Pull Requests (PRs)
- Keep branches up-to-date with their parent branch

---

## Branch Structure

```
main (Production)
  │
  └── staging (Pre-production/QA)
        │
        └── dev (Development/Integration)
              │
              ├── feature/user-authentication
              ├── feature/dashboard-ui
              ├── feature/payment-integration
              └── bugfix/login-validation
```

### Main Branches

| Branch    | Purpose                     | Protected | Deploy To          |
| --------- | --------------------------- | --------- | ------------------ |
| `main`    | Production-ready code only  | ✅ Yes    | Production         |
| `staging` | Pre-production testing & QA | ✅ Yes    | Staging Server     |
| `dev`     | Integration of all features | ✅ Yes    | Development Server |

### Working Branches

These are temporary branches created by developers for specific tasks.

---

## Branch Naming Conventions

Use lowercase with hyphens and be descriptive:

### Format: `type/short-description`

**Types:**

| Prefix      | Purpose                  | Example                    |
| ----------- | ------------------------ | -------------------------- |
| `feature/`  | New feature development  | `feature/user-profile`     |
| `bugfix/`   | Bug fixes in development | `bugfix/login-timeout`     |
| `hotfix/`   | Urgent production fixes  | `hotfix/payment-crash`     |
| `refactor/` | Code refactoring         | `refactor/api-structure`   |
| `docs/`     | Documentation updates    | `docs/api-endpoints`       |
| `test/`     | Test additions/fixes     | `test/user-authentication` |

**Examples:**

```
✅ feature/user-authentication
✅ bugfix/navbar-responsive
✅ hotfix/security-patch
❌ Feature/User-Authentication (wrong case)
❌ user-auth (missing type)
❌ fix (not descriptive)
```

---

## Workflow Guide

### 1. Starting New Work

```bash
# Step 1: Switch to dev branch
git checkout dev

# Step 2: Get latest changes
git pull origin dev

# Step 3: Create your feature branch
git checkout -b feature/your-feature-name

# Step 4: Verify you're on the right branch
git branch
```

### 2. During Development

```bash
# Make changes to your code...

# Step 1: Check what files changed
git status

# Step 2: Stage your changes
git add .
# Or stage specific files
git add path/to/file.js

# Step 3: Commit with a clear message
git commit -m "Add user authentication form"

# Step 4: Push to remote
git push origin feature/your-feature-name
```

### 3. Before committing:

```bash
#Frontend
cd client
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix errors
npm run format        # Format all files

# Backend
cd server
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix errors
npm run format        # Format all files
```

**Commit Message Guidelines:**

```
✅ "Add user login validation"
✅ "Fix navbar collapse on mobile"
✅ "Update README with API documentation"
❌ "fix"
❌ "changes"
❌ "asdfgh"
```

### 4. Keeping Your Branch Updated

Update your feature branch with latest `dev` changes regularly (at least daily):

```bash
# Step 1: Switch to dev and update
git checkout dev
git pull origin dev

# Step 2: Switch back to your feature branch
git checkout feature/your-feature-name

# Step 3: Merge dev into your branch
git merge dev

# Step 4: If conflicts occur, resolve them, then:
git add .
git commit -m "Merge dev into feature branch"

# Step 5: Push updated branch
git push origin feature/your-feature-name
```

### 5. Completing Your Work

```bash
# Step 1: Ensure all changes are committed and pushed
git status
git push origin feature/your-feature-name

# Step 2: Go to GitHub/GitLab and create a Pull Request
# Target branch: dev
# Source branch: feature/your-feature-name

# Step 3: Wait for code review and approval

# Step 4: After merge, delete your feature branch
git checkout dev
git pull origin dev
git branch -d feature/your-feature-name
```

---

## Pull Request Process

### Creating a Pull Request

1. **Push your branch** to remote
2. **Navigate** to GitHub/GitLab repository
3. **Click** "New Pull Request" or "Create Merge Request"
4. **Select branches:**
   - Base: `dev` (usually)
   - Compare: `feature/your-feature-name`
5. **Fill in the PR template** (see below)
6. **Assign reviewers** and add relevant labels
7. **Submit** the PR

### PR Template

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation
- [ ] Other (specify)

## Related Issue

Closes #issue_number

## Changes Made

- Added user authentication form
- Implemented JWT token validation
- Updated API endpoints

## Testing Done

- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Tested on multiple browsers (if frontend)

## Screenshots (if applicable)

Add screenshots for UI changes

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] No console.logs or debugging code left
- [ ] Documentation updated (if needed)
```

### Code Review Guidelines

**For Reviewers:**

- Review within 24 hours
- Check code quality, logic, and best practices
- Test the changes locally if possible
- Be constructive and respectful in feedback
- Approve or request changes clearly

**For Authors:**

- Respond to feedback promptly
- Don't take criticism personally
- Make requested changes or discuss alternatives
- Re-request review after making changes

---

## Common Scenarios

### Scenario 1: Starting a New Feature

```bash
git checkout dev
git pull origin dev
git checkout -b feature/new-dashboard
# ... make changes ...
git add .
git commit -m "Add dashboard layout"
git push origin feature/new-dashboard
# Create PR: feature/new-dashboard → dev
```

### Scenario 2: Fixing a Bug in Development

```bash
git checkout dev
git pull origin dev
git checkout -b bugfix/fix-login-error
# ... fix the bug ...
git add .
git commit -m "Fix login validation error"
git push origin bugfix/fix-login-error
# Create PR: bugfix/fix-login-error → dev
```

### Scenario 3: Urgent Production Hotfix

```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix
# ... fix the issue ...
git add .
git commit -m "Patch security vulnerability"
git push origin hotfix/critical-security-fix
# Create PR: hotfix/critical-security-fix → main
# After merge, also merge main into staging and dev
```

### Scenario 4: Resolving Merge Conflicts

```bash
git checkout dev
git pull origin dev
git checkout feature/your-feature
git merge dev

# If conflicts occur:
# 1. Open conflicted files (marked in terminal)
# 2. Look for conflict markers: <<<<<<<, =======, >>>>>>>
# 3. Edit files to resolve conflicts
# 4. Remove conflict markers

git add .
git commit -m "Resolve merge conflicts with dev"
git push origin feature/your-feature
```

### Scenario 5: Multiple Developers on Same Feature

Create a shared feature branch:

```bash
# Lead developer creates main feature branch
git checkout dev
git pull origin dev
git checkout -b feature/dashboard
git push origin feature/dashboard

# Developer A creates sub-branch
git checkout feature/dashboard
git checkout -b feature/dashboard-header
# ... work and push ...
# Create PR: feature/dashboard-header → feature/dashboard

# Developer B creates another sub-branch
git checkout feature/dashboard
git checkout -b feature/dashboard-sidebar
# ... work and push ...
# Create PR: feature/dashboard-sidebar → feature/dashboard

# Finally, merge feature/dashboard → dev
```

---

## Best Practices

### Do's ✅

- **Commit frequently** with meaningful messages
- **Pull from dev daily** to stay updated
- **Keep PRs small** and focused (easier to review)
- **Write clear PR descriptions** explaining what and why
- **Test your changes** before creating a PR
- **Review your own code** before requesting review
- **Delete branches** after they're merged
- **Communicate** with team about complex changes

### Don'ts ❌

- **Never commit directly** to `main`, `staging`, or `dev`
- **Don't commit** sensitive data (API keys, passwords)
- **Avoid huge PRs** with 50+ file changes
- **Don't ignore conflicts** - resolve them properly
- **Never force push** (`git push -f`) to shared branches
- **Don't leave** console.logs or commented code
- **Avoid generic commit messages** like "fix" or "update"

### Code Quality Checklist

Before creating a PR, ensure:

- [ ] Code is properly formatted
- [ ] No console.logs or debug statements
- [ ] No commented-out code blocks
- [ ] Variables have meaningful names
- [ ] Complex logic has comments
- [ ] No hardcoded values (use config/env)
- [ ] Error handling is implemented
- [ ] Code follows project conventions

---

## Troubleshooting

### Problem: I'm on the wrong branch

```bash
# Save your current work
git stash

# Switch to correct branch
git checkout correct-branch-name

# Apply your saved work
git stash pop
```

### Problem: I committed to the wrong branch

```bash
# If you haven't pushed yet:
git reset HEAD~1  # Undo last commit, keep changes
git stash  # Save changes
git checkout correct-branch
git stash pop  # Apply changes
git add .
git commit -m "Your message"
```

### Problem: I need to undo my last commit

```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and discard changes (careful!)
git reset --hard HEAD~1
```

### Problem: My branch is far behind dev

```bash
git checkout dev
git pull origin dev
git checkout your-branch
git rebase dev  # Reapply your changes on top of dev

# If conflicts occur, resolve them, then:
git rebase --continue

# Force push your rebased branch (only for your own branch)
git push origin your-branch --force-with-lease
```

### Problem: I accidentally deleted important code

```bash
# Find the commit where code existed
git reflog

# Restore from that commit
git checkout <commit-hash> -- path/to/file
```

### Problem: Pull request has conflicts

```bash
# Update your branch with target branch
git checkout your-branch
git pull origin dev
# Resolve conflicts in your editor
git add .
git commit -m "Resolve conflicts"
git push origin your-branch
```

---

## Release Schedule

### Weekly Cycle

| Day               | Activity                                          |
| ----------------- | ------------------------------------------------- |
| Monday - Thursday | Feature development, merge to `dev` continuously  |
| Friday AM         | Merge `dev` → `staging`, deploy to staging server |
| Friday PM         | QA testing on staging                             |
| Weekend           | Fix critical staging issues if any                |

### Bi-weekly Release

- **Every 2 weeks**: Merge `staging` → `main` for production deployment
- **Before merge**: Ensure all tests pass and QA approves
- **After merge**: Tag the release (e.g., `v1.2.0`)

---

## Getting Help

### Questions?

1. **Check this README first**
2. **Ask in team chat** [Discord Server](https://discord.gg/QbDXBa4F)
3. **Consult with team lead**
4. **Review Git documentation**: https://git-scm.com/doc

### Useful Commands Reference

```bash
# Check current branch
git branch

# See all branches (including remote)
git branch -a

# Delete local branch
git branch -d branch-name

# See commit history
git log --oneline

# See changes in current branch
git diff

# Discard changes in a file
git checkout -- filename

# Update from remote without merging
git fetch origin

# See which branch you're tracking
git branch -vv
```

---

## Branch Protection Rules (For Admin)

Configure these settings in GitHub/GitLab:

### For `main`, `staging`, `dev`:

- ✅ Require pull request before merging
- ✅ Require at least 1 approval
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Prevent force pushes
- ✅ Prevent deletion

---

## Contact

**Project Lead**: [Syed Abdul Ali Shah](http://linkedin.com/in/syed-abdul-ali-shah/)\
**Team Chat**: [Discord Server](https://discord.gg/QbDXBa4F)\
**Repository**: [Github URL](https://github.com/shah541-g/Philbox)

---

**Last Updated**: 25th November, 2025
**Version**: 0.1
