import React, { useRef } from 'react';
import Panel from './Panel';
import Bubble from './Bubble';

export default function PageCanvas({
  page,
  pageSizeConfig, // { name, width, height }
  selectedItemId,
  selectedItemType,
  snapToGrid,
  gridVisible,
  onSelectItem,
  onUpdatePanel,
  onUpdateBubble,
  onUpdateImagePan
}) {
  const canvasRef = useRef(null);

  // Minimum dimensions
  const MIN_PANEL_WIDTH = 40;
  const MIN_PANEL_HEIGHT = 40;
  const MIN_BUBBLE_WIDTH = 40;
  const MIN_BUBBLE_HEIGHT = 30;

  const handleCanvasClick = (e) => {
    // Deselect if clicking directly on the canvas background
    if (e.target === canvasRef.current || e.target.classList.contains('grid-overlay')) {
      onSelectItem(null, null);
    }
  };

  const handleStartDragOrResize = (e, id, type, action) => {
    e.stopPropagation();
    e.preventDefault();

    onSelectItem(id, type);

    const isPanel = type === 'panel';
    const item = isPanel
      ? page.panels.find((p) => p.id === id)
      : page.bubbles.find((b) => b.id === id);

    if (!item) return;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    const startX = item.x;
    const startY = item.y;
    const startW = item.width;
    const startH = item.height;

    // Initialize/read vertices for panels
    let p0 = isPanel ? { ...(item.p0 || { x: startX, y: startY }) } : null;
    let p1 = isPanel ? { ...(item.p1 || { x: startX + startW, y: startY }) } : null;
    let p2 = isPanel ? { ...(item.p2 || { x: startX + startW, y: startY + startH }) } : null;
    let p3 = isPanel ? { ...(item.p3 || { x: startX, y: startY + startH }) } : null;

    // Tail offset (for bubbles)
    const startTailX = item.tailX ?? (startW / 2);
    const startTailY = item.tailY ?? (startH + 40);

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startMouseX;
      const dy = moveEvent.clientY - startMouseY;

      const snapVal = snapToGrid ? 10 : 1;
      const snap = (val) => Math.round(val / snapVal) * snapVal;

      if (action === 'move') {
        if (isPanel) {
          const snappedDx = snap(dx);
          const snappedDy = snap(dy);

          const np0 = { x: p0.x + snappedDx, y: p0.y + snappedDy };
          const np1 = { x: p1.x + snappedDx, y: p1.y + snappedDy };
          const np2 = { x: p2.x + snappedDx, y: p2.y + snappedDy };
          const np3 = { x: p3.x + snappedDx, y: p3.y + snappedDy };

          const minX = Math.min(np0.x, np1.x, np2.x, np3.x);
          const minY = Math.min(np0.y, np1.y, np2.y, np3.y);
          const maxX = Math.max(np0.x, np1.x, np2.x, np3.x);
          const maxY = Math.max(np0.y, np1.y, np2.y, np3.y);

          // Prevent moving off canvas bounds (at least some panel visible)
          const margin = 20;
          const canvasMaxX = pageSizeConfig.width - margin;
          const canvasMaxY = pageSizeConfig.height - margin;
          
          if (minX > canvasMaxX || minY > canvasMaxY || maxX < margin || maxY < margin) {
            return; // Don't drag completely off-screen
          }

          onUpdatePanel(id, {
            p0: np0,
            p1: np1,
            p2: np2,
            p3: np3,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          });
        } else {
          const newX = snap(startX + dx);
          const newY = snap(startY + dy);
          const maxX = pageSizeConfig.width - 20;
          const maxY = pageSizeConfig.height - 20;
          const clampedX = Math.max(-startW + 20, Math.min(maxX, newX));
          const clampedY = Math.max(-startH + 20, Math.min(maxY, newY));
          onUpdateBubble(id, { x: clampedX, y: clampedY });
        }
      } else if (action === 'tail') {
        const newTailX = snap(startTailX + dx);
        const newTailY = snap(startTailY + dy);
        onUpdateBubble(id, { tailX: newTailX, tailY: newTailY });
      } else if (isPanel && action.startsWith('c')) {
        // Dragging a specific corner handle
        const snappedDx = snap(dx);
        const snappedDy = snap(dy);

        let np0 = { ...p0 };
        let np1 = { ...p1 };
        let np2 = { ...p2 };
        let np3 = { ...p3 };

        if (action === 'c0') {
          np0.x = p0.x + snappedDx;
          np0.y = p0.y + snappedDy;
        } else if (action === 'c1') {
          np1.x = p1.x + snappedDx;
          np1.y = p1.y + snappedDy;
        } else if (action === 'c2') {
          np2.x = p2.x + snappedDx;
          np2.y = p2.y + snappedDy;
        } else if (action === 'c3') {
          np3.x = p3.x + snappedDx;
          np3.y = p3.y + snappedDy;
        }

        const minX = Math.min(np0.x, np1.x, np2.x, np3.x);
        const minY = Math.min(np0.y, np1.y, np2.y, np3.y);
        const maxX = Math.max(np0.x, np1.x, np2.x, np3.x);
        const maxY = Math.max(np0.y, np1.y, np2.y, np3.y);

        onUpdatePanel(id, {
          p0: np0,
          p1: np1,
          p2: np2,
          p3: np3,
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        });
      } else if (isPanel && action.startsWith('e_')) {
        // Dragging a side/edge handle
        const snappedDx = snap(dx);
        const snappedDy = snap(dy);

        let np0 = { ...p0 };
        let np1 = { ...p1 };
        let np2 = { ...p2 };
        let np3 = { ...p3 };

        const minW = 40;
        const minH = 40;

        if (action === 'e_t') {
          const newMinY = Math.min(p0.y + snappedDy, p1.y + snappedDy);
          const currentMaxY = Math.max(p2.y, p3.y);
          if (currentMaxY - newMinY >= minH) {
            np0.y = p0.y + snappedDy;
            np1.y = p1.y + snappedDy;
          }
        } else if (action === 'e_b') {
          const newMaxY = Math.max(p2.y + snappedDy, p3.y + snappedDy);
          const currentMinY = Math.min(p0.y, p1.y);
          if (newMaxY - currentMinY >= minH) {
            np2.y = p2.y + snappedDy;
            np3.y = p3.y + snappedDy;
          }
        } else if (action === 'e_l') {
          const newMinX = Math.min(p0.x + snappedDx, p3.x + snappedDx);
          const currentMaxX = Math.max(p1.x, p2.x);
          if (currentMaxX - newMinX >= minW) {
            np0.x = p0.x + snappedDx;
            np3.x = p3.x + snappedDx;
          }
        } else if (action === 'e_r') {
          const newMaxX = Math.max(p1.x + snappedDx, p2.x + snappedDx);
          const currentMinX = Math.min(p0.x, p3.x);
          if (newMaxX - currentMinX >= minW) {
            np1.x = p1.x + snappedDx;
            np2.x = p2.x + snappedDx;
          }
        }

        const minX = Math.min(np0.x, np1.x, np2.x, np3.x);
        const minY = Math.min(np0.y, np1.y, np2.y, np3.y);
        const maxX = Math.max(np0.x, np1.x, np2.x, np3.x);
        const maxY = Math.max(np0.y, np1.y, np2.y, np3.y);

        onUpdatePanel(id, {
          p0: np0,
          p1: np1,
          p2: np2,
          p3: np3,
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        });
      } else {
        // Standard bubble resizing
        let newX = startX;
        let newY = startY;
        let newW = startW;
        let newH = startH;

        const minW = MIN_BUBBLE_WIDTH;
        const minH = MIN_BUBBLE_HEIGHT;

        if (action.includes('r')) {
          newW = snap(startW + dx);
          if (newW < minW) newW = minW;
        } else if (action.includes('l')) {
          const proposedX = snap(startX + dx);
          const proposedW = startW + startX - proposedX;
          if (proposedW >= minW) {
            newX = proposedX;
            newW = proposedW;
          }
        }

        if (action.includes('b')) {
          newH = snap(startH + dy);
          if (newH < minH) newH = minH;
        } else if (action.includes('t')) {
          const proposedY = snap(startY + dy);
          const proposedH = startH + startY - proposedY;
          if (proposedH >= minH) {
            newY = proposedY;
            newH = proposedH;
          }
        }

        onUpdateBubble(id, { x: newX, y: newY, width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const canvasStyle = {
    position: 'relative',
    width: `${pageSizeConfig.width}px`,
    height: `${pageSizeConfig.height}px`,
    backgroundColor: '#ffffff',
    border: '2px solid #000000',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.2)',
    flexShrink: 0,
    margin: '0 auto',
    overflow: 'hidden'
  };

  return (
    <div
      ref={canvasRef}
      className="comic-page-wrapper"
      style={canvasStyle}
      onMouseDown={handleCanvasClick}
    >
      {/* Alignment Grid Overlay */}
      {gridVisible && (
        <div
          className="grid-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundSize: '20px 20px',
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
            `,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Render panels */}
      {page.panels.map((panel) => (
        <Panel
          key={panel.id}
          panel={panel}
          isSelected={selectedItemId === panel.id && selectedItemType === 'panel'}
          onSelect={(id) => onSelectItem(id, 'panel')}
          onMouseDown={(e, id, action) => handleStartDragOrResize(e, id, 'panel', action)}
          onStartResize={(e, id, handle) => handleStartDragOrResize(e, id, 'panel', handle)}
          onUpdateImagePan={onUpdateImagePan}
        />
      ))}

      {/* Render speech bubbles */}
      {page.bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          bubble={bubble}
          isSelected={selectedItemId === bubble.id && selectedItemType === 'bubble'}
          onSelect={(id) => onSelectItem(id, 'bubble')}
          onMouseDown={(e, id, action) => handleStartDragOrResize(e, id, 'bubble', action)}
          onStartResize={(e, id, handle) => handleStartDragOrResize(e, id, 'bubble', handle)}
          onStartDragTail={(e, id) => handleStartDragOrResize(e, id, 'bubble', 'tail')}
          onUpdateText={onUpdateBubble}
        />
      ))}
    </div>
  );
}
