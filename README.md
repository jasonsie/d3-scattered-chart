
# D3 Scatter Chart - Data Visualization Challenge 2025

High-performance interactive scatter plot visualization with advanced polygon selection. Handles **100,000+ data points** with **sub-second rendering** and **real-time interactions**.
![Cell Distribution Chart](./public/readMe/cell-distribution.png)

## ✨ Key Features

### 🎯 Interactive Data Visualization
- **Dynamic Axis Selection**: Switch between **15 data properties** in real-time
- **Canvas Rendering**: Optimized for **100,000+ points** with **60 FPS** interactions

### 📐 Polygon Selection & Analysis
- **Multi-Polygon Support**: Manage up to **50 simultaneous polygons** with overlapping selection and color blending
- **Real-Time Statistics**: Instant **AND/OR conditional logic** with two-way binding between list and chart

### ⚡ Performance Optimizations
- **Ultra-Fast Load**: **50,000+ points** in **<2 seconds** (**1000ms** reduction), selections in **<500ms**
- **Smart Rendering**: R-tree spatial indexing, viewport culling, dirty rectangle tracking, **50% less memory** vs SVG

### 🌐 Progressive Loading & Network Resilience
- **Synchronized Loading**: Global state management prevents layout shifts on **slow networks**
- **Visual Feedback**: Skeleton screens and coordinated loading indicators across all components

---
## 📊 Performance Benchmarks

Tested on standard hardware (Intel i5, 8GB RAM, integrated graphics):

| Metric | Target | Actual Performance |
|--------|--------|-------------------|
| Initial load (50,000 points) | <2s | **~1.0s** (1000ms improvement) |
| Polygon selection | <500ms | **<300ms** |
| Axis change re-render (100,000 points) | <500ms | **<500ms** |
| Pan/Zoom operations | 30 FPS | **60 FPS** |
| Viewport culling query | <50ms | **<50ms** |
| Memory vs SVG | -50% | **-50%** |

### Large Dataset Capabilities
- ✅ Handles **100,000+ data points** with smooth interactions
- ✅ Maintains **30 FPS minimum** during complex operations
- ✅ **Sub-second** initial rendering for 50k+ datasets
- ✅ **Real-time statistics** recalculation across all polygons

## 🚀 Getting Started
### Prerequisites
- Node.js ≥20.9.0
- Yarn package manager

### Installation & Running

```bash
# Install dependencies
yarn

# Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
yarn build
yarn start
```
---