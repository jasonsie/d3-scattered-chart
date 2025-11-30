# TODO

## Performance Optimization

1. **Substitute SVG with Canvas for efficiency consideration**
   - Replace current SVG-based rendering with HTML5 Canvas
   - Improves performance for ~4800 data points
   - Consider using D3 with Canvas or hybrid approach
   - Ensure polygon drawing and selection still work with Canvas coordinate system

## UI Enhancement

2. **Rebuild the UI interaction with Motion library**
   - Integrate Motion library: https://github.com/motiondivision/motion
   - Replace current React/D3 interactions with Motion-based animations
   - Enhance user experience with smoother transitions and interactions
   - Update polygon drawing, selection, and sidebar animations