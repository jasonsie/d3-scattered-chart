# CSS Module Conventions Contract

**Date**: 2025-12-02  
**Version**: 1.0.0

## Purpose

Defines CSS Module naming conventions, file organization, and migration patterns for converting inline styles to CSS classes.

---

## Naming Conventions

### File Names

**Pattern**: `ComponentName.module.css`

**Examples**:
```
PopupEditor.tsx → PopupEditor.module.css
Chart.tsx → Chart.module.css
Polygon.tsx → Polygon.module.css
Sidebar.tsx → Sidebar.module.css
```

**Location**: Centralized in `src/styles/` directory

```
src/
├── components/
│   ├── PopupEditor.tsx
│   └── Chart.tsx
└── styles/
    ├── PopupEditor.module.css
    └── Chart.module.css
```

### Class Names

**Convention**: Camel case matching component structure

**Pattern**: `.componentElement` or `.componentElementModifier`

**Examples**:
```css
/* PopupEditor.module.css */
.modal { }
.backdrop { }
.form { }
.inputGroup { }
.labelText { }
.colorInput { }
.lineSelect { }
.buttonGroup { }
.cancelButton { }
.saveButton { }

/* Chart.module.css */
.container { }
.svg { }
.axis { }
.axisLabel { }
.dataPoint { }
.dataPointHovered { }

/* Sidebar.module.css */
.sidebar { }
.sidebarExpanded { }
.header { }
.toggleButton { }
.polygonList { }
.polygonItem { }
.polygonItemSelected { }
.statistics { }
```

**Avoid**: Kebab-case (`.popup-editor`), snake_case (`.popup_editor`), BEM (`.popup__editor--active`)

**Rationale**: Camel case matches JavaScript/TypeScript conventions and works seamlessly with CSS Modules import syntax.

---

## Import and Usage Pattern

### TypeScript Import

```typescript
import styles from '@/styles/ComponentName.module.css';

// styles object type
type StylesModule = {
  [className: string]: string;
};
```

### JSX Usage

```tsx
// Simple class
<div className={styles.modal}>

// Conditional class
<div className={styles.polygonItem + (selected ? ' ' + styles.polygonItemSelected : '')}>

// Multiple classes
<div className={`${styles.modal} ${styles.centered}`}>

// With clsx library (optional)
import clsx from 'clsx';
<div className={clsx(styles.polygonItem, { [styles.polygonItemSelected]: selected })}>
```

### Dynamic Styles (CSS Custom Properties)

For runtime dynamic values (e.g., colors from data):

```tsx
<div 
  className={styles.polygon}
  style={{ 
    '--polygon-color': color,
    '--dot-color': dotColor 
  } as React.CSSProperties}
>
```

```css
/* Polygon.module.css */
.polygon {
  fill: var(--polygon-color, #808080);
  stroke: var(--dot-color, #ffffff);
}
```

**When to use**: Only for values that truly change at runtime (not for static styles)

---

## Migration Patterns

### Pattern 1: Simple Inline Object → CSS Class

**Before**:
```tsx
<div style={{
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  zIndex: 1000,
  minWidth: '300px'
}}>
```

**After**:
```tsx
import styles from '@/styles/PopupEditor.module.css';

<div className={styles.modal}>
```

```css
/* PopupEditor.module.css */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 300px;
}
```

### Pattern 2: Conditional Styles → Multiple Classes

**Before**:
```tsx
<button 
  onClick={onClose}
  style={{
    padding: '5px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: 'white'
  }}
>
  Cancel
</button>

<button 
  onClick={onSave}
  style={{
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    background: '#007bff',
    color: 'white'
  }}
>
  Save
</button>
```

**After**:
```tsx
<button className={styles.cancelButton} onClick={onClose}>
  Cancel
</button>

<button className={styles.saveButton} onClick={onSave}>
  Save
</button>
```

```css
/* PopupEditor.module.css */
.cancelButton,
.saveButton {
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.cancelButton {
  border: 1px solid #ccc;
  background: white;
  color: inherit;
}

.saveButton {
  border: none;
  background: #007bff;
  color: white;
}

.saveButton:hover {
  background: #0056b3;
}
```

### Pattern 3: Layout Containers → Semantic Classes

**Before**:
```tsx
<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
  <button>Cancel</button>
  <button>Save</button>
</div>
```

**After**:
```tsx
<div className={styles.buttonGroup}>
  <button className={styles.cancelButton}>Cancel</button>
  <button className={styles.saveButton}>Save</button>
</div>
```

```css
/* PopupEditor.module.css */
.buttonGroup {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
```

### Pattern 4: State-based Styles → Modifier Classes

**Before**:
```tsx
<div style={{
  padding: '10px',
  backgroundColor: selected ? '#e3f2fd' : 'white',
  borderLeft: selected ? '3px solid #2196f3' : 'none'
}}>
```

**After**:
```tsx
<div className={selected ? styles.polygonItemSelected : styles.polygonItem}>
```

```css
/* Sidebar.module.css */
.polygonItem {
  padding: 10px;
  background-color: white;
  border-left: none;
}

.polygonItemSelected {
  padding: 10px;
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
}

/* Or use composition */
.polygonItemSelected {
  composes: polygonItem;
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
}
```

---

## CSS Module Features

### Composition

Reuse styles across classes:

