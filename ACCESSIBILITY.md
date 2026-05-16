# ♿ Accessibility Guide

CozyReads is committed to being accessible to all users, including those with disabilities.

## Accessibility Standards

CozyReads meets **WCAG 2.1 Level AA** standards.

**Tested against:**
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard navigation
- Color contrast
- Zoom capabilities
- Focus management

## Features for Accessibility

### 1. **Screen Reader Support**

- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic updates
- Form labels and error messages
- Skip navigation link

**Test:**
```bash
# Using NVDA (Windows)
# Press Insert+Space to open NVDA menu
# Then navigate with arrow keys

# Using VoiceOver (macOS)
# Cmd+F5 to toggle VoiceOver
# Cmd+U opens the Web Rotor
```

### 2. **Keyboard Navigation**

- Full keyboard accessibility
- Logical tab order
- Focus indicators visible
- Keyboard shortcuts documented

**Test:**
- Use `Tab` to navigate forward
- Use `Shift+Tab` to navigate backward
- Use `Enter` to activate buttons
- Use `Space` to toggle checkboxes
- Use `?` to see all keyboard shortcuts

### 3. **Visual Design**

- Color contrast ratio > 4.5:1 (WCAG AA)
- No color-only information
- Text resizable up to 200%
- No auto-playing audio/video

**Test:**
- Use browser's zoom feature (Ctrl/Cmd + +)
- Check colors with tools like WebAIM

### 4. **Motion & Animation**

- Respects `prefers-reduced-motion`
- Optional animations
- No flashing or flickering
- Smooth transitions

**Test:**
```bash
# macOS: System Preferences > Accessibility > Display > 
# Reduce motion

# Windows: Settings > Ease of Access > Display > 
# Show animations
```

### 5. **Mobile Accessibility**

- Touch targets ≥ 44x44 pixels
- Responsive design works with zoom
- Bottom sheet navigation safe area
- Voice control compatible

## Accessibility Features by Component

### Forms
- Label for every input
- Error messages announced
- Helper text visible
- Form validation accessible

### Navigation
- Main navigation landmark
- Skip to main content link
- Breadcrumb navigation
- Page headings clear hierarchy

### Modals & Dialogs
- Focus trapped inside
- Backdrop prevents interactions
- Close button always available
- ESC key closes

### Cards & Lists
- Semantic heading hierarchy
- Proper list structure
- Card content readable
- Actions accessible

## Testing for Accessibility

### Automated Testing

```bash
npm run test:a11y
```

Uses axe-core for automated checking.

### Manual Testing

1. **Screen Reader (NVDA/JAWS)**
   - Does content read logically?
   - Are images described?
   - Are buttons announced?

2. **Keyboard Only**
   - Can you navigate everywhere?
   - Is focus always visible?
   - Can you access all functions?

3. **Browser Zoom**
   - Zoom to 200%
   - Is layout responsive?
   - Is text readable?

4. **Color Contrast**
   - Use WebAIM color contrast checker
   - Is ratio ≥ 4.5:1 for text?

5. **Visual Inspection**
   - Are animations distracting?
   - Is there enough spacing?
   - Is UI intuitive?

### Tools

- **axe DevTools** - Automated accessibility testing
- **WAVE** - Browser extension for checking
- **Lighthouse** - Chrome DevTools audit
- **NVDA** - Free screen reader for Windows
- **JAWS** - Professional screen reader
- **VoiceOver** - Built-in macOS/iOS

## Implementation Guidelines

### HTML

```html
<!-- ✓ Good: Semantic HTML -->
<button aria-label="Close menu">
  <span aria-hidden="true">×</span>
</button>

<!-- ✗ Bad: Non-semantic -->
<div onclick="closeMenu()">×</div>
```

### ARIA

```html
<!-- ✓ Good: Proper ARIA -->
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a href="/">Home</a>
    </li>
  </ul>
</nav>

<!-- ✗ Bad: Unnecessary ARIA -->
<nav role="navigation">
```

### Images

```html
<!-- ✓ Good: Descriptive alt text -->
<img alt="Screenshot showing book rating interface" 
     src="rating.png" />

<!-- ✗ Bad: Missing alt or non-descriptive -->
<img alt="image" src="rating.png" />
```

### Form Inputs

```html
<!-- ✓ Good: Associated label -->
<label for="book-title">Book Title</label>
<input id="book-title" type="text" />

<!-- ✗ Bad: Floating label -->
<input type="text" placeholder="Book Title" />
```

### Focus Management

```typescript
// ✓ Good: Manage focus explicitly
const focusElement = useRef<HTMLDivElement>(null);

useEffect(() => {
  focusElement.current?.focus();
}, []);

return <div ref={focusElement} tabIndex={-1}>{content}</div>;
```

## Resources

### Learning
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [a11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Libraries
- [react-aria](https://react-spectrum.adobe.com/react-aria/)
- [Headless UI](https://headlessui.dev/)
- [Radix UI](https://www.radix-ui.com/)

## Reporting Accessibility Issues

If you find an accessibility issue:

1. **Check [GitHub Issues](https://github.com/aeldarian1/CozyReads/issues)** for existing reports
2. **Describe the issue clearly:**
   - What assistive technology were you using?
   - What did you try to do?
   - What happened instead?
   - How can we reproduce it?
3. **Create issue with [template](./.github/ISSUE_TEMPLATE/a11y_issue.md)**

## Continuous Improvement

Accessibility is ongoing. We:
- Test with real assistive technologies
- Monitor for accessibility issues
- Update standards as they evolve
- Welcome feedback from users
- Train development team

Our goal: Make CozyReads usable for everyone.

---

**Questions?** [Contact us](https://github.com/aeldarian1/CozyReads/discussions)
