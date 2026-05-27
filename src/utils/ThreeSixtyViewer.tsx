// src/view/DashboardPages/SuperAdmin/components/ThreeSixtyViewer.tsx
import { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Slider, Typography, Fade } from '@mui/material';
import { PlayArrow, Pause, RotateLeft, RotateRight, ZoomIn, ZoomOut } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface ThreeSixtyViewerProps {
  images: string[];
  autoRotate?: boolean;
}

export default function ThreeSixtyViewer({ images, autoRotate = false }: ThreeSixtyViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameDelay = 100;

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, frameDelay);
      return () => clearInterval(interval);
    }
  }, [isPlaying, images.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    const newIndex = Math.floor((currentIndex + delta / 5) % images.length);
    if (newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotateLeft = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleRotateRight = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setCurrentIndex(newValue as number);
    if (isPlaying) setIsPlaying(false);
  };

  if (!images.length) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="body1" color="textSecondary">
          No images available for 360° view
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <Box
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        sx={{
          position: 'relative',
          width: '100%',
          height: 500,
          overflow: 'hidden',
          borderRadius: 4,
          cursor: isDragging ? 'grabbing' : 'grab',
          bgcolor: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`360 view ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: zoom }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </AnimatePresence>
        
        <Fade in={!isDragging}>
          <Typography
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontSize: 12,
            }}
          >
            Drag to rotate
          </Typography>
        </Fade>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <IconButton onClick={() => setIsPlaying(!isPlaying)} sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <IconButton onClick={handleRotateLeft}>
          <RotateLeft />
        </IconButton>
        
        <Box sx={{ width: 300, px: 2 }}>
          <Slider
            value={currentIndex}
            min={0}
            max={images.length - 1}
            step={1}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value + 1}/${images.length}`}
          />
        </Box>
        
        <IconButton onClick={handleRotateRight}>
          <RotateRight />
        </IconButton>
        
        <IconButton onClick={handleZoomOut}>
          <ZoomOut />
        </IconButton>
        
        <IconButton onClick={handleZoomIn}>
          <ZoomIn />
        </IconButton>
      </Box>

      <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
        Frame {currentIndex + 1} of {images.length}
      </Typography>
    </Box>
  );
}