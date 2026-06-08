import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  Download,
  Upload,
  Type,
  Square,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Grid,
  Image as ImageIcon,
  BookOpen,
  Layout,
  Layers,
  Settings,
  HelpCircle,
  FolderOpen,
  FilePlus
} from 'lucide-react';
import PageCanvas from './components/PageCanvas';

const PAGE_SIZES = {
  comic: { name: 'Standard Comic (6.6" x 10.25")', width: 636, height: 984 },
  letter: { name: 'Letter (8.5" x 11")', width: 816, height: 1056 },
  a4: { name: 'A4 (210mm x 297mm)', width: 794, height: 1123 }
};

const DEFAULT_PAGE = () => ({
  id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  panels: [
    {
      id: `panel-1`,
      x: 40,
      y: 40,
      width: 556,
      height: 420,
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 4,
      halftone: false,
      image: null,
      imageScale: 1,
      imagePanX: 0,
      imagePanY: 0,
      zIndex: 1
    },
    {
      id: `panel-2`,
      x: 40,
      y: 480,
      width: 268,
      height: 460,
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 4,
      halftone: false,
      image: null,
      imageScale: 1,
      imagePanX: 0,
      imagePanY: 0,
      zIndex: 2
    },
    {
      id: `panel-3`,
      x: 328,
      y: 480,
      width: 268,
      height: 460,
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 4,
      halftone: false,
      image: null,
      imageScale: 1,
      imagePanX: 0,
      imagePanY: 0,
      zIndex: 3
    }
  ],
  bubbles: [
    {
      id: `bubble-1`,
      type: 'bubble',
      bubbleStyle: 'oval',
      x: 240,
      y: 50,
      width: 160,
      height: 100,
      text: 'POW!\nWE CAN DRAG\nTHINGS AROUND!',
      tailX: 80,
      tailY: 150,
      fontFamily: 'var(--comic-font)',
      fontSize: 16,
      color: '#000000',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 2.5,
      bold: true,
      italic: false,
      align: 'center',
      zIndex: 4
    }
  ]
});

