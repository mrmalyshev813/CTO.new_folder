# Pre-Commit and Pre-Push Checks

This project uses Git hooks to ensure code quality before commits and pushes. The hooks are managed by [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged).

## What Gets Checked

### Pre-Commit Hook

The pre-commit hook runs automatically before each commit and performs the following checks:

1. **JavaScript Syntax Validation**: Validates syntax of all JavaScript files in `netlify/functions/`
2. **HTML Validation**: Ensures `index.html` has valid HTML structure
3. **ESLint**: Runs ESLint to check code style and potential issues
4. **Lint-Staged**: Formats and validates only the files that are staged for commit

### Pre-Push Hook

The pre-push hook runs automatically before pushing to remote and performs:

1. **JavaScript Syntax Validation**: Same as pre-commit
2. **HTML Validation**: Same as pre-commit
3. **ESLint**: Same as pre-commit

## Manual Testing

You can manually run these checks at any time:

```bash
# Run all pre-commit checks
npm run precommit

# Run individual checks
npm run validate:js     # Validate JavaScript syntax
npm run validate:html   # Validate HTML structure
npm run lint:check      # Run ESLint (without fixing)
npm run lint            # Run ESLint with auto-fix
```

## How It Works

### Husky

Husky installs Git hooks in the `.husky/` directory. When you run `npm install`, Husky automatically sets up the hooks.

### Lint-Staged

Lint-staged runs linters against staged files only, making commits faster. Configuration is in `package.json`:

```json
"lint-staged": {
  "netlify/functions/**/*.js": [
    "eslint --fix",
    "node -c"
  ],
  "*.html": [
    "node -e \"const fs = require('fs'); const html = fs.readFileSync(process.argv[1], 'utf8'); if (!html.includes('<!DOCTYPE html>')) { throw new Error('Invalid HTML'); }\""
  ]
}
```

## Bypassing Hooks (Not Recommended)

In rare cases where you need to bypass the hooks:

```bash
# Bypass pre-commit hook
git commit --no-verify

# Bypass pre-push hook
git push --no-verify
```

**Warning**: Only use `--no-verify` when absolutely necessary, as it skips important code quality checks.

## Troubleshooting

### Hook Not Running

If hooks are not running, try:

```bash
# Reinstall Husky hooks
npx husky install
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### ESLint Errors

If you get ESLint errors:

1. Try running with auto-fix: `npm run lint`
2. Check the error message and fix manually
3. Update `.eslintrc.json` if the rule needs adjustment

### Node Version Issues

Ensure you're using Node.js 14.x or higher:

```bash
node --version
```

## Configuration Files

- `.husky/pre-commit` - Pre-commit hook script
- `.husky/pre-push` - Pre-push hook script
- `.eslintrc.json` - ESLint configuration
- `package.json` - Scripts and lint-staged configuration
