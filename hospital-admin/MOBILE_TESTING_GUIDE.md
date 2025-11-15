# Mobile Testing Guide - Hospital Admin

## Quick Test Checklist

Use this checklist when testing the Hospital Admin app on mobile devices:

### 📱 Navigation & Layout
- [ ] Hamburger menu opens and closes smoothly
- [ ] All navigation links are accessible
- [ ] Staff dropdown menu works properly
- [ ] Sidebar collapses on mobile
- [ ] No horizontal scroll on any page
- [ ] Footer/header display correctly

### 📝 Forms & Inputs
- [ ] All input fields are large enough to tap (44x44px minimum)
- [ ] Text doesn't zoom when focusing inputs (16px minimum font)
- [ ] Keyboard appears correctly for different input types
- [ ] Form validation messages are visible
- [ ] Submit buttons are easily accessible
- [ ] Dropdowns work without issues

### 📊 Tables & Data Display
- [ ] Tables scroll horizontally when needed
- [ ] Table headers are visible while scrolling
- [ ] Data is readable without zooming
- [ ] Action buttons in tables are tappable
- [ ] Pagination works correctly

### 🪟 Modals & Dialogs
- [ ] Modals display properly on small screens
- [ ] Modal content is scrollable
- [ ] Close buttons are easily accessible
- [ ] Form modals don't exceed screen height
- [ ] Background scrolling is prevented when modal is open

### 🎨 Visual Elements
- [ ] Images load and scale properly
- [ ] Icons are visible and correctly sized
- [ ] Colors have sufficient contrast
- [ ] Text is readable (minimum 14px for body)
- [ ] Buttons have clear visual feedback on tap

### ⚡ Performance
- [ ] Pages load quickly (< 3 seconds)
- [ ] Smooth scrolling
- [ ] No lag when interacting with UI elements
- [ ] Images are optimized
- [ ] No memory leaks after extended use

## Device-Specific Testing

### iPhone (iOS Safari)
**Priority: HIGH**

Test Devices:
- iPhone 12/13 (390x844)
- iPhone SE (375x667)
- iPhone 14 Pro (393x852)

Key Tests:
- [ ] Input zoom prevention (16px font size)
- [ ] Safe area handling (notch)
- [ ] Pull-to-refresh doesn't interfere
- [ ] Swipe gestures work correctly
- [ ] Dark mode support

### Android Phones
**Priority: HIGH**

Test Devices:
- Samsung Galaxy S21 (360x800)
- Google Pixel 5 (393x851)
- OnePlus 9 (412x915)

Key Tests:
- [ ] Chrome browser compatibility
- [ ] Samsung Internet browser compatibility
- [ ] Navigation bar handling
- [ ] Back button functionality
- [ ] Touch gestures

### iPad/Tablets
**Priority: MEDIUM**

Test Devices:
- iPad (768x1024)
- iPad Pro (1024x1366)
- Android Tablet (800x1280)

Key Tests:
- [ ] Layout adapts to tablet size
- [ ] Two-column layouts display correctly
- [ ] Sidebar behavior appropriate for size
- [ ] Touch target sizes comfortable
- [ ] Landscape orientation works

## Browser Testing Matrix

| Browser | Mobile | Tablet | Desktop | Priority |
|---------|--------|--------|---------|----------|
| Safari (iOS) | ✅ | ✅ | ✅ | **HIGH** |
| Chrome (Android) | ✅ | ✅ | ✅ | **HIGH** |
| Chrome (iOS) | ✅ | ✅ | ✅ | MEDIUM |
| Samsung Internet | ✅ | ✅ | N/A | MEDIUM |
| Firefox | ✅ | ✅ | ✅ | LOW |
| Edge | ✅ | ✅ | ✅ | LOW |

## Common Mobile Issues to Watch For

### 1. Input Zoom on iOS
**Problem**: iOS Safari zooms in when focusing on input fields < 16px  
**Solution**: All inputs now have `text-base` (16px) class  
**Test**: Focus on any input field - page shouldn't zoom

### 2. Horizontal Scroll
**Problem**: Content wider than viewport causes horizontal scroll  
**Solution**: Proper container widths and responsive layouts  
**Test**: Scroll vertically on each page - no horizontal scroll should appear

