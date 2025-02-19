# Theming System Documentation

## Overview
The theming system provides a centralized way to manage styles across the application. It supports:
- Light and dark modes
- Consistent color palette
- Typography settings
- Spacing system
- Breakpoints for responsive design
- Shadows and border radius
- Transition animations

## Usage

### Accessing Theme Values
Use the `useTheme` hook to access theme values in components:

```tsx
import { useTheme } from './theme/ThemeProvider';

function MyComponent() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div style={{ color: theme.colors.primary }}>
      Current mode: {isDarkMode ? 'Dark' : 'Light'}
    </div>
  );
}
```

### Theme Utilities
Use theme utilities for type-safe access to theme properties:

```tsx
import styled from 'styled-components';
import { getColor, getSpacing } from './theme/themeUtils';

const StyledDiv = styled.div`
  color: ${getColor('primary')};
  padding: ${getSpacing('medium')};
`;
```

### Switching Themes
Toggle between light and dark modes:

```tsx
function ThemeSwitcher() {
  const { toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Toggle Theme
    </button>
  );
}
```

## Theme Structure
The theme object contains the following properties:

### Colors
- primary
- secondary
- success
- danger
- warning
- info
- light
- dark
- background
- text

### Spacing
- small
- medium
- large

### Breakpoints
- mobile
- tablet
- desktop

### Typography
- fontFamily
- fontSize
  - small
  - medium
  - large
- fontWeight
  - normal
  - bold

### Shadows
- small
- medium
- large

### Border Radius
- small
- medium
- large

### Transitions
- fast
- medium
- slow
