# Contributing to CozyReads

Thank you for your interest in contributing to CozyReads! We're excited to have you on board.

## 📋 Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/CozyReads.git
   cd CozyReads
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/aeldarian1/CozyReads.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Fill in your database URL and API keys
   ```

6. **Run database migrations**:
   ```bash
   npx prisma migrate dev
   ```

7. **Start the development server**:
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Branch Naming

Use descriptive branch names following this pattern:
- `feature/description` - For new features
- `fix/description` - For bug fixes
- `docs/description` - For documentation updates
- `refactor/description` - For code refactoring

Example: `feature/add-reading-statistics` or `fix/modal-animation-bug`

### Commit Messages

Write clear and descriptive commit messages:

```
feat: add reading statistics feature

- Implemented new statistics dashboard
- Added data visualization with Recharts
- Updated database schema with new metrics
```

Use conventional commit types:
- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Dependency updates, build changes

### Code Style

- **TypeScript**: No `any` types. Use proper type definitions.
- **React**: Use functional components with hooks.
- **Naming**: Use camelCase for variables/functions, PascalCase for components.
- **Formatting**: Run `npm run lint` before committing.

### Testing

- Write tests for new features
- Ensure all tests pass: `npm run test`
- Maintain or improve code coverage

## 🔄 Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**:
   ```bash
   git push origin your-branch-name
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear title describing your changes
   - Detailed description of what was changed and why
   - Reference any related issues (e.g., `Fixes #123`)
   - Screenshots for UI changes

4. **Code Review**:
   - Address feedback from reviewers
   - Keep commits clean and logical
   - Re-request review after making changes

5. **Merge**: Once approved and all checks pass, your PR will be merged!

## 🐛 Reporting Bugs

Found a bug? Please report it using our [Issue Tracker](https://github.com/aeldarian1/CozyReads/issues):

1. **Check if the bug is already reported**
2. **Use the bug report template**
3. **Include**:
   - A clear description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, Node version, etc.)

## 💡 Feature Requests

Have an idea for a new feature? We'd love to hear it!

1. **Check existing discussions** on GitHub
2. **Create a new discussion** or issue with:
   - Clear title and description
   - Use case and motivation
   - Possible implementation approach (optional)

## ✅ Checklist Before Submitting

- [ ] Code follows the style guidelines
- [ ] All tests pass locally
- [ ] No new linting errors
- [ ] Documentation is updated
- [ ] Changes are properly typed (TypeScript)
- [ ] Commits have clear messages
- [ ] No debug code or console.log statements

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎯 Project Structure

```
CozyReads/
├── app/              # Next.js app router
├── components/       # React components
├── contexts/         # React contexts
├── lib/              # Utility functions & hooks
├── prisma/           # Database schema & migrations
├── types/            # TypeScript type definitions
└── public/           # Static assets
```

## 📞 Contact & Questions

- **Discussions**: Use GitHub Discussions for general questions
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Email**: Feel free to reach out to the maintainers

## 🙏 Thank You

Your contributions make CozyReads better for everyone! Thank you for being part of our community.

Happy coding! 📚✨
