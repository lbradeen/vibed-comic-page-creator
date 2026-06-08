import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Move } from 'lucide-react';

export default function Panel({
  panel,
  isSelected,
  onSelect,
  onMouseDown,
  onStartResize,
  onUpdateImagePan
}) {
  const panelRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const initialPan = useRef({ x: 0, y: 0 });

  const handleBodyMouseDown = (e) => {
    e.stopPropagation();

    // Check if Shift key is pressed for panning the image
    if (e.shiftKey && panel.image) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      initialPan.current = { x: panel.imagePanX || 0, y: panel.imagePanY || 0 };
      
      const handleMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - panStart.current.x;
        const dy = moveEvent.clientY - panStart.current.y;
        onUpdateImagePan(panel.id, {
          x: initialPan.current.x + dx,
          y: initialPan.current.y + dy
        });
      };

      const handleMouseUp = () => {
        setIsPanning(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      // Normal panel dragging
      onMouseDown(e, panel.id, 'move');
    }
  };

  // Determine vertices (fallback to rectangle bounding box)
  const p0 = panel.p0 || { x: panel.x, y: panel.y };
  const p1 = panel.p1 || { x: panel.x + panel.width, y: panel.y };
  const p2 = panel.p2 || { x: panel.x + panel.width, y: panel.y + panel.height };
  const p3 = panel.p3 || { x: panel.x, y: panel.y + panel.height };

  // Calculate local bounding box
  const minX = Math.min(p0.x, p1.x, p2.x, p3.x);
  const minY = Math.min(p0.y, p1.y, p2.y, p3.y);
  const maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
  const maxY = Math.max(p0.y, p1.y, p2.y, p3.y);
  const w = Math.max(20, maxX - minX);
  const h = Math.max(20, maxY - minY);

  // local coordinates for polygon drawing
  const lp0 = { x: p0.x - minX, y: p0.y - minY };
  const lp1 = { x: p1.x - minX, y: p1.y - minY };
  const lp2 = { x: p2.x - minX, y: p2.y - minY };
  const lp3 = { x: p3.x - minX, y: p3.y - minY };

  // Calculate local coordinates of midpoints for edge handles
  const m_t = { x: (lp0.x + lp1.x) / 2, y: (lp0.y + lp1.y) / 2 };
  const m_b = { x: (lp2.x + lp3.x) / 2, y: (lp2.y + lp3.y) / 2 };
  const m_l = { x: (lp0.x + lp3.x) / 2, y: (lp0.y + lp3.y) / 2 };
  const m_r = { x: (lp1.x + lp2.x) / 2, y: (lp1.y + lp2.y) / 2 };

  const polyPoints = `${lp0.x},${lp0.y} ${lp1.x},${lp1.y} ${lp2.x},${lp2.y} ${lp3.x},${lp3.y}`;

  // CSS clip-path for image container
  const clipPathString = `polygon(${lp0.x}px ${lp0.y}px, ${lp1.x}px ${lp1.y}px, ${lp2.x}px ${lp2.y}px, ${lp3.x}px ${lp3.y}px)`;

  const imageStyle = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(calc(-50% + ${panel.imagePanX || 0}px), calc(-50% + ${panel.imagePanY || 0}px)) scale(${panel.imageScale || 1})`,
    pointerEvents: 'none',
    maxWidth: '1000%',
    maxHeight: '1000%',
    display: 'block'
  };

  return (
    <div
      ref={panelRef}
      className="panel-container"
      style={{
        position: 'absolute',
        left: minX,
        top: minY,
        width: w,
        height: h,
        zIndex: panel.zIndex || 1,
        pointerEvents: 'none', // Allow click-through to underlying elements
        overflow: 'visible'
      }}
    >
      {/* Background fill and borders drawn via SVG */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none'
        }}
      >
        <polygon
          points={polyPoints}
          fill={panel.backgroundColor || '#ffffff'}
          stroke={panel.borderColor || '#000000'}
          strokeWidth={panel.borderWidth ?? 4}
          strokeLinejoin="round"
          style={{ pointerEvents: 'auto', cursor: isPanning ? 'grabbing' : 'grab' }}
          onMouseDown={handleBodyMouseDown}
        />
      </svg>

      {/* Clipped image container */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          clipPath: clipPathString,
          WebkitClipPath: clipPathString,
          pointerEvents: 'auto',
          cursor: isPanning ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleBodyMouseDown}
      >
        {/* Halftone Dot Overlay */}
        {panel.halftone && <div className="halftone-overlay" />}

        {/* Image rendering */}
        {panel.image ? (
          <img
            src={panel.image}
            alt="Comic Art"
            style={imageStyle}
            draggable={false}
          />
        ) : (
          <div
            className="no-print"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(0, 0, 0, 0.25)',
              fontSize: '12px',
              fontFamily: 'var(--sans)',
              pointerEvents: 'none',
              userSelect: 'none',
              gap: '4px'
            }}
          >
            <ImageIcon size={24} strokeWidth={1.5} />
            <span>Empty Panel</span>
            <span style={{ fontSize: '9px', opacity: 0.7 }}>(Double click / Select to upload)</span>
          </div>
        )}

        {/* Dragging visual indicators for panning */}
        {isPanning && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              textShadow: '1px 1px 2px #000'
            }}
          >
            <Move size={20} />
          </div>
        )}
      </div>

      {/* Render 4 corner handles if selected */}
      {isSelected && (
        <>
          {/* Custom Selection Outline drawn as SVG */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'visible',
              pointerEvents: 'none'
            }}
          >
            <polygon
              points={polyPoints}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>

          {/* 4 Corner Resize / Shape points */}
          <div
            className="resize-handle"
            style={{ left: lp0.x - 5, top: lp0.y - 5, cursor: 'nwse-resize' }}
            onMouseDown={(e) => onStartResize(e, panel.id, 'c0')}
            title="Drag Corner"
          />
          <div
            className="resize-handle"
            style={{ left: lp1.x - 5, top: lp1.y - 5, cursor: 'nesw-resize' }}
            onMouseDown={(e) => onStartResize(e, panel.id, 'c1')}
            title="Drag Corner"
          />
          <div
            className="resize-handle"
            style={{ left: lp2.x - 5, top: lp2.y - 5, cursor: 'nwse-resize' }}
            onMouseDown={(e) => onStartResize(e, panel.id, 'c2')}
            title="Drag Corner"
          />
          <div
            className="resize-handle"
            style={{ left: lp3.x - 5, top: lp3.y - 5, cursor: 'nesw-resize' }}
            onMouseDown={(e) => onStartResize(e, panel.id, 'c3')}
            title="Drag Corner"
          />

          {/* 4 Side Edge Resize points (yellow style) */}
          <div
            className="resize-handle"
            style={{ left: m_t.x - 5, top: m_t.y - 5, cursor: 'ns-resize', background: 'var(--primary)', border: '2px solid #000', borderRadius: '2px' }}
            onMouseDown={(e) => onStartResize(e, panel.id, 'e_t')}
            title="Resize Top Side"
          />
          <div
            className="resize-handle"
            style={{ left: m_r.x - 5, top: m_r.y - 5, cursor: 'ew-resize', background: 'var(--primary)', border: '2px solid #000', borderRadius: '2px' }}
            onMouseDown={(e) => onStartResize(e, panel.id, 'e_r')}
            title="Resize Right Side"
          />
          <div
            className="resize-handle"
            style={{ left: m_b.x - 5, top: m_b.y - 5, cursor: 'ns-resize', background: 'var(--primary)', border: '2px solid #000', borderRadius: '2px' }}
            onMouseDown={(e) => onStartResize(e, panel.id, 'e_b')}
            title="Resize Bottom Side"
          />
          <div
            className="resize-handle"
            style={{ left: m_l.x - 5, top: m_l.y - 5, cursor: 'ew-resize', background: 'var(--primary)', border: '2px solid #000', borderRadius: '2px' }}
            onMouseDown={(e) => onStartResize(e, panel.id, 'e_l')}
            title="Resize Left Side"
          />
        </>
      )}
    </div>
  );
}
