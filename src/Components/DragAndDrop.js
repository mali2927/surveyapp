import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import './Css/DragAndDrop.css';

// Item Types for Drag-and-Drop
const ItemTypes = {
  ITEM: 'item',
};

// Draggable Item Component
const DraggableItem = ({ item }) => {
  const [, ref] = useDrag({
    type: ItemTypes.ITEM,
    item: { id: item.id },
  });

  return (
    <div ref={ref} className="draggable-item">
      {item.content}
    </div>
  );
};

// Drop Zone Component
const DropZone = ({ onDrop, uploadedImage, canvasRef }) => {
  const ref = useRef(null);

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.ITEM,
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const dropzoneRect = ref.current.getBoundingClientRect();

      if (dropzoneRect) {
        const x = offset.x - dropzoneRect.left;
        const y = offset.y - dropzoneRect.top;
        onDrop(item.id, x, y);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        ref.current = node;
        drop(node);
      }}
      className="dropzone"
    >
      {uploadedImage && (
        <div className="image-container">
          <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            width={800}
            height={600}
          />
        </div>
      )}
      {isOver && <div className="overlay">Drop here!</div>}
    </div>
  );
};

// Dropped Item Component
const DroppedItem = ({ item, onDrop, onRemove, onResize }) => {
  const [, ref, preview] = useDrag({
    type: ItemTypes.ITEM,
    item: { id: item.id, x: item.x, y: item.y, width: item.width, height: item.height },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.ITEM,
    drop: (draggedItem, monitor) => {
      const offset = monitor.getClientOffset();
      const dropzoneRect = ref.current.getBoundingClientRect();
      const x = offset.x - dropzoneRect.left;
      const y = offset.y - dropzoneRect.top;
      onDrop(draggedItem.id, x, y);
    },
  });

  const handleResize = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();

    const initialWidth = item.width;
    const initialHeight = item.height;
    const initialX = e.clientX || e.touches[0].clientX;
    const initialY = e.clientY || e.touches[0].clientY;

    const onMove = (moveEvent) => {
      const clientX = moveEvent.clientX || moveEvent.touches[0].clientX;
      const clientY = moveEvent.clientY || moveEvent.touches[0].clientY;
      
      let newWidth = initialWidth;
      let newHeight = initialHeight;

      if (direction.includes('right')) {
        newWidth = Math.max(50, initialWidth + (clientX - initialX));
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(50, initialHeight + (clientY - initialY));
      }
      if (direction.includes('left')) {
        newWidth = Math.max(50, initialWidth - (clientX - initialX));
        item.x = item.x + (initialWidth - newWidth);
      }
      if (direction.includes('top')) {
        newHeight = Math.max(50, initialHeight - (clientY - initialY));
        item.y = item.y + (initialHeight - newHeight);
      }

      onResize(item.id, newWidth, newHeight);
    };

    const onEnd = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove, { passive: false });
      document.removeEventListener('touchend', onEnd);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  };

  return (
    <div
      ref={(node) => preview(drop(ref(node)))}
      className="dropped-item"
      style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
    >
      <div className="content">
        <img src={item.content.props.src} alt={item.content.props.alt} className="dropped-image" />
      </div>
      <button className="remove-button" onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}>
        &times;
      </button>
      <div className="resize-handle resize-handle-right" onMouseDown={(e) => handleResize(e, 'right')} onTouchStart={(e) => handleResize(e, 'right')} />
      <div className="resize-handle resize-handle-bottom" onMouseDown={(e) => handleResize(e, 'bottom')} onTouchStart={(e) => handleResize(e, 'bottom')} />
      <div className="resize-handle resize-handle-bottom-right" onMouseDown={(e) => handleResize(e, 'bottom-right')} onTouchStart={(e) => handleResize(e, 'bottom-right')} />
      <div className="resize-handle resize-handle-top" onMouseDown={(e) => handleResize(e, 'top')} onTouchStart={(e) => handleResize(e, 'top')} />
      <div className="resize-handle resize-handle-top-left" onMouseDown={(e) => handleResize(e, 'top-left')} onTouchStart={(e) => handleResize(e, 'top-left')} />
    </div>
  );
};

const DragAndDrop = () => {
  const [items] = useState([
    { id: '1', content: <img src="https://powerwalker.com/wp-content/uploads/2022/05/10120224_thumbnail.jpg" alt="Inverter" className="icon-image" /> },
    { id: '2', content: <img src="https://via.placeholder.com/50x50?text=Battery" alt="Battery" className="icon-image" /> },
  ]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [droppedItems, setDroppedItems] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let drawing = false;
    let startX = 0;
    let startY = 0;

    const startDrawing = (e) => {
      drawing = true;
      startX = e.clientX - canvas.offsetLeft;
      startY = e.clientY - canvas.offsetTop;
    };

    const draw = (e) => {
      if (!drawing) return;
      const x = e.clientX - canvas.offsetLeft;
      const y = e.clientY - canvas.offsetTop;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#ff0000'; // red color
      ctx.lineWidth = 2;
      ctx.stroke();
      
      startX = x;
      startY = y;
    };

    const stopDrawing = () => {
      drawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => setUploadedImage(e.target.result);
    if (file) reader.readAsDataURL(file);
  };

  const handleDrop = (id, x, y) => {
    setDroppedItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === id);
      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], x, y };
        return updatedItems;
      } else {
        const item = items.find((item) => item.id === id);
        return [
          ...prevItems,
          { ...item, id: `${item.id}-${Date.now()}`, x, y, width: 100, height: 100 },
        ];
      }
    });
  };

  const handleRemove = (id) => {
    setDroppedItems((prevItems) => prevItems.filter(item => item.id !== id));
  };

  const handleResize = (id, width, height) => {
    setDroppedItems((prevItems) => prevItems.map(item => item.id === id ? { ...item, width, height } : item));
  };

  // Determine if the device is touch-capable
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <DndProvider backend={isTouchDevice ? TouchBackend : HTML5Backend}>
      <div className="App">
        <div className="sidebar">
          <h3>Items</h3>
          {items.map((item) => (
            <DraggableItem key={item.id} item={item} />
          ))}
        </div>

        <div className="upload-area">
          <input type="file" onChange={handleImageUpload} />
          <DropZone onDrop={handleDrop} uploadedImage={uploadedImage} canvasRef={canvasRef} />
          {droppedItems.map((item) => (
            <DroppedItem key={item.id} item={item} onDrop={handleDrop} onRemove={handleRemove} onResize={handleResize} />
          ))}
        </div>

        {uploadedImage && (
          <button onClick={handleClearCanvas} className="clear-canvas-button">
            Clear Drawing
          </button>
        )}
      </div>
    </DndProvider>
  );
};

export default DragAndDrop;