### 3. Table Overflow
**Problem**: Wide tables cause layout issues  
**Solution**: Tables wrapped in `overflow-x-auto` containers  
**Test**: View data tables on small screens - should scroll horizontally

### 4. Modal Height
**Problem**: Modals taller than viewport can't be fully accessed  
**Solution**: Modals have `max-h-[90vh] overflow-y-auto`  
**Test**: Open forms with many fields - should scroll within modal

### 5. Touch Targets Too Small
**Problem**: Buttons/links too small to tap accurately  
**Solution**: Minimum 44x44px touch targets, adequate spacing  
**Test**: Tap all interactive elements - should be comfortable

### 6. Navbar Overflow
**Problem**: Too many nav items cause horizontal scroll  
**Solution**: Hamburger menu for mobile, collapsible sections  
**Test**: Open navigation - all items accessible without scrolling

## Testing Tools

### Browser DevTools
1. **Chrome DevTools**
   - Open DevTools (F12)
   - Click "Toggle device toolbar" (Ctrl+Shift+M)
   - Select device from dropdown or custom dimensions
   - Test different network speeds (Throttling)

2. **Safari Web Inspector** (for iOS testing)
   - Connect iPhone via USB
   - Enable Web Inspector on iPhone (Settings > Safari > Advanced)
   - Open Safari on Mac > Develop > [Your iPhone]

### Online Testing Services
- **BrowserStack**: https://www.browserstack.com
- **LambdaTest**: https://www.lambdatest.com
- **Sauce Labs**: https://saucelabs.com

### Lighthouse Audits
Run Lighthouse audit in Chrome DevTools:
```bash
# Or use CLI
npm install -g lighthouse
lighthouse http://localhost:5174 --view
```

Target Scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

## Responsive Breakpoint Testing

Test these specific widths to ensure proper breakpoint behavior:

| Width | Device Type | Tailwind Breakpoint |
|-------|-------------|---------------------|
| 320px | iPhone SE (portrait) | default |
| 375px | iPhone 12/13 (portrait) | default |
| 390px | iPhone 14 (portrait) | default |
| 640px | Large mobile / Small tablet | `sm:` |
| 768px | iPad (portrait) | `md:` |
| 1024px | iPad (landscape) / Desktop | `lg:` |
| 1280px | Desktop | `xl:` |
| 1536px | Large desktop | `2xl:` |

## Automated Testing

### Visual Regression Testing
```typescript
// Example using Playwright
import { test, expect } from '@playwright/test';

test('mobile dashboard looks correct', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/hospital/dashboard');
  await expect(page).toHaveScreenshot('mobile-dashboard.png');
});
```

### Accessibility Testing
```bash
# Install axe-core
npm install -D @axe-core/playwright

# Run accessibility tests
```

## Reporting Issues

When reporting a mobile issue, include:

1. **Device Info**
   - Device model
   - OS version
   - Browser & version
   - Screen resolution

2. **Steps to Reproduce**
   - Detailed steps
   - Expected behavior
   - Actual behavior

3. **Screenshots/Video**
   - Screenshot of the issue
   - Screen recording if possible

4. **Additional Context**
   - Network conditions
   - Any console errors
   - Other relevant details

## Best Practices Implemented

✅ **Viewport Meta Tag**: Properly configured for mobile  
✅ **Responsive Typography**: Scales based on screen size  
✅ **Touch Targets**: Minimum 44x44px for interactive elements  
✅ **Form Inputs**: 16px minimum to prevent iOS zoom  
✅ **Flexible Layouts**: CSS Grid and Flexbox  
✅ **Mobile Navigation**: Hamburger menu with overlay  
✅ **Scrollable Tables**: Horizontal scroll for wide tables  
✅ **Optimized Images**: Responsive image sizing  
✅ **Performance**: Code splitting and lazy loading  
✅ **Accessibility**: ARIA labels and keyboard navigation  

## Maintenance Schedule

- **Weekly**: Spot check on real devices
- **Monthly**: Full test suite on all devices
- **Quarterly**: Lighthouse audit and performance review
- **Annually**: Update for new device sizes and OS versions

---

**Last Updated**: November 2025  
**Next Review**: December 2025

