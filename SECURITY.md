# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in CozyReads, please **do not** create a public GitHub issue. Instead, please report it to the maintainers privately.

### How to Report

1. **Email**: Send a detailed description of the vulnerability to the project maintainers
2. **GitHub Security Advisory**: Use the [Security Advisory](https://github.com/aeldarian1/CozyReads/security/advisories) feature

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

## Security Best Practices

### For Users

- Keep your `DATABASE_URL` and API keys secure
- Use strong passwords for your Clerk authentication
- Enable HTTPS for all connections
- Regularly update dependencies

### For Contributors

- Do not commit secrets or credentials
- Use environment variables for sensitive data
- Follow OWASP guidelines for secure coding
- Report security issues privately before public disclosure

## Dependencies

We take dependency security seriously:

- Regular security audits with `npm audit`
- Automated dependency updates via Dependabot
- Prompt patching of known vulnerabilities

## Responsible Disclosure

We follow responsible disclosure practices. Once a vulnerability is reported:

1. We will confirm receipt within 48 hours
2. We will work on a fix and provide an estimated timeline
3. We will release a security patch
4. We will credit the reporter (unless they prefer anonymity)

## Security Releases

Security updates are released as patch versions and announced in release notes.
