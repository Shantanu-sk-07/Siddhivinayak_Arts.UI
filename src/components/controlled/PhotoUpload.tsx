import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Paper,
  Fade,
  Tooltip,
  SxProps,
  Theme,
  alpha,
  Grow,
} from "@mui/material";
import {
  Delete,
  CloudUpload,
  CheckCircle,
  Image as ImageIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useFormContext } from "react-hook-form";
import { compressMultipleImages } from "@/utils/imageCompressor";
import {
  showSnackbar,
} from "@/components/uncontrolled/ToastMessage";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoUploadProps {
  name: string;
  maxFiles?: number;
  label?: string;
  placeholder?: string;
  defaultPhotos?: (string | File)[];
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  showCompressionInfo?: boolean;
  maxSizeMB?: number;
  targetSizeKB?: number;
  maxWidth?: number;
  maxHeight?: number;
}

type FormValues = Record<string, unknown>;

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  name,
  label,
  placeholder,
  maxFiles = 5,
  defaultPhotos = [],
  accept = "image/jpeg,image/png,image/jpg,image/webp",
  required = false,
  disabled = false,
  fullWidth = true,
  sx,
  showCompressionInfo = false,
  maxSizeMB = 10,
  targetSizeKB = 100,
  maxWidth,
  maxHeight,
}) => {
  const {
    setValue,
    watch,
    register,
    formState: { errors },
  } = useFormContext<FormValues>();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formPhotos = watch(name) as (File | string)[] | undefined;

  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [deletedPhotos, setDeletedPhotos] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const initialized = useRef(false);

  const errorMessage = errors[name]?.message as string;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const getSafePhotosArray = useCallback((): (File | string)[] => {
    if (!formPhotos) return [];
    if (Array.isArray(formPhotos)) return formPhotos;
    return [];
  }, [formPhotos]);

  const generatePreview = useCallback((photo: string | File): string => {
    if (photo instanceof File) {
      return URL.createObjectURL(photo);
    }
    return photo;
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    if (!defaultPhotos || defaultPhotos.length === 0) return;

    initialized.current = true;
    setValue(name, defaultPhotos, {
      shouldValidate: false,
      shouldDirty: false,
    });

    const urls = defaultPhotos
      .filter((photo) => photo)
      .map((photo) => generatePreview(photo))
      .filter((url) => url);

    setPreviews(urls);
  }, [defaultPhotos, name, setValue, generatePreview]);

  useEffect(() => {
    const photos = getSafePhotosArray();
    if (!photos || photos.length === 0) {
      setPreviews([]);
      return;
    }

    const urls = photos
      .filter((photo) => photo)
      .map((photo) => generatePreview(photo))
      .filter((url) => url);

    setPreviews(urls);

    return () => {
      urls.forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [getSafePhotosArray, generatePreview]);

 const validateImageDimensions = useCallback(
  (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml') {
        resolve({ valid: true });
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        if (maxWidth && img.width > maxWidth) {
          resolve({ 
            valid: false, 
            error: `Image width is ${img.width}px. Maximum allowed width is ${maxWidth}px` 
          });
        } else if (maxHeight && img.height > maxHeight) {
          resolve({ 
            valid: false, 
            error: `Image height is ${img.height}px. Maximum allowed height is ${maxHeight}px` 
          });
        } else {
          resolve({ valid: true });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ 
          valid: false, 
          error: `Could not read image dimensions. File may be corrupted or invalid format.` 
        });
      };
      
      img.src = objectUrl;
    });
  },
  [maxWidth, maxHeight]
);

 const validateFiles = useCallback(
  async (files: File[]): Promise<{ valid: File[]; errors: string[] }> => {
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name}: Max ${maxSizeMB}MB file allowed`);
      } else if (!accept.split(",").includes(file.type)) {
        errors.push(`${file.name}: Unsupported file format`);
      } else {
        const dimensionCheck = await validateImageDimensions(file);
        if (!dimensionCheck.valid && dimensionCheck.error) {
          errors.push(`${file.name}: ${dimensionCheck.error}`);
        } else {
          valid.push(file);
        }
      }
    }
    return { valid, errors };
  },
  [maxSizeBytes, maxSizeMB, accept, validateImageDimensions]
);

  const processFiles = useCallback(
  async (files: File[]): Promise<void> => {
    if (files.length === 0) return;
    
    for (const file of files) {
      const dimensionCheck = await validateImageDimensions(file);
      if (!dimensionCheck.valid) {
        showSnackbar("error", dimensionCheck.error || `Invalid dimensions for ${file.name}`);
        return;
      }
    }
    
    const currentFiles = getSafePhotosArray();
    const availableSlots = maxFiles - currentFiles.length;
    if (availableSlots <= 0) {
      showSnackbar("warning", `Maximum ${maxFiles} images only allowed`);
      return;
    }
    
    const filesToAdd = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      showSnackbar("warning", `Maximum ${maxFiles} images only allowed`);
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      setUploadProgress(30);
      const compressedFiles = await compressMultipleImages(filesToAdd, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.7,
        maxSizeKB: targetSizeKB,
      });
      setUploadProgress(80);
      const updatedFiles = [...currentFiles, ...compressedFiles];
      setValue(name, updatedFiles, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setUploadProgress(100);
      showSnackbar("success", `${compressedFiles.length} image(s) uploaded`);
    } catch (error) {
      console.error("Compression error:", error);
      showSnackbar("error", "Failed to compress images");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 300);
    }
  },
  [getSafePhotosArray, maxFiles, name, setValue, targetSizeKB, validateImageDimensions]
);

 const handleFileChange = useCallback(
  async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files;
    if (!files || disabled) return;
    const newFiles = Array.from(files);
    const { valid, errors } = await validateFiles(newFiles);
    
    if (errors.length > 0) {
      showSnackbar("error", errors[0]);
      event.target.value = "";
      return;
    }
    
    if (valid.length > 0) {
      await processFiles(valid);
    }
    
    event.target.value = "";
  },
  [disabled, validateFiles, processFiles]
);
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!disabled) setDragActive(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);
    },
    [],
  );

  const handleDrop = useCallback(
  async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (disabled) return;
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;
    const { valid, errors } = await validateFiles(files);
    if (errors.length > 0) {
      showSnackbar("error", errors[0]);
      return;
    }
    if (valid.length > 0) await processFiles(valid);
  },
  [disabled, validateFiles, processFiles]
);

  const handleRemovePhoto = useCallback(
  (index: number, e: React.MouseEvent): void => {
    e.stopPropagation();

    const currentFiles = getSafePhotosArray();
    const removed = currentFiles[index];

    if (typeof removed === "string") {
      setDeletedPhotos((prev) => [...prev, removed]);
    }

    const updatedFiles = currentFiles.filter((_, i) => i !== index);

    setValue(name, updatedFiles, {
      shouldValidate: true,
      shouldDirty: true,
    });

    let fileName = "Image";

    if (removed instanceof File) {
      fileName = removed.name;
    } else if (typeof removed === "string") {
      fileName =
        removed.split("/").pop()?.split("?")[0] || "Image";
    }

    showSnackbar("error", `${fileName} deleted`);
  },
  [getSafePhotosArray, name, setValue],
);

  const handleUploadClick = useCallback((): void => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  const handleEnlargeImage = useCallback(
    (src: string) => setEnlargedImage(src),
    [],
  );
  const handleCloseEnlarged = useCallback(() => setEnlargedImage(null), []);

  useEffect(() => {
    if (deletedPhotos.length === 0) return;
    setValue("deletedPhotos", deletedPhotos as unknown, { shouldDirty: true });
  }, [deletedPhotos, setValue]);

  register(name, {
    required: required
      ? `${label || placeholder || "Image"} is required`
      : false,
    validate: {
      maxFiles: (value) => {
        const arr = value as (File | string)[] | undefined;
        if (!arr) return true;
        return arr.length <= maxFiles || `Maximum ${maxFiles} images allowed`;
      },
    },
  });

  const currentFilesCount = getSafePhotosArray().length;
  const PREVIEW_SIZE = 28;

  return (
    <>
      <Box sx={{ width: fullWidth ? "100%" : "auto", ...sx }}>
        {label && (
          <Typography
            variant="caption"
            component="label"
            sx={{
              display: "block",
              fontWeight: 600,
              fontSize: "0.75rem",
              mb: 0.75,
              color: disabled ? "text.disabled" : "text.primary",
            }}
          >
            {label}
            {required && (
              <Typography
                component="span"
                sx={{ color: "error.main", ml: 0.3, fontSize: "0.75rem" }}
              >
                *
              </Typography>
            )}
          </Typography>
        )}

        <Paper
          variant="outlined"
          sx={{
            border: `1.5px solid ${dragActive ? "#1976d2" : errorMessage ? "#dc2626" : "#e2e8f0"}`,
            borderRadius: 2,
            bgcolor: dragActive
              ? alpha("#1976d2", 0.02)
              : disabled
                ? alpha("#000", 0.02)
                : "#fff",
            transition: "all 0.2s",
            overflow: "hidden",
          }}
        >
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            sx={{
              p: 1.5,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
              borderBottom: previews.length > 0 ? "1px solid #e2e8f0" : "none",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor:
                  !disabled && !dragActive ? alpha("#1976d2", 0.02) : undefined,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              {uploading ? (
                <>
                  <CircularProgress
                    size={16}
                    thickness={4}
                    sx={{ color: "#1976d2" }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    {uploadProgress}%
                  </Typography>
                </>
              ) : (
                <>
                  <CloudUpload
                    sx={{
                      fontSize: 18,
                      color: dragActive ? "#1976d2" : "#94a3b8",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: disabled ? "text.disabled" : "text.secondary",
                      fontWeight: 500,
                      fontSize: "0.7rem",
                    }}
                  >
                    {dragActive ? "Drop here" : placeholder || "Upload images"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#94a3b8", fontSize: "0.6rem" }}
                  >
                    ({currentFilesCount}/{maxFiles})
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {previews.length > 0 && (
            <Grow in={true}>
              <Box sx={{ p: 1.5, bgcolor: alpha("#f8fafc", 0.5) }}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <AnimatePresence>
                    {previews.map((img, index) => (
                      <motion.div
                        key={`${img}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Tooltip title="Click to enlarge" arrow>
                          <Box
                            sx={{
                              position: "relative",
                              width: PREVIEW_SIZE,
                              height: PREVIEW_SIZE,
                              borderRadius: 1,
                              overflow: "hidden",
                              border: "1px solid #e2e8f0",
                              cursor: "pointer",
                              bgcolor: "#fff",
                              "&:hover": {
                                transform: "scale(1.1)",
                                borderColor: "#1976d2",
                                boxShadow: 1,
                              },
                            }}
                            onClick={() => handleEnlargeImage(img)}
                          >
                            {img ? (
                              <Box
                                component="img"
                                src={img}
                                alt={`Preview ${index + 1}`}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <ImageIcon
                                  sx={{ fontSize: 14, color: "#cbd5e1" }}
                                />
                              </Box>
                            )}
                            {!disabled && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePhoto(index, e);
                                }}
                                sx={{
                                  position: "absolute",
                                  top: -6,
                                  right: -6,
                                  bgcolor: "white",
                                  width: 18,
                                  height: 18,
                                  p: 0,
                                  "&:hover": { bgcolor: "#fee2e2" },
                                  boxShadow: 1,
                                  zIndex: 2,
                                }}
                              >
                                <Delete
                                  sx={{ fontSize: 10, color: "#dc2626" }}
                                />
                              </IconButton>
                            )}
                          </Box>
                        </Tooltip>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {!disabled &&
                    currentFilesCount < maxFiles &&
                    currentFilesCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Box
                          onClick={handleUploadClick}
                          sx={{
                            width: PREVIEW_SIZE,
                            height: PREVIEW_SIZE,
                            borderRadius: 1,
                            border: "1px dashed #cbd5e1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            bgcolor: "#fafafa",
                            "&:hover": {
                              borderColor: "#1976d2",
                              bgcolor: alpha("#1976d2", 0.04),
                            },
                          }}
                        >
                          <CloudUpload
                            sx={{ fontSize: 12, color: "#94a3b8" }}
                          />
                        </Box>
                      </motion.div>
                    )}
                </Box>
                {showCompressionInfo && !uploading && previews.length > 0 && (
                  <Fade in={true}>
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 10, color: "#16a34a" }} />
                      <Typography
                        variant="caption"
                        sx={{ color: "#16a34a", fontSize: "0.6rem" }}
                      >
                        Optimized (&lt;{targetSizeKB}KB)
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Grow>
          )}
        </Paper>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          style={{ display: "none" }}
        />
        {errorMessage && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.5,
              ml: 1,
              color: "error.main",
              fontSize: "0.65rem",
            }}
          >
            {errorMessage}
          </Typography>
        )}
      </Box>

      <AnimatePresence>
        {enlargedImage && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0,0,0,0.92)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
            onClick={handleCloseEnlarged}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ position: "relative" }}
            >
              <Box
                component="img"
                src={enlargedImage}
                alt="Enlarged view"
                sx={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  objectFit: "contain",
                  borderRadius: 2,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                }}
              />
              <Tooltip title="Close" arrow>
                <IconButton
                  onClick={handleCloseEnlarged}
                  sx={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    bgcolor: "white",
                    width: 36,
                    height: 36,
                    "&:hover": { bgcolor: "#f1f5f9" },
                    boxShadow: 2,
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
};

export default PhotoUpload;