import React, { useState, useEffect, useRef } from 'react';

export default function Bubble({
  bubble,
  isSelected,
  onSelect,
  onMouseDown,
  onStartResize,
  onStartDragTail,
  onUpdateText
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [textVal, setTextVal] = useState(bubble.text || 'POW!');
  const textareaRef = useRef(null);

  // Sync state with prop updates
  useEffect(() => {
    setTextVal(bubble.text);
  }, [bubble.text]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateText(bubble.id, textVal);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      onUpdateText(bubble.id, textVal);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTextVal(bubble.text);
    }
  };

  // Dimensions
  const w = Math.max(40, bubble.width);
  const h = Math.max(30, bubble.height);
  const tx = bubble.tailX ?? (w / 2);
  const ty = bubble.tailY ?? (h + 40);

  const borderWidth = bubble.borderWidth ?? 2;
  const borderColor = bubble.borderColor || '#000000';
  const backgroundColor = bubble.backgroundColor || '#ffffff';

  // Math for drawing speech shapes
  const cx = w / 2;
  const cy = h / 2;

  const renderBubbleShape = () => {
    if (bubble.type === 'caption') {
      // Captions are simple rectangles with no tails
      return (
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={w - borderWidth}
          height={h - borderWidth}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
          strokeLinejoin="miter"
        />
      );
    }

    if (bubble.bubbleStyle === 'rectangle') {
      // SVG trick for rectangle:
      // 1. Draw tail polygon
      // 2. Draw rounded rectangle
      // 3. Draw borderless rect/polygon to mask intersection
      const rx = 8;
      const ry = 8;

      // Determine tail base points based on tail direction
      let b1 = { x: cx - 12, y: h - borderWidth };
      let b2 = { x: cx + 12, y: h - borderWidth };
      let mask = null;

      if (tx < 0) { // left
        b1 = { x: borderWidth, y: cy - 10 };
        b2 = { x: borderWidth, y: cy + 10 };
        mask = (
          <rect
            x={borderWidth - 2}
            y={cy - 8}
            width={borderWidth + 4}
            height={16}
            fill={backgroundColor}
            stroke="none"
          />
        );
      } else if (tx > w) { // right
        b1 = { x: w - borderWidth, y: cy - 10 };
        b2 = { x: w - borderWidth, y: cy + 10 };
        mask = (
          <rect
            x={w - borderWidth - 2}
            y={cy - 8}
            width={borderWidth + 4}
            height={16}
            fill={backgroundColor}
            stroke="none"
          />
        );
      } else if (ty < 0) { // top
        b1 = { x: cx - 10, y: borderWidth };
        b2 = { x: cx + 10, y: borderWidth };
        mask = (
          <rect
            x={cx - 8}
            y={borderWidth - 2}
            width={16}
            height={borderWidth + 4}
            fill={backgroundColor}
            stroke="none"
          />
        );
      } else { // bottom (default)
        b1 = { x: cx - 12, y: h - borderWidth };
        b2 = { x: cx + 12, y: h - borderWidth };
        mask = (
          <rect
            x={cx - 10}
            y={h - borderWidth - 2}
            width={20}
            height={borderWidth + 4}
            fill={backgroundColor}
            stroke="none"
          />
        );
      }

      return (
        <g>
          {/* Tail */}
          <polygon
            points={`${b1.x},${b1.y} ${tx},${ty} ${b2.x},${b2.y}`}
            fill={backgroundColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
            strokeLinejoin="round"
          />
          {/* Main Rect */}
          <rect
            x={borderWidth / 2}
            y={borderWidth / 2}
            width={w - borderWidth}
            height={h - borderWidth}
            rx={rx}
            ry={ry}
            fill={backgroundColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
          {/* Eraser mask */}
          {mask}
        </g>
      );
    }

    if (bubble.bubbleStyle === 'thought') {
      // Thought Bubble:
      // 1. Draw cloud shape from overlapping circles
      // 2. Draw 3 floating thought circles pointing to tx,ty
      // We will place 8 overlapping circles around the perimeter
      const circleCount = 8;
      const rx = w / 2 - 8;
      const ry = h / 2 - 8;
      const circles = [];

      for (let i = 0; i < circleCount; i++) {
        const angle = i * (2 * Math.PI / circleCount);
        // Position of circle center on the ellipse
        const ccx = cx + rx * Math.cos(angle);
        const ccy = cy + ry * Math.sin(angle);
        // Radius of cloud circle
        const cr = Math.min(w, h) * 0.22;
        circles.push({ cx: ccx, cy: ccy, r: cr });
      }

      // Add main center ellipse
      const centerEllipse = { cx, cy, rx: rx * 0.8, ry: ry * 0.8 };

      // Thought circles leading to character
      const thoughtBubbles = [];
      const distVec = { x: tx - cx, y: ty - cy };
      const steps = [0.55, 0.78, 0.95];
      const sizes = [Math.min(w, h) * 0.09, Math.min(w, h) * 0.06, Math.min(w, h) * 0.04];

      steps.forEach((step, idx) => {
        thoughtBubbles.push({
          cx: cx + distVec.x * step,
          cy: cy + distVec.y * step,
          r: Math.max(3, sizes[idx])
        });
      });

      return (
        <g>
          {/* Thought trail circles (border + fill) */}
          {thoughtBubbles.map((tb, i) => (
            <circle
              key={`tb-border-${i}`}
              cx={tb.cx}
              cy={tb.cy}
              r={tb.r}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          ))}

          {/* Cloud border */}
          {circles.map((c, i) => (
            <circle
              key={`c-border-${i}`}
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          ))}
          <ellipse
            cx={centerEllipse.cx}
            cy={centerEllipse.cy}
            rx={centerEllipse.rx}
            ry={centerEllipse.ry}
            fill={backgroundColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />

          {/* Cloud masks to erase inner borders */}
          {circles.map((c, i) => (
            <circle
              key={`c-mask-${i}`}
              cx={c.cx}
              cy={c.cy}
              r={c.r - borderWidth/2}
              fill={backgroundColor}
              stroke="none"
            />
          ))}
          <ellipse
            cx={centerEllipse.cx}
            cy={centerEllipse.cy}
            rx={centerEllipse.rx - borderWidth/2}
            ry={centerEllipse.ry - borderWidth/2}
            fill={backgroundColor}
            stroke="none"
          />
        </g>
      );
    }

    if (bubble.bubbleStyle === 'scream') {
      // Scream bubble (jagged stars)
      // We divide into 18 points.
      // One point (closest to tail angle) goes to tx, ty.
      const pointsCount = 18;
      const rx = w / 2;
      const ry = h / 2;
      
      const tailAngle = Math.atan2(ty - cy, tx - cx);
      // Map tail angle to [0, 2*PI]
      const normalizedTailAngle = tailAngle < 0 ? tailAngle + 2 * Math.PI : tailAngle;
      
      const polyPoints = [];
      let closestIdx = 0;
      let minAngleDiff = Infinity;
      
      // Pre-calculate segments and find closest spike
      for (let i = 0; i < pointsCount; i++) {
        const angle = i * (2 * Math.PI / pointsCount);
        const diff = Math.abs(angle - normalizedTailAngle);
        const circularDiff = Math.min(diff, 2 * Math.PI - diff);
        if (circularDiff < minAngleDiff) {
          minAngleDiff = circularDiff;
          closestIdx = i;
        }
      }

      for (let i = 0; i < pointsCount; i++) {
        const angle = i * (2 * Math.PI / pointsCount);
        let curRx = rx;
        let curRy = ry;
        
        if (i === closestIdx) {
          // Point spike all the way to tail tip
          polyPoints.push(`${tx},${ty}`);
          continue;
        }
        
        // Alternate spikes
        if (i % 2 === 0) {
          curRx = rx * 0.75;
          curRy = ry * 0.75;
        }
        
        const px = cx + curRx * Math.cos(angle);
        const py = cy + curRy * Math.sin(angle);
        polyPoints.push(`${px},${py}`);
      }

      return (
        <polygon
          points={polyPoints.join(' ')}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
          strokeLinejoin="miter"
        />
      );
    }

    // Default: 'oval' Speech Bubble (single path math)
    const rx = Math.max(10, w / 2 - borderWidth);
    const ry = Math.max(10, h / 2 - borderWidth);
    const dx = tx - cx;
    const dy = ty - cy;
    const angle = Math.atan2(dy, dx);
    const spread = 0.22; // spread angle in radians

    const c1x = cx + rx * Math.cos(angle - spread);
    const c1y = cy + ry * Math.sin(angle - spread);
    const c2x = cx + rx * Math.cos(angle + spread);
    const c2y = cy + ry * Math.sin(angle + spread);

    const d = `M ${c1x} ${c1y} L ${tx} ${ty} L ${c2x} ${c2y} A ${rx} ${ry} 0 1 1 ${c1x} ${c1y} Z`;

    return (
      <path
        d={d}
        fill={backgroundColor}
        stroke={borderColor}
        strokeWidth={borderWidth}
        strokeLinejoin="round"
      />
    );
  };

  // Text container boundaries inside bubble to ensure proper padding
  let paddingScaleX = 0.7;
  let paddingScaleY = 0.6;
  if (bubble.type === 'caption') {
    paddingScaleX = 0.9;
    paddingScaleY = 0.8;
  } else if (bubble.bubbleStyle === 'rectangle') {
    paddingScaleX = 0.8;
    paddingScaleY = 0.7;
  }

  const textContainerStyle = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: `${w * paddingScaleX}px`,
    height: `${h * paddingScaleY}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: isEditing ? 'auto' : 'none',
    overflow: 'hidden'
  };

  const textStyle = {
    fontFamily: bubble.fontFamily || 'var(--comic-font)',
    fontSize: `${bubble.fontSize || 16}px`,
    color: bubble.color || '#000000',
    textAlign: bubble.align || 'center',
    fontWeight: bubble.bold ? 'bold' : 'normal',
    fontStyle: bubble.italic ? 'italic' : 'normal',
    width: '100%',
    wordBreak: 'break-word',
    lineHeight: '1.2',
    userSelect: 'none'
  };

  const textareaStyle = {
    ...textStyle,
    background: 'none',
    border: 'none',
    outline: 'none',
    resize: 'none',
    height: '100%',
    padding: 0,
    margin: 0
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: bubble.x,
        top: bubble.y,
        width: w,
        height: h,
        zIndex: bubble.zIndex || 2
      }}
      onMouseDown={(e) => onMouseDown(e, bubble.id, 'move')}
    >
      {/* SVG Canvas for Bubble shape */}
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
        {renderBubbleShape()}
      </svg>

      {/* Text block overlay */}
      <div
        style={textContainerStyle}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            style={textareaStyle}
            value={textVal}
            onChange={(e) => setTextVal(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div style={textStyle}>
            {bubble.text.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Resize handles */}
      {isSelected && (
        <>
          <div className="resize-handle handle-tl" onMouseDown={(e) => onStartResize(e, bubble.id, 'tl')} />
          <div className="resize-handle handle-t" onMouseDown={(e) => onStartResize(e, bubble.id, 't')} />
          <div className="resize-handle handle-tr" onMouseDown={(e) => onStartResize(e, bubble.id, 'tr')} />
          <div className="resize-handle handle-r" onMouseDown={(e) => onStartResize(e, bubble.id, 'r')} />
          <div className="resize-handle handle-br" onMouseDown={(e) => onStartResize(e, bubble.id, 'br')} />
          <div className="resize-handle handle-b" onMouseDown={(e) => onStartResize(e, bubble.id, 'b')} />
          <div className="resize-handle handle-bl" onMouseDown={(e) => onStartResize(e, bubble.id, 'bl')} />
          <div className="resize-handle handle-l" onMouseDown={(e) => onStartResize(e, bubble.id, 'l')} />

          {/* Tail Dragging handle (only if not a caption box) */}
          {bubble.type !== 'caption' && (
            <div
              className="tail-handle"
              style={{
                left: tx - 7,
                top: ty - 7
              }}
              onMouseDown={(e) => onStartDragTail(e, bubble.id)}
            />
          )}
        </>
      )}
    </div>
  );
}