export default function App() {
  // Application State
  const [documentName, setDocumentName] = useState('My Awesome Comic');
  const [pageSize, setPageSize] = useState('comic');
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null); // 'panel' or 'bubble'
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridVisible, setGridVisible] = useState(false);
  const [zoom, setZoom] = useState(0.65);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedDoc = localStorage.getItem('pow_comic_document');
      if (savedDoc) {
        const parsed = JSON.parse(savedDoc);
        if (parsed.documentName) setDocumentName(parsed.documentName);
        if (parsed.pageSize) setPageSize(parsed.pageSize);
        if (parsed.pages && parsed.pages.length > 0) {
          setPages(parsed.pages);
          setCurrentPageIndex(0);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading saved comic:', e);
    }
    // Fallback if no saved document
    setPages([DEFAULT_PAGE()]);
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (pages.length === 0) return;
    const docToSave = {
      documentName,
      pageSize,
      pages
    };
    localStorage.setItem('pow_comic_document', JSON.stringify(docToSave));
  }, [documentName, pageSize, pages]);

  // Current page helper
  const currentPage = pages[currentPageIndex] || { panels: [], bubbles: [] };

  // Select Item callback
  const handleSelectItem = (id, type) => {
    setSelectedItemId(id);
    setSelectedItemType(type);
  };

  // Add Panel
  const handleAddPanel = () => {
    const size = PAGE_SIZES[pageSize];
    const newPanel = {
      id: `panel-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      x: Math.round((size.width / 2 - 100) / 10) * 10,
      y: Math.round((size.height / 2 - 100) / 10) * 10,
      width: 200,
      height: 200,
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 4,
      halftone: false,
      image: null,
      imageScale: 1,
      imagePanX: 0,
      imagePanY: 0,
      zIndex: (currentPage.panels.length || 0) + (currentPage.bubbles.length || 0) + 1
    };

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      panels: [...currentPage.panels, newPanel]
    };
    setPages(updatedPages);
    handleSelectItem(newPanel.id, 'panel');
  };

  // Add Speech Bubble / Caption
  const handleAddBubble = (bubbleType = 'bubble', style = 'oval') => {
    const size = PAGE_SIZES[pageSize];
    const isCaption = bubbleType === 'caption';

    const newBubble = {
      id: `bubble-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: bubbleType,
      bubbleStyle: style,
      x: Math.round((size.width / 2 - 75) / 10) * 10,
      y: Math.round((size.height / 3) / 10) * 10,
      width: isCaption ? 160 : 140,
      height: isCaption ? 60 : 80,
      text: isCaption ? 'MEANWHILE...' : 'POW!\nCOMIC DIALOG!',
      tailX: isCaption ? 80 : 70,
      tailY: isCaption ? 60 : 120, // offset pointing down
      fontFamily: isCaption ? 'var(--comic-caption)' : 'var(--comic-font)',
      fontSize: 16,
      color: '#000000',
      backgroundColor: isCaption ? '#ffeb3b' : '#ffffff', // standard caption yellow
      borderColor: '#000000',
      borderWidth: 2.5,
      bold: isCaption ? false : true,
      italic: isCaption ? true : false,
      align: 'center',
      zIndex: (currentPage.panels.length || 0) + (currentPage.bubbles.length || 0) + 1
    };

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      bubbles: [...currentPage.bubbles, newBubble]
    };
    setPages(updatedPages);
    handleSelectItem(newBubble.id, 'bubble');
  };

  // Update panel
  const handleUpdatePanel = (id, updates) => {
    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      panels: currentPage.panels.map((p) => (p.id === id ? { ...p, ...updates } : p))
    };
    setPages(updatedPages);
  };

  // Reset panel corners to normal rectangle shape
  const handleResetPanelToRect = (id) => {
    if (!id) return;
    const p = currentPage.panels.find((panel) => panel.id === id);
    if (!p) return;

    const p0 = p.p0 || { x: p.x, y: p.y };
    const p1 = p.p1 || { x: p.x + p.width, y: p.y };
    const p2 = p.p2 || { x: p.x + p.width, y: p.y + p.height };
    const p3 = p.p3 || { x: p.x, y: p.y + p.height };

    const minX = Math.min(p0.x, p1.x, p2.x, p3.x);
    const minY = Math.min(p0.y, p1.y, p2.y, p3.y);
    const maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
    const maxY = Math.max(p0.y, p1.y, p2.y, p3.y);

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      panels: currentPage.panels.map((panel) => {
        if (panel.id === id) {
          const copy = { ...panel };
          delete copy.p0;
          delete copy.p1;
          delete copy.p2;
          delete copy.p3;
          copy.x = minX;
          copy.y = minY;
          copy.width = maxX - minX;
          copy.height = maxY - minY;
          return copy;
        }
        return panel;
      })
    };
    setPages(updatedPages);
  };

  // Update bubble / caption text or properties
  const handleUpdateBubble = (id, updates) => {
    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      bubbles: currentPage.bubbles.map((b) => (b.id === id ? { ...b, ...updates } : b))
    };
    setPages(updatedPages);
  };

  // Image pan updating (called dynamically on drag)
  const handleUpdateImagePan = (id, pan) => {
    handleUpdatePanel(id, { imagePanX: pan.x, imagePanY: pan.y });
  };

  // Reorder elements for z-indexing
  const handleOrderElement = (direction) => {
    if (!selectedItemId || !selectedItemType) return;
    const isPanel = selectedItemType === 'panel';
    const items = isPanel ? currentPage.panels : currentPage.bubbles;
    const item = items.find((i) => i.id === selectedItemId);
    if (!item) return;

    // Gather all objects and sort them by current zIndex
    const allObjects = [
      ...currentPage.panels.map((p) => ({ ...p, _type: 'panel' })),
      ...currentPage.bubbles.map((b) => ({ ...b, _type: 'bubble' }))
    ].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    const itemIdx = allObjects.findIndex((x) => x.id === selectedItemId);
    if (itemIdx === -1) return;

    let targetIdx = itemIdx;
    if (direction === 'front') {
      targetIdx = allObjects.length - 1;
    } else if (direction === 'back') {
      targetIdx = 0;
    } else if (direction === 'forward' && itemIdx < allObjects.length - 1) {
      targetIdx = itemIdx + 1;
    } else if (direction === 'backward' && itemIdx > 0) {
      targetIdx = itemIdx - 1;
    }

    if (targetIdx === itemIdx) return;

    // Shift item
    const [moved] = allObjects.splice(itemIdx, 1);
    allObjects.splice(targetIdx, 0, moved);

    // Reassign serial zIndex values
    const newPanels = [];
    const newBubbles = [];
    allObjects.forEach((x, index) => {
      const { _type, ...pureItem } = x;
      pureItem.zIndex = index + 1;
      if (_type === 'panel') {
        newPanels.push(pureItem);
      } else {
        newBubbles.push(pureItem);
      }
    });

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      panels: newPanels,
      bubbles: newBubbles
    };
    setPages(updatedPages);
  };

  // Duplicate Element
  const handleDuplicateElement = () => {
    if (!selectedItemId || !selectedItemType) return;
    const isPanel = selectedItemType === 'panel';

    const updatedPages = [...pages];

    if (isPanel) {
      const original = currentPage.panels.find((p) => p.id === selectedItemId);
      if (!original) return;
      const copy = {
        ...original,
        id: `panel-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        x: original.x + 20,
        y: original.y + 20,
        zIndex: (currentPage.panels.length || 0) + (currentPage.bubbles.length || 0) + 1
      };
      updatedPages[currentPageIndex] = {
        ...currentPage,
        panels: [...currentPage.panels, copy]
      };
      setPages(updatedPages);
      handleSelectItem(copy.id, 'panel');
    } else {
      const original = currentPage.bubbles.find((b) => b.id === selectedItemId);
      if (!original) return;
      const copy = {
        ...original,
        id: `bubble-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        x: original.x + 20,
        y: original.y + 20,
        tailX: original.tailX,
        tailY: original.tailY,
        zIndex: (currentPage.panels.length || 0) + (currentPage.bubbles.length || 0) + 1
      };
      updatedPages[currentPageIndex] = {
        ...currentPage,
        bubbles: [...currentPage.bubbles, copy]
      };
      setPages(updatedPages);
      handleSelectItem(copy.id, 'bubble');
    }
  };

  // Delete Element
  const handleDeleteElement = () => {
    if (!selectedItemId || !selectedItemType) return;
    const isPanel = selectedItemType === 'panel';

    const updatedPages = [...pages];
    if (isPanel) {
      updatedPages[currentPageIndex] = {
        ...currentPage,
        panels: currentPage.panels.filter((p) => p.id !== selectedItemId)
      };
    } else {
      updatedPages[currentPageIndex] = {
        ...currentPage,
        bubbles: currentPage.bubbles.filter((b) => b.id !== selectedItemId)
      };
    }
    setPages(updatedPages);
    handleSelectItem(null, null);
  };

  // Page Management
  const handleAddPage = () => {
    const newPage = DEFAULT_PAGE();
    newPage.id = `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    newPage.panels.forEach((p, idx) => {
      p.id = `panel-${Date.now()}-${idx}`;
    });
    newPage.bubbles.forEach((b, idx) => {
      b.id = `bubble-${Date.now()}-${idx}`;
    });

    const newPages = [...pages, newPage];
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    handleSelectItem(null, null);
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this page?');
    if (!confirmDelete) return;

    const newPages = pages.filter((_, idx) => idx !== currentPageIndex);
    setPages(newPages);
    setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
    handleSelectItem(null, null);
  };

  const handleMovePage = (direction) => {
    if (direction === 'up' && currentPageIndex > 0) {
      const newPages = [...pages];
      const temp = newPages[currentPageIndex];
      newPages[currentPageIndex] = newPages[currentPageIndex - 1];
      newPages[currentPageIndex - 1] = temp;
      setPages(newPages);
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (direction === 'down' && currentPageIndex < pages.length - 1) {
      const newPages = [...pages];
      const temp = newPages[currentPageIndex];
      newPages[currentPageIndex] = newPages[currentPageIndex + 1];
      newPages[currentPageIndex + 1] = temp;
      setPages(newPages);
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  // Apply grid layout templates to current page
  const handleApplyTemplate = (templateName) => {
    const size = PAGE_SIZES[pageSize];
    const margin = 20;
    const gutter = 15;
    const pageW = size.width;
    const pageH = size.height;

    let newPanels = [];

    switch (templateName) {
      case 'splash': {
        newPanels.push({
          id: `panel-${Date.now()}-1`,
          x: margin,
          y: margin,
          width: pageW - 2 * margin,
          height: pageH - 2 * margin
        });
        break;
      }
      case 'rows2': {
        const h = (pageH - 2 * margin - gutter) / 2;
        newPanels = [
          { id: `panel-${Date.now()}-1`, x: margin, y: margin, width: pageW - 2 * margin, height: h },
          { id: `panel-${Date.now()}-2`, x: margin, y: margin + h + gutter, width: pageW - 2 * margin, height: h }
        ];
        break;
      }
      case 'rows3': {
        const h = (pageH - 2 * margin - 2 * gutter) / 3;
        newPanels = [
          { id: `panel-${Date.now()}-1`, x: margin, y: margin, width: pageW - 2 * margin, height: h },
          { id: `panel-${Date.now()}-2`, x: margin, y: margin + h + gutter, width: pageW - 2 * margin, height: h },
          { id: `panel-${Date.now()}-3`, x: margin, y: margin + 2 * (h + gutter), width: pageW - 2 * margin, height: h }
        ];
        break;
      }
      case 'grid4': {
        const w = (pageW - 2 * margin - gutter) / 2;
        const h = (pageH - 2 * margin - gutter) / 2;
        newPanels = [
          { id: `panel-${Date.now()}-1`, x: margin, y: margin, width: w, height: h },
          { id: `panel-${Date.now()}-2`, x: margin + w + gutter, y: margin, width: w, height: h },
          { id: `panel-${Date.now()}-3`, x: margin, y: margin + h + gutter, width: w, height: h },
          { id: `panel-${Date.now()}-4`, x: margin + w + gutter, y: margin + h + gutter, width: w, height: h }
        ];
        break;
      }
      case 'grid6': {
        const w = (pageW - 2 * margin - gutter) / 2;
        const h = (pageH - 2 * margin - 2 * gutter) / 3;
        newPanels = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 2; c++) {
            newPanels.push({
              id: `panel-${Date.now()}-${r}-${c}`,
              x: margin + c * (w + gutter),
              y: margin + r * (h + gutter),
              width: w,
              height: h
            });
          }
        }
        break;
      }
      case 'grid9': {
        const w = (pageW - 2 * margin - 2 * gutter) / 3;
        const h = (pageH - 2 * margin - 2 * gutter) / 3;
        newPanels = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            newPanels.push({
              id: `panel-${Date.now()}-${r}-${c}`,
              x: margin + c * (w + gutter),
              y: margin + r * (h + gutter),
              width: w,
              height: h
            });
          }
        }
        break;
      }
      case 'dynamic': {
        const h = (pageH - 2 * margin - 2 * gutter) / 3;
        const wHalf = (pageW - 2 * margin - gutter) / 2;
        newPanels = [
          { id: `panel-${Date.now()}-1`, x: margin, y: margin, width: pageW - 2 * margin, height: h },
          { id: `panel-${Date.now()}-2`, x: margin, y: margin + h + gutter, width: wHalf, height: h },
          { id: `panel-${Date.now()}-3`, x: margin + wHalf + gutter, y: margin + h + gutter, width: wHalf, height: h },
          { id: `panel-${Date.now()}-4`, x: margin, y: margin + 2 * (h + gutter), width: pageW - 2 * margin, height: h }
        ];
        break;
      }
      case 'blank':
      default:
        newPanels = [];
        break;
    }

    const finalizedPanels = newPanels.map((p, index) => ({
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 4,
      halftone: false,
      image: null,
      imageScale: 1,
      imagePanX: 0,
      imagePanY: 0,
      zIndex: index + 1,
      ...p
    }));

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      panels: finalizedPanels,
      bubbles: [] // Keep bubbles clean or reset? Better to clear so user has a fresh template.
    };
    setPages(updatedPages);
    handleSelectItem(null, null);
  };

  // Image Upload handler
  const handleImageUpload = (e) => {
    if (!selectedItemId || selectedItemType !== 'panel') return;
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      handleUpdatePanel(selectedItemId, { image: uploadEvent.target.result, imageScale: 1, imagePanX: 0, imagePanY: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Clear Image from selected panel
  const handleRemoveImage = () => {
    if (!selectedItemId || selectedItemType !== 'panel') return;
    handleUpdatePanel(selectedItemId, { image: null, imageScale: 1, imagePanX: 0, imagePanY: 0 });
  };

  // Export JSON file
  const handleExportJSON = () => {
    const doc = {
      documentName,
      pageSize,
      pages
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(doc, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${documentName.replace(/\s+/g, '_').toLowerCase()}_layout.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.pages && imported.pages.length > 0) {
          if (imported.documentName) setDocumentName(imported.documentName);
          if (imported.pageSize) setPageSize(imported.pageSize);
          setPages(imported.pages);
          setCurrentPageIndex(0);
          handleSelectItem(null, null);
          alert('Comic book layout imported successfully!');
        } else {
          alert('Invalid comic layout format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Clear layout and start a new comic
  const handleNewComic = () => {
    const confirmNew = window.confirm('Are you sure you want to start a new comic? This will clear your current workspace.');
    if (!confirmNew) return;

    setDocumentName('My Awesome Comic');
    setPageSize('comic');
    setPages([DEFAULT_PAGE()]);
    setCurrentPageIndex(0);
    handleSelectItem(null, null);
  };

  // Trigger Print Dialog
  const handlePrint = () => {
    window.print();
  };

  // Selected item references
  const selectedPanel = selectedItemType === 'panel' ? currentPage.panels.find((p) => p.id === selectedItemId) : null;
  const selectedBubble = selectedItemType === 'bubble' ? currentPage.bubbles.find((b) => b.id === selectedItemId) : null;

  return (
    <div className="app-container">
      {/* Dynamic page print size configuration */}
      <style>
        {`
          @media print {
            @page {
              size: ${pageSize === 'letter' ? 'letter' : pageSize === 'a4' ? 'A4' : '6.625in 10.25in'};
              margin: 0;
            }
            .comic-page-wrapper {
              width: ${pageSize === 'letter' ? '8.5in' : pageSize === 'a4' ? '210mm' : '6.625in'} !important;
              height: ${pageSize === 'letter' ? '11in' : pageSize === 'a4' ? '297mm' : '10.25in'} !important;
              border: none !important;
            }
          }
        `}
      </style>
      {/* Top Navigation / Toolbar */}
      <header className="editor-header no-print">
        <div className="app-logo">
          <span className="logo-badge bangers-text">POW!</span>
          <span className="bangers-text" style={{ letterSpacing: '2px' }}>COMIC BUILDER</span>
        </div>

        {/* Comic Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            style={{
              background: '#0d0f1a',
              border: '2px solid #000',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '14px',
              color: '#fff',
              fontWeight: 'bold',
              fontFamily: 'var(--sans)',
              outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
              textAlign: 'center',
              width: '200px'
            }}
          />
        </div>

        {/* Core actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Snap-to-grid toggle */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            title="Snap to 10px Grid"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: snapToGrid ? 'rgba(255, 210, 63, 0.15)' : 'transparent',
              border: snapToGrid ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.1)',
              color: snapToGrid ? 'var(--primary)' : 'var(--text-muted)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Grid size={14} />
            <span>Snap Grid</span>
          </button>

          {/* Grid lines visibility toggle */}
          <button
            onClick={() => setGridVisible(!gridVisible)}
            title="Toggle Grid Guidelines"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: gridVisible ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
              border: gridVisible ? '2px solid var(--accent-cyan)' : '2px solid rgba(255,255,255,0.1)',
              color: gridVisible ? 'var(--accent-cyan)' : 'var(--text-muted)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Grid size={14} />
            <span>Show Grid</span>
          </button>

          {/* Zoom Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Zoom:</span>
            <select
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{
                background: '#0d0f1a',
                border: '2px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '5px 8px',
                borderRadius: '6px',
                outline: 'none',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <option value="0.4">40%</option>
              <option value="0.5">50%</option>
              <option value="0.6">60%</option>
              <option value="0.65">65%</option>
              <option value="0.75">75%</option>
              <option value="0.85">85%</option>
              <option value="1.0">100%</option>
            </select>
          </div>

          {/* Spacer */}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

          {/* New Comic */}
          <button
            onClick={handleNewComic}
            title="Start a New Comic Layout"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#24273c',
              border: '2px solid #000',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #000'
            }}
          >
            <FilePlus size={14} style={{ color: 'var(--secondary)' }} />
            <span>New Comic</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            title="Export Layout to File"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#24273c',
              border: '2px solid #000',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #000'
            }}
          >
            <Download size={14} />
            <span>Save Project</span>
          </button>

          {/* Import JSON file label wrapper */}
          <label
            title="Import Layout from File"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#24273c',
              border: '2px solid #000',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #000'
            }}
          >
            <FolderOpen size={14} />
            <span>Load Project</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              style={{ display: 'none' }}
            />
          </label>

          {/* Print */}
          <button
            onClick={handlePrint}
            title="Print Pages or Export as PDF"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--primary)',
              border: '2px solid #000',
              color: '#000',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #000',
              transition: 'transform 0.1s'
            }}
          >
            <Printer size={14} />
            <span>PRINT COMIC</span>
          </button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="editor-layout">
        {/* LEFT PANEL: Document Flow, Pages & Grid Templates */}
        <aside className="editor-sidebar no-print">
          {/* Document Properties */}
          <div style={{ padding: '16px', borderBottom: '2px solid #000' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '12px' }}>
              <Settings size={16} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Canvas Config</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Page Size Format</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value);
                  handleSelectItem(null, null);
                }}
                style={{
                  background: '#0d0f1a',
                  border: '2px solid #000',
                  color: '#fff',
                  padding: '8px',
                  borderRadius: '4px',
                  outline: 'none',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                <option value="comic">Standard Comic (6.6" x 10.25")</option>
                <option value="letter">US Letter (8.5" x 11")</option>
                <option value="a4">A4 (210mm x 297mm)</option>
              </select>
            </div>
          </div>

          {/* Page Manager */}
          <div style={{ padding: '16px', borderBottom: '2px solid #000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <BookOpen size={16} />
                <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Pages ({pages.length})
                </span>
              </div>
              <button
                onClick={handleAddPage}
                style={{
                  background: 'var(--secondary)',
                  border: '2px solid #000',
                  color: '#fff',
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '1px 1px 0 #000'
                }}
                title="Add New Page"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* List of Pages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setCurrentPageIndex(idx);
                    handleSelectItem(null, null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: currentPageIndex === idx ? 'rgba(255, 210, 63, 0.1)' : '#1a1c29',
                    border: currentPageIndex === idx ? '2px solid var(--primary)' : '2px solid #000',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: currentPageIndex === idx ? 'var(--primary)' : '#fff' }}>
                    Page {idx + 1}
                  </span>
                  
                  {currentPageIndex === idx && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMovePage('up')}
                        disabled={idx === 0}
                        style={{ background: 'none', border: 'none', color: '#fff', opacity: idx === 0 ? 0.3 : 0.8, cursor: 'pointer' }}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMovePage('down')}
                        disabled={idx === pages.length - 1}
                        style={{ background: 'none', border: 'none', color: '#fff', opacity: idx === pages.length - 1 ? 0.3 : 0.8, cursor: 'pointer' }}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={handleDeletePage}
                        disabled={pages.length <= 1}
                        style={{ background: 'none', border: 'none', color: 'var(--secondary)', opacity: pages.length <= 1 ? 0.3 : 1, cursor: 'pointer' }}
                        title="Delete Page"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add Tools */}
          <div style={{ padding: '16px', borderBottom: '2px solid #000' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '12px' }}>
              <Plus size={16} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Add Elements</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleAddPanel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: '#1a1c29',
                  border: '2px solid #000',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '2px 2px 0 #000'
                }}
              >
                <Square size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span>Add Custom Panel</span>
              </button>

              <button
                onClick={() => handleAddBubble('bubble', 'oval')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: '#1a1c29',
                  border: '2px solid #000',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '2px 2px 0 #000'
                }}
              >
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <span>Add Speech Bubble (Oval)</span>
              </button>

              <button
                onClick={() => handleAddBubble('bubble', 'rectangle')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: '#1a1c29',
                  border: '2px solid #000',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '2px 2px 0 #000'
                }}
              >
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <span>Add Speech Bubble (Rect)</span>
              </button>

              <button
                onClick={() => handleAddBubble('bubble', 'scream')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: '#1a1c29',
                  border: '2px solid #000',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '2px 2px 0 #000'
                }}
              >
                <Sparkles size={16} style={{ color: 'var(--secondary)' }} />
                <span>Add Scream Bubble!</span>
              </button>

              <button
                onClick={() => handleAddBubble('bubble', 'thought')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: '#1a1c29',
                  border: '2px solid #000',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '2px 2px 0 #000'
                }}
              >
                <Sparkles size={16} style={{ color: 'var(--accent-purple)' }} />
                <span>Add Thought Bubble</span>
              </button>

              <button
                onClick={() => handleAddBubble('caption')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: '#1a1c29',
                  border: '2px solid #000',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '2px 2px 0 #000'
                }}
              >
                <Type size={16} style={{ color: 'var(--primary)' }} />
                <span>Add Caption Box</span>
              </button>
            </div>
          </div>

          {/* Grid Layout presets */}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '12px' }}>
              <Layout size={16} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Page Templates</span>
            </div>

            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Warning: Applying a template replaces all current panels on this page.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { name: 'Blank', value: 'blank' },
                { name: 'Splash', value: 'splash' },
                { name: '2 Rows', value: 'rows2' },
                { name: '3 Rows', value: 'rows3' },
                { name: '2x2 Grid', value: 'grid4' },
                { name: '3x2 Grid', value: 'grid6' },
                { name: '3x3 Grid', value: 'grid9' },
                { name: 'Action Grid', value: 'dynamic' }
              ].map((tmpl) => (
                <button
                  key={tmpl.value}
                  onClick={() => handleApplyTemplate(tmpl.value)}
                  style={{
                    background: '#1a1c29',
                    border: '2px solid #000',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '1px 1px 0 #000',
                    textAlign: 'center',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                  }}
                  title={`Apply ${tmpl.name} Template`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MIDDLE AREA: Workspace Page Editor */}
        <main className="workspace-container halftone-bg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <span>Page Size: <strong>{PAGE_SIZES[pageSize].width}px</strong> x <strong>{PAGE_SIZES[pageSize].height}px</strong></span>
              <span>•</span>
              <span>Page <strong>{currentPageIndex + 1}</strong> of <strong>{pages.length}</strong></span>
            </div>

            {pages.length > 0 && (
              <div
                className="page-scale-wrapper"
                style={{
                  width: `${PAGE_SIZES[pageSize].width * zoom}px`,
                  height: `${PAGE_SIZES[pageSize].height * zoom}px`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  overflow: 'visible',
                  transition: 'width 0.15s, height 0.15s'
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center'
                  }}
                >
                  <PageCanvas
                    page={currentPage}
                    pageSizeConfig={PAGE_SIZES[pageSize]}
                    selectedItemId={selectedItemId}
                    selectedItemType={selectedItemType}
                    snapToGrid={snapToGrid}
                    gridVisible={gridVisible}
                    onSelectItem={handleSelectItem}
                    onUpdatePanel={handleUpdatePanel}
                    onUpdateBubble={handleUpdateBubble}
                    onUpdateImagePan={handleUpdateImagePan}
                  />
                </div>
              </div>
            )}
            
            <div className="no-print" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                style={{
                  background: '#24273c',
                  border: '2px solid #000',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  opacity: currentPageIndex === 0 ? 0.4 : 1,
                  cursor: 'pointer'
                }}
              >
                ◀ Prev Page
              </button>
              <button
                onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                disabled={currentPageIndex === pages.length - 1}
                style={{
                  background: '#24273c',
                  border: '2px solid #000',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  opacity: currentPageIndex === pages.length - 1 ? 0.4 : 1,
                  cursor: 'pointer'
                }}
              >
                Next Page ▶
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Properties / Inspector */}
        <aside className="editor-sidebar no-print" style={{ borderLeft: '2px solid #000', borderRight: 'none' }}>
          {/* Header Title */}
          <div style={{ padding: '16px', borderBottom: '2px solid #000', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <Settings size={16} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Inspector
              </span>
            </div>
          </div>

          {/* Panel Inspector */}
          {selectedPanel && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
              <div>
                <span className="logo-badge bangers-text" style={{ fontSize: '13px', transform: 'none' }}>PANEL PROPERTIES</span>
              </div>

              {/* Box Dimensions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Width (px)</label>
                  <input
                    type="number"
                    value={selectedPanel.width}
                    onChange={(e) => handleUpdatePanel(selectedItemId, { width: parseInt(e.target.value) || 20 })}
                    style={{ background: '#0d0f1a', border: '1px solid #000', color: '#fff', width: '100%', padding: '6px', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Height (px)</label>
                  <input
                    type="number"
                    value={selectedPanel.height}
                    onChange={(e) => handleUpdatePanel(selectedItemId, { height: parseInt(e.target.value) || 20 })}
                    style={{ background: '#0d0f1a', border: '1px solid #000', color: '#fff', width: '100%', padding: '6px', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>X Position</label>
                  <input
                    type="number"
                    value={selectedPanel.x}
                    onChange={(e) => handleUpdatePanel(selectedItemId, { x: parseInt(e.target.value) || 0 })}
                    style={{ background: '#0d0f1a', border: '1px solid #000', color: '#fff', width: '100%', padding: '6px', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Y Position</label>
                  <input
                    type="number"
                    value={selectedPanel.y}
                    onChange={(e) => handleUpdatePanel(selectedItemId, { y: parseInt(e.target.value) || 0 })}
                    style={{ background: '#0d0f1a', border: '1px solid #000', color: '#fff', width: '100%', padding: '6px', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Shape controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleResetPanelToRect(selectedItemId)}
                  style={{
                    width: '100%',
                    background: '#1a1c29',
                    border: '2px solid #000',
                    color: 'var(--primary)',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '1.5px 1.5px 0 #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                  title="Snap Panel Corners Back to Standard Bounding Box Rectangle"
                >
                  <span>Reset to Rectangle</span>
                </button>
              </div>

              {/* Background Color & Halftone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Background Fill</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={selectedPanel.backgroundColor || '#ffffff'}
                    onChange={(e) => handleUpdatePanel(selectedItemId, { backgroundColor: e.target.value })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', width: '32px', height: '32px' }}
                  />
                  <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{selectedPanel.backgroundColor || '#ffffff'}</span>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    checked={selectedPanel.halftone || false}
                    onChange={(e) => handleUpdatePanel(selectedItemId, { halftone: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Apply Retro Halftone Dots</span>
                </label>
              </div>

              {/* Borders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Border Width ({selectedPanel.borderWidth ?? 4}px)</label>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={selectedPanel.borderWidth ?? 4}
                  onChange={(e) => handleUpdatePanel(selectedItemId, { borderWidth: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />

                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Border Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={selectedPanel.borderColor || '#000000'}
                    onChange={(e) => handleUpdatePanel(selectedItemId, { borderColor: e.target.value })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', width: '32px', height: '32px' }}
                  />
                  <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{selectedPanel.borderColor || '#000000'}</span>
                </div>
              </div>

              {/* Image Upload Area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Panel Art / Illustration</label>
                
                {selectedPanel.image ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100px',
                        border: '1px solid #000',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        background: '#0a0b0f'
                      }}
                    >
                      <img
                        src={selectedPanel.image}
                        alt="Thumbnail"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    {/* Scale Slider */}
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Image Zoom ({(selectedPanel.imageScale || 1).toFixed(1)}x)</label>
                    <input
                      type="range"
                      min="0.1"
                      max="4"
                      step="0.05"
                      value={selectedPanel.imageScale || 1}
                      onChange={(e) => handleUpdatePanel(selectedItemId, { imageScale: parseFloat(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                    
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                      Tip: Hold Shift and drag on the panel to pan the image.
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleUpdatePanel(selectedItemId, { imagePanX: 0, imagePanY: 0 })}
                        style={{
                          flex: 1,
                          background: '#1a1c29',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Reset Position
                      </button>
                      <button
                        onClick={handleRemoveImage}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 63, 128, 0.15)',
                          border: '1px solid var(--secondary)',
                          color: 'var(--secondary)',
                          padding: '6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    style={{
                      border: '2px dashed rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      padding: '24px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      fontSize: '12px'
                    }}
                  >
                    <ImageIcon size={20} />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {/* Z-Ordering / Ordering */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Layer Depth Ordering</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <button
                    onClick={() => handleOrderElement('forward')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#1a1c29', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Bring Forward
                  </button>
                  <button
                    onClick={() => handleOrderElement('backward')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#1a1c29', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Send Backward
                  </button>
                  <button
                    onClick={() => handleOrderElement('front')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#1a1c29', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Bring to Front
                  </button>
                  <button
                    onClick={() => handleOrderElement('back')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#1a1c29', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Send to Back
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <button
                  onClick={handleDuplicateElement}
                  style={{
                    flex: 1,
                    background: '#24273c',
                    border: '2px solid #000',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '1px 1px 0 #000'
                  }}
                >
                  Duplicate
                </button>
                <button
                  onClick={handleDeleteElement}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 63, 128, 0.2)',
                    border: '2px solid #000',
                    color: 'var(--secondary)',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '1px 1px 0 #000'
                  }}
                >
                  Delete Panel
                </button>
              </div>
            </div>
          )}

          {/* Bubble Inspector */}
          {selectedBubble && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
              <div>
                <span className="logo-badge bangers-text" style={{ fontSize: '13px', transform: 'none', background: 'var(--secondary)' }}>
                  {selectedBubble.type === 'caption' ? 'CAPTION BOX' : 'SPEECH BUBBLE'}
                </span>
              </div>

              {/* Shape Styles (only for bubbles) */}
              {selectedBubble.type !== 'caption' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bubble Style</label>
                  <select
                    value={selectedBubble.bubbleStyle || 'oval'}
                    onChange={(e) => handleUpdateBubble(selectedItemId, { bubbleStyle: e.target.value })}
                    style={{
                      background: '#0d0f1a',
                      border: '2px solid #000',
                      color: '#fff',
                      padding: '8px',
                      borderRadius: '4px',
                      outline: 'none',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    <option value="oval">Speech Oval (Classic)</option>
                    <option value="rectangle">Speech Rectangle</option>
                    <option value="scream">Scream Bubble (Jagged)</option>
                    <option value="thought">Thought Bubble (Cloud)</option>
                  </select>
                </div>
              )}

              {/* Text Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Text Content (Double click on screen to edit)</label>
                <textarea
                  value={selectedBubble.text}
                  onChange={(e) => handleUpdateBubble(selectedItemId, { text: e.target.value })}
                  rows="3"
                  style={{
                    background: '#0d0f1a',
                    border: '1px solid #000',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: selectedBubble.fontFamily || 'monospace',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Font settings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Font Style</label>
                  <select
                    value={selectedBubble.fontFamily || 'var(--comic-font)'}
                    onChange={(e) => handleUpdateBubble(selectedItemId, { fontFamily: e.target.value })}
                    style={{ background: '#0d0f1a', border: '1px solid #000', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '12px' }}
                  >
                    <option value="var(--comic-font)">Comic Neue</option>
                    <option value="var(--comic-title)">Bangers</option>
                    <option value="var(--comic-caption)">Architects Daughter</option>
                    <option value="sans-serif">System Sans</option>
                  </select>
                </div>

                {/* Font Size */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>Font Size</span>
                    <span>{selectedBubble.fontSize || 16}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={selectedBubble.fontSize || 16}
                    onChange={(e) => handleUpdateBubble(selectedItemId, { fontSize: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Alignments and Font Decor */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Bold */}
                  <button
                    onClick={() => handleUpdateBubble(selectedItemId, { bold: !selectedBubble.bold })}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: selectedBubble.bold ? 'var(--primary)' : '#1a1c29',
                      border: '1px solid #000',
                      color: selectedBubble.bold ? '#000' : '#fff',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    B
                  </button>
                  {/* Italic */}
                  <button
                    onClick={() => handleUpdateBubble(selectedItemId, { italic: !selectedBubble.italic })}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: selectedBubble.italic ? 'var(--primary)' : '#1a1c29',
                      border: '1px solid #000',
                      color: selectedBubble.italic ? '#000' : '#fff',
                      fontStyle: 'italic',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    I
                  </button>
                  {/* Text Alignments */}
                  {['left', 'center', 'right'].map((alignOption) => (
                    <button
                      key={alignOption}
                      onClick={() => handleUpdateBubble(selectedItemId, { align: alignOption })}
                      style={{
                        flex: 1,
                        padding: '6px',
                        background: selectedBubble.align === alignOption ? 'var(--primary)' : '#1a1c29',
                        border: '1px solid #000',
                        color: selectedBubble.align === alignOption ? '#000' : '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        fontSize: '10px'
                      }}
                    >
                      {alignOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fills & Borders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Bubble Fill Color */}
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bubble Background Fill</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <input
                      type="color"
                      value={selectedBubble.backgroundColor || '#ffffff'}
                      onChange={(e) => handleUpdateBubble(selectedItemId, { backgroundColor: e.target.value })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', width: '32px', height: '32px' }}
                    />
                    <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{selectedBubble.backgroundColor || '#ffffff'}</span>
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Text Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <input
                      type="color"
                      value={selectedBubble.color || '#000000'}
                      onChange={(e) => handleUpdateBubble(selectedItemId, { color: e.target.value })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', width: '32px', height: '32px' }}
                    />
                    <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{selectedBubble.color || '#000000'}</span>
                  </div>
                </div>

                {/* Border parameters */}
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bubble Border Width ({selectedBubble.borderWidth ?? 2.5}px)</label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    value={selectedBubble.borderWidth ?? 2.5}
                    onChange={(e) => handleUpdateBubble(selectedItemId, { borderWidth: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bubble Border Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <input
                      type="color"
                      value={selectedBubble.borderColor || '#000000'}
                      onChange={(e) => handleUpdateBubble(selectedItemId, { borderColor: e.target.value })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', width: '32px', height: '32px' }}
                    />
                    <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{selectedBubble.borderColor || '#000000'}</span>
                  </div>
                </div>
              </div>

              {/* Z-Ordering / Ordering */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Layer Depth Ordering</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <button
                    onClick={() => handleOrderElement('forward')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#1a1c29', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Bring Forward
                  </button>
                  <button
                    onClick={() => handleOrderElement('backward')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#1a1c29', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Send Backward
                  </button>
                  <button
                    onClick={() => handleOrderElement('front')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#1a1c29', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Bring to Front
                  </button>
                  <button
                    onClick={() => handleOrderElement('back')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#1a1c29', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Send to Back
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <button
                  onClick={handleDuplicateElement}
                  style={{
                    flex: 1,
                    background: '#24273c',
                    border: '2px solid #000',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '1px 1px 0 #000'
                  }}
                >
                  Duplicate
                </button>
                <button
                  onClick={handleDeleteElement}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 63, 128, 0.2)',
                    border: '2px solid #000',
                    color: 'var(--secondary)',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '1px 1px 0 #000'
                  }}
                >
                  Delete Bubble
                </button>
              </div>
            </div>
          )}

          {/* Fallback instructions when nothing selected */}
          {!selectedPanel && !selectedBubble && (
            <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)' }}>
              <div>
                <span className="logo-badge bangers-text" style={{ fontSize: '13px', transform: 'none', background: '#24273c' }}>INSTRUCTIONS</span>
              </div>
              <ul style={{ paddingLeft: '16px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.4' }}>
                <li><strong>Select any item</strong> on the canvas to inspect and edit its properties.</li>
                <li><strong>Drag elements</strong> from their body to move them around.</li>
                <li><strong>Resize elements</strong> using the handles on their corners and edges.</li>
                <li><strong>Double click</strong> on speech bubbles/captions to edit text directly.</li>
                <li><strong>Drag the pink dot</strong> on speech bubbles to position the tail pointer.</li>
                <li><strong>Upload image</strong> to any panel by selecting the panel and clicking "Upload Image".</li>
                <li><strong>Hold Shift and Drag</strong> inside a panel with an image to pan the artwork.</li>
                <li><strong>Print or Export PDF</strong> using the button in the top right. Make sure background graphics are enabled in your print dialog!</li>
              </ul>
              
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Quick Document Info</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', fontSize: '11px' }}>
                  <span>Total Pages:</span>
                  <strong style={{ color: '#fff' }}>{pages.length}</strong>
                  <span>Grid Snapping:</span>
                  <strong style={{ color: snapToGrid ? 'var(--primary)' : 'var(--text-muted)' }}>{snapToGrid ? 'ON (10px)' : 'OFF'}</strong>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