```css
.button {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.primaryButton {
  composes: button;
  background: #007bff;
  color: white;
}

.secondaryButton {
  composes: button;
  background: white;
  border: 1px solid #ccc;
}
```

### Global Styles (Use Sparingly)

For truly global overrides:

```css
:global(.react-tooltip) {
  z-index: 9999 !important;
}

/* Scoped class using global selector */
.modal :global(.custom-input) {
  /* Styles for .custom-input only within .modal */
}
```

**When to use**: Third-party library overrides only

---

## Component-Specific Conventions

### PopupEditor.module.css

```css
.modal {
  /* Fixed positioning, centered */
}

.backdrop {
  /* Full-screen semi-transparent overlay */
}

.form {
  /* Form container */
}

.inputGroup {
  /* Label + input wrapper */
  margin-bottom: 15px;
}

.labelText {
  /* Form label styling */
}

.colorInput,
.textInput,
.lineSelect {
  /* Form input styling */
}

.buttonGroup {
  /* Cancel/Save button container */
}

.cancelButton,
.saveButton {
  /* Button styling (shared + specific) */
}
```

### Chart.module.css

```css
.container {
  /* Chart wrapper */
}

.svg {
  /* SVG element base styles */
}

.axis {
  /* D3 axis styling */
}

.axisLabel {
  /* Axis label text */
}

.dataPoint {
  /* Scatter plot point (if not using D3 for styling) */
}
```

### Polygon.module.css

```css
.polygon {
  /* Base polygon path */
  cursor: pointer;
  transition: opacity 0.2s;
}

.polygonHovered {
  /* Hovered state */
}

.polygonSelected {
  /* Selected state */
}
```

### Sidebar.module.css

```css
.sidebar {
  /* Base sidebar (collapsed state) */
  width: 50px;
  transition: width 0.3s;
}

.sidebarExpanded {
  /* Expanded state */
  width: 300px;
}

.header {
  /* Title and toggle button container */
}

.toggleButton {
  /* Expand/collapse button */
}

.polygonList {
  /* Scrollable list container */
}

.polygonItem {
  /* Individual polygon row */
}

.polygonItemSelected {
  /* Selected polygon row highlight */
}

.statistics {
  /* Footer with statistics */
}
```

---

## Migration Checklist

Per component:

- [ ] Create `ComponentName.module.css` file
- [ ] Identify all inline `style={{}}` props
- [ ] Group related styles into semantic class names
- [ ] Convert inline objects to CSS classes
- [ ] Import styles module at top of component
- [ ] Replace `style` props with `className={styles.X}`
- [ ] Handle dynamic values with CSS custom properties
- [ ] Test visual appearance (should be identical)
- [ ] Remove all inline style props
- [ ] Run grep search: `grep -r "style={{" src/components/ComponentName.tsx` should return 0 results

---

## Validation

### Build-Time

```bash
npm run build
# Next.js CSS pipeline validates syntax and generates scoped classes
```

### Type Safety

```typescript
// TypeScript will error if class name doesn't exist
<div className={styles.nonExistentClass}> // Error: Property 'nonExistentClass' does not exist
```

### Runtime

```bash
npm run dev
# Visual inspection: styles should be identical to before migration
# Browser DevTools: Verify scoped class names (e.g., PopupEditor_modal__a1b2c)
```

### Zero Inline Styles Check

```bash
# After all components refactored, verify no inline styles remain
grep -r 'style={{' src/components/
# Should return 0 results (or only dynamic CSS custom property usage)
```

---

## Benefits

**Maintainability**:
- Centralized styles easier to find and modify
- Semantic class names self-document intent

**Performance**:
- CSS classes more performant than inline style objects
- Reduced JavaScript bundle size (styles in CSS, not JS)

**Reusability**:
- Shared styles via composition
- Theme changes in one place

**Scoping**:
- Automatic class name hashing prevents conflicts
- No need for manual BEM or naming conventions

**Developer Experience**:
- Type-safe class names (TypeScript autocomplete)
- Hot reload for CSS changes without losing component state

---

## Next.js Integration

Next.js automatically handles CSS Modules:

1. Parses `.module.css` files
2. Generates scoped class names (hash-based)
3. Bundles CSS with code splitting
4. Provides type definitions for imports

**No additional configuration required** - already enabled in this project.

---

## Edge Cases

### Third-Party Components

If third-party component requires inline styles:

```tsx
// OK: Third-party library prop
<ThirdPartyComponent style={{ width: '100%' }} />

// Still prefer CSS modules when possible
<ThirdPartyComponent className={styles.thirdPartyWrapper} />
```

### D3 Styling

D3-generated SVG elements:

```typescript
// D3 selections can use classes
d3.selectAll('.data-point')
  .attr('class', 'data-point') // Can still use data-bound classes
  .style('fill', d => colorScale(d.cluster)); // Dynamic data-driven styles OK
```

**Rule**: D3 can set `style` attributes dynamically; React components should use `className`

### Accessibility

Maintain ARIA attributes and semantic HTML:

```tsx
<button 
  className={styles.closeButton}
  aria-label="Close editor"
  type="button"
>
  ×
</button>
```

---

## References

- [Next.js CSS Modules Documentation](https://nextjs.org/docs/app/building-your-application/styling/css-modules)
- [TypeScript CSS Modules](https://github.com/microsoft/TypeScript/issues/38638)
- [CSS Modules Specification](https://github.com/css-modules/css-modules)
