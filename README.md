# POW! Comic Book Layout Creator 💥

100% VIBE CODED

A sleek, local web application designed for creating, customizing, and printing comic book layout grids. Built with **React**, **Vite**, and **Vanilla CSS**, featuring a retro pop-art aesthetic with retro halftone patterns, glassmorphism UI, freeform coordinate transformation, and print sheet optimization.

---

## 🚀 Runtime Instructions

To run the application locally on your machine, follow these steps:

### 1. Installation
Clone or navigate to the project directory and install the necessary package dependencies:
```bash
npm install
```

### 2. Run the Development Server
Launch the local development server (with Hot Module Replacement):
```bash
npm run dev
```
Once started, open [http://localhost:5173](http://localhost:5173) in your browser to start building.

### 3. Build for Production
To bundle the application into highly optimized static assets (HTML/CSS/JS) for hosting:
```bash
npm run build
```

### 4. Preview the Production Build
To test the built production bundle locally:
```bash
npm run preview
```

---

## 🎨 Feature Overview

- **Custom Quadrilateral Panels**: Drag the 4 corner handles to mold panels into parallelograms, trapezoids, or custom skewed shapes.
- **Side-Edge Resizing**: Drag the yellow midpoint edge handles on the top, bottom, left, or right sides to scale panel dimensions while preserving slanting angles.
- **SVG Speech Bubbles**: Renders classic Oval, Rounded Rect, Scream (Jagged), and Thought (Cloud) bubbles with drag-adjustable tail pointers that automatically redraw.
- **Narrative Captions**: Quick-add narrative caption boxes styled in handwriting font with narrative yellow backgrounds.
- **Image Panning & Zoom**: Upload image artwork to any cell, slide to zoom, and hold `Shift + drag` inside the panel to pan the illustration.
- **Dynamic Print/PDF Stylesheet**: Click `PRINT COMIC` to open the browser print dialog. CSS rules automatically strip away editor chrome, sidebars, grids, and selection borders, printing one page per sheet exactly. Supports Letter, A4, and Comic book sizing formats.
- **Local Persistence & Portability**: Automatically saves your progress to LocalStorage. Allows exporting your layout designs as `.json` files and reloading them later.

---

## 🛠️ Development & Architecture Guide

The application follows a simple, modular single-page app architecture:

### 1. State Management (`src/App.jsx`)
- Coordinates the list of document pages, document title, and size selections.
- Tracks elements (panels and speech bubbles) on the current page, selection states, zoom level, and snapping tolerances.
- Handles template preset builders (e.g. 2x2 grid, 3 rows, diagonal split) and LocalStorage/file-system data parsing.

### 2. Workspace rendering (`src/components/PageCanvas.jsx`)
- Renders the target sheet canvas dimensions scaled on-screen by `transform: scale(zoom)` (reverts to full 100% scale in print styles).
- Centralizes mouse movement listeners for dragging, corner vertex shaping, side-edge resizing, and bubble tail pointer positioning.

### 3. Quadrilateral Panels (`src/components/Panel.jsx`)
- Uses absolute page coordinates for vertices: `p0` (top-left), `p1` (top-right), `p2` (bottom-right), `p3` (bottom-left).
- Draws panel fills and outlines using SVG `<polygon>`.
- Clips uploaded panel artwork using CSS `clip-path` matching the vertices.
- Applies `pointer-events: none` on transparent outer boundaries, allowing clicks to pass through skewed corners to elements behind them.

### 4. Speech Bubbles (`src/components/Bubble.jsx`)
- Calculates single-path SVG vectors dynamically.
- Triggers inline double-click text editing using overlay textareas matched to font styles (Comic Neue, Bangers, Architects Daughter).

### 5. Alignment Guidelines & Printing
- Guidelines are drawn with subtle linear-gradient repeating rules.
- Print layouts are forced to clean sheets using dynamic `<style>` overrides in React:
  ```css
  @media print {
    @page { size: letter; margin: 0; }
    .comic-page-wrapper { width: 8.5in !important; height: 11in !important; }
  }
  ```
