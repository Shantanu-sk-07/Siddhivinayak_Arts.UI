import {
  Box,
  Checkbox,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  Tooltip,
  TablePagination,
  TableRow,
  TextField,
  type TableCellProps,
  type SxProps,
  CircularProgress,
  Typography,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Chip,
  InputAdornment,
  Button,
  type ButtonProps,
} from "@mui/material";
import { useMemo, useState, type ReactNode, useEffect, useRef } from "react";
import { IconTrashX, IconSearch, IconFilterOff, IconPlus } from "@tabler/icons-react";
import { iconMap } from "@/helpers/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export const ACTION_KEY = "actionbutton" as const;
export const SR_NO_KEY = "sr_no" as const;

export type Column<T> = {
  key: keyof T | typeof ACTION_KEY;
  label: string;
  render?: (row: T, index?: number) => ReactNode;
  exportable?: boolean;
  minWidth?: number | string;
  width?: number | string;
};

export type DropdownOption = {
  value: string;
  label: string;
  bgColor?: string;
  textColor?: string;
};

export type FooterRow = {
  content: Array<{ value: ReactNode; colSpan?: number }>;
};

export type AddButtonConfig = {
  label?: string;
  onClick: () => void;
  color?: ButtonProps["color"];
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  sx?: SxProps;
};

interface TableStyles {
  captionSx?: SxProps;
  headerSx?: SxProps;
  rowHoverSx?: SxProps;
  paperSx?: SxProps;
}

interface UniversalTableProps<T extends Record<string, unknown>> extends TableStyles {
  data: readonly T[];
  columns: readonly Column<T>[];
  caption?: ReactNode;
  rowsPerPage?: number;
  tableSize?: "small" | "medium";
  textAlign?: TableCellProps["align"];
  showSearch?: boolean;
  addButton?: AddButtonConfig | false;
  enableCheckbox?: boolean;
  highlightColor?: string;
  loading?: boolean;
  getRowId?: (row: T, index: number) => string | number;
  onSelectionChange?: (rows: T[]) => void;
  onDeleteSelected?: (rows: T[]) => void;
  emptyStateMessage?: string;
  emptyStateIcon?: ReactNode;
  dropdown?: {
    key: keyof T;
    options: readonly DropdownOption[];
    onChange?: (row: T, value: T[keyof T]) => void;
    disabled?: boolean | ((row: T) => boolean);
    width?: number;
    sx?: SxProps;
  };
  autoUpdateDropdown?: boolean;
  onDataChange?: (rows: T[]) => void;
  actions?: Partial<Record<keyof typeof iconMap, (row: T) => void>>;
  renderActions?: (row: T) => ReactNode;
  footerRows?: readonly FooterRow[];
  stickyHeader?: boolean;
  maxHeight?: number | string;
  showSrNo?: boolean;
  srNoLabel?: string;
  rowClickable?: boolean;
  onRowClick?: (row: T) => void;
}

export function UniversalTable<T extends Record<string, unknown>>({
  data,
  columns,
  caption,
  rowsPerPage = 5,
  tableSize = "medium",
  textAlign = "left",
  showSearch = false,
  addButton = false,
  enableCheckbox = false,
  getRowId,
  onSelectionChange,
  onDeleteSelected,
  dropdown,
  autoUpdateDropdown,
  onDataChange,
  actions,
  renderActions,
  footerRows = [],
  captionSx,
  headerSx,
  paperSx,
  highlightColor = "#ffeb3b",
  loading = false,
  emptyStateMessage,
  emptyStateIcon,
  stickyHeader = false,
  maxHeight = "auto",
  showSrNo = true,
  srNoLabel,
  rowClickable = false,
  onRowClick,
}: UniversalTableProps<T>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  const defaultEmptyMessage = emptyStateMessage || t('table.no_data');
  const defaultSrNoLabel = srNoLabel || t('table.sr_no');
  const defaultAddButtonLabel = t('table.add_new');

  useEffect(() => {
    setPage(0);
  }, [search]);

  const resolveRowId = (row: T, index: number): string | number =>
    getRowId ? getRowId(row, index) : index;

  const highlightText = (
    text: string | number | null | undefined,
  ): ReactNode => {
    if (!search || text == null) return text;

    const textString = text.toString();
    const regex = new RegExp(
      `(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = textString.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          style={{
            background: highlightColor,
            color: theme.palette.mode === "dark" ? "#000" : "#1a1a1a",
            padding: "2px 4px",
            borderRadius: "4px",
            fontWeight: 600,
          }}
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const DEFAULT_DROPDOWN_SX: SxProps = {
    width: 150,
    bgcolor: alpha(theme.palette.background.paper, 0.9),
    color: theme.palette.text.primary,
    fontWeight: 600,
    fontSize: 13,
    borderRadius: 2,
    "& .MuiSelect-icon": { color: theme.palette.text.secondary },
    "&:hover": {
      bgcolor: alpha(theme.palette.primary.main, 0.08),
    },
  };

  const filteredData = useMemo(() => {
    if (!search) return data;

    return data.filter((row) =>
      columns.some((col) => {
        if (col.key === ACTION_KEY) return false;
        const value = row[col.key];
        return String(value ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());
      }),
    );
  }, [data, columns, search]);

  const paginatedData = useMemo(
    () =>
      filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredData, page, rowsPerPage],
  );

  const selectedRows = data.filter((_, i) =>
    selectedIds.has(resolveRowId(_, i)),
  );

  const toggleRow = (row: T, index: number) => {
    const id = resolveRowId(row, index);
    const updated = new Set(selectedIds);

    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }

    setSelectedIds(updated);
    onSelectionChange?.(data.filter((r, i) => updated.has(resolveRowId(r, i))));
  };

  const toggleAll = (checked: boolean) => {
    const updated = new Set<string | number>();
    if (checked) data.forEach((r, i) => updated.add(resolveRowId(r, i)));
    setSelectedIds(updated);
    onSelectionChange?.(checked ? [...data] : []);
  };

  const updateRow = (row: T, patch: Partial<T>) => {
    if (!onDataChange) return;
    const targetId = resolveRowId(row, -1);
    onDataChange(
      data.map((r, i) =>
        resolveRowId(r, i) === targetId ? { ...r, ...patch } : r,
      ),
    );
  };

  const getGlobalIndex = (pageIndex: number): number => {
    return page * rowsPerPage + pageIndex + 1;
  };

  const allColumns = useMemo(() => {
    const cols = [...columns];
    if (showSrNo) {
      return [
        {
          key: SR_NO_KEY,
          label: defaultSrNoLabel,
          width: 80,
          minWidth: 80,
        } as Column<T>,
        ...cols,
      ];
    }
    return cols;
  }, [columns, showSrNo, defaultSrNoLabel]);

  const handleRowClick = (row: T) => {
    if (rowClickable && onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          ...paperSx,
        }}
      >
        {(showSearch || addButton) && (
          <Box
            sx={{
              px: { xs: 1.5, sm: 3 },
              py: 2,
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: alpha(theme.palette.background.default, 0.5),
            }}
          >
            {showSearch && (
              <TextField
                inputRef={searchInputRef}
                variant="outlined"
                placeholder={t('table.search')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 280 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {addButton && (
              <Zoom in={true} timeout={500}>
                <Button
                  variant={addButton.variant || "contained"}
                  color={addButton.color || "primary"}
                  size={addButton.size || "medium"}
                  onClick={addButton.onClick}
                  disabled={addButton.disabled || false}
                  startIcon={addButton.startIcon || <IconPlus size={20} />}
                  endIcon={addButton.endIcon}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    "&:hover": {
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                    ...addButton.sx,
                  }}
                >
                  {addButton.label || defaultAddButtonLabel}
                </Button>
              </Zoom>
            )}
          </Box>
        )}

        {caption && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: "#fff",
                fontWeight: 700,
                fontSize: { xs: 16, sm: 18 },
                borderRadius: "0px",
                textAlign: "center",
                py: 1.5,
                px: 2,
                ...captionSx,
              }}
            >
              {caption}
            </Box>
          </motion.div>
        )}

        <TableContainer
          sx={{
            maxHeight: maxHeight,
            overflowX: "auto",
            overflowY: "auto",
            position: "relative",
            "&::-webkit-scrollbar": {
              height: 8,
              width: 8,
            },
            "&::-webkit-scrollbar-track": {
              background: alpha(theme.palette.common.black, 0.05),
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(theme.palette.primary.main, 0.3),
              borderRadius: 4,
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.5),
              },
            },
          }}
        >
          <Table
            size={tableSize}
            stickyHeader={stickyHeader}
            sx={{
              minWidth: { xs: 700, sm: 850, md: 950, lg: "100%" },
              borderCollapse: "separate",
              borderSpacing: "0",
              tableLayout: "auto",
            }}
          >
            <TableHead>
              <TableRow>
                {enableCheckbox && (
                  <TableCell
                    padding="checkbox"
                    sx={{
                      bgcolor: theme.palette.background.paper,
                      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      position: stickyHeader ? "sticky" : "relative",
                      top: 0,
                      left: 0,
                      zIndex: 3,
                      width: 48,
                      minWidth: 48,
                    }}
                  >
                    <Checkbox
                      indeterminate={
                        selectedIds.size > 0 && selectedIds.size < data.length
                      }
                      checked={
                        data.length > 0 && selectedIds.size === data.length
                      }
                      onChange={(e) => toggleAll(e.target.checked)}
                      sx={{
                        color: theme.palette.text.secondary,
                        "&.Mui-checked": {
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  </TableCell>
                )}

                {allColumns.map((col, idx) => (
                  <TableCell
                    key={String(col.key)}
                    align={col.key === SR_NO_KEY ? "center" : textAlign}
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: 12, sm: 14 },
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      whiteSpace: "nowrap",
                      width: col.width || (col.key === SR_NO_KEY ? 80 : "auto"),
                      minWidth:
                        col.minWidth || (col.key === SR_NO_KEY ? 80 : 120),
                      maxWidth: col.key === SR_NO_KEY ? 80 : "none",
                      position: stickyHeader ? "sticky" : "relative",
                      top: 0,
                      zIndex: 2,
                      ...headerSx,
                    }}
                  >
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {col.label}
                    </motion.span>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.tr
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <TableCell
                      colSpan={allColumns.length + (enableCheckbox ? 1 : 0)}
                      align="center"
                      sx={{ py: 12 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 2,
                        }}
                      >
                        <CircularProgress
                          size={48}
                          sx={{ color: theme.palette.primary.main }}
                        />
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          {t('table.loading_records')}
                        </Typography>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ) : paginatedData.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <TableCell
                      colSpan={allColumns.length + (enableCheckbox ? 1 : 0)}
                      align="center"
                      sx={{ py: 12 }}
                    >
                      <Fade in={true} timeout={800}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                          }}
                        >
                          {emptyStateIcon || (
                            <IconFilterOff
                              size={64}
                              style={{
                                color: theme.palette.text.secondary,
                                opacity: 0.5,
                              }}
                            />
                          )}
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            {defaultEmptyMessage}
                          </Typography>
                          {search && (
                            <Chip
                              label={t('table.no_results', { search })}
                              onDelete={() => {
                                setSearch("");
                                searchInputRef.current?.focus();
                              }}
                              sx={{
                                mt: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                              }}
                            />
                          )}
                        </Box>
                      </Fade>
                    </TableCell>
                  </motion.tr>
                ) : (
                  paginatedData.map((row, index) => {
                    const rowId = resolveRowId(row, index);
                    const isSelected = selectedIds.has(rowId);
                    const globalSrNo = getGlobalIndex(index);

                    return (
                      <motion.tr
                        key={rowId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        style={{
                          backgroundColor: isSelected
                            ? alpha(theme.palette.primary.main, 0.08)
                            : "transparent",
                          transition: "all 0.3s ease",
                          cursor: rowClickable ? "pointer" : "default",
                        }}
                        onClick={() => handleRowClick(row)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = alpha(
                            theme.palette.grey[200],
                            0.6,
                          );
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isSelected
                            ? alpha(theme.palette.primary.main, 0.08)
                            : "transparent";
                        }}
                      >
                        {enableCheckbox && (
                          <TableCell 
                            padding="checkbox" 
                            sx={{ width: 48, minWidth: 48 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={() => toggleRow(row, index)}
                              sx={{
                                color: theme.palette.text.secondary,
                                "&.Mui-checked": {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            />
                          </TableCell>
                        )}

                        {allColumns.map((col) => {
                          if (col.key === SR_NO_KEY) {
                            return (
                              <TableCell
                                key={String(col.key)}
                                align="center"
                                sx={{
                                  py: 1.5,
                                  fontWeight: 600,
                                  fontSize: { xs: 12, sm: 14 },
                                  color: theme.palette.text.primary,
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.02,
                                  ),
                                  whiteSpace: "nowrap",
                                  width: 80,
                                  minWidth: 80,
                                  maxWidth: 80,
                                }}
                              >
                                {globalSrNo}
                              </TableCell>
                            );
                          }

                          if (
                            dropdown &&
                            col.key === dropdown.key &&
                            col.key !== ACTION_KEY
                          ) {
                            const isDisabled =
                              typeof dropdown.disabled === "function"
                                ? dropdown.disabled(row)
                                : dropdown.disabled || false;

                            return (
                              <TableCell
                                key={String(col.key)}
                                align={textAlign}
                                sx={{
                                  py: 1.5,
                                  whiteSpace: "nowrap",
                                  minWidth: 150,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Select
                                  size="small"
                                  value={row[col.key] as string}
                                  disabled={isDisabled}
                                  sx={{
                                    ...DEFAULT_DROPDOWN_SX,
                                    width: dropdown.width ?? 160,
                                    ...dropdown.sx,
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value as T[keyof T];
                                    dropdown.onChange?.(row, value);
                                    if (
                                      !dropdown.onChange &&
                                      autoUpdateDropdown
                                    ) {
                                      updateRow(row, {
                                        [dropdown.key]: value,
                                      } as Partial<T>);
                                    }
                                  }}
                                >
                                  {dropdown.options.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                      sx={{
                                        bgcolor:
                                          option.bgColor || "transparent",
                                        color: option.textColor || "inherit",
                                      }}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </TableCell>
                            );
                          }

                          if (col.key === ACTION_KEY) {
                            return (
                              <TableCell
                                key={ACTION_KEY}
                                align="center"
                                sx={{ whiteSpace: "nowrap", py: 1, minWidth: 100 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Box
                                  display="flex"
                                  gap={0.5}
                                  justifyContent="center"
                                >
                                  {Object.entries(iconMap).map(([k, cfg]) =>
                                    actions?.[k as keyof typeof iconMap] ? (
                                      <Tooltip
                                        key={k}
                                        title={cfg.label}
                                        arrow
                                        placement="top"
                                      >
                                        <motion.div
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              actions[
                                                k as keyof typeof iconMap
                                              ]?.(row)
                                            }
                                            sx={{
                                              color: cfg.color,
                                              transition: "all 0.2s ease",
                                              "&:hover": {
                                                bgcolor: alpha(cfg.color, 0.1),
                                              },
                                            }}
                                          >
                                            {cfg.icon}
                                          </IconButton>
                                        </motion.div>
                                      </Tooltip>
                                    ) : null,
                                  )}
                                  {renderActions && renderActions(row)}
                                </Box>
                              </TableCell>
                            );
                          }

                          return (
                            <TableCell
                              key={String(col.key)}
                              align={textAlign}
                              sx={{
                                py: 1.5,
                                fontSize: { xs: 12, sm: 14 },
                                whiteSpace: "nowrap",
                                minWidth: 120,
                                transition: "all 0.2s ease",
                              }}
                            >
                              {col.render
                                ? col.render(row, index)
                                : highlightText(String(row[col.key] ?? ""))}
                            </TableCell>
                          );
                        })}
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </TableBody>

            {footerRows.length > 0 && (
              <TableFooter>
                {footerRows.map((footerRow, idx) => (
                  <TableRow key={idx}>
                    {footerRow.content.map((cell, cellIdx) => (
                      <TableCell
                        key={cellIdx}
                        colSpan={cell.colSpan}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          fontWeight: 600,
                          borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        }}
                      >
                        {cell.value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableFooter>
            )}
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: "flex",
            justifyContent:
              enableCheckbox && selectedRows.length > 0
                ? "space-between"
                : "flex-end",
            alignItems: "center",
            px: { xs: 1, sm: 2 },
            py: 1,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: alpha(theme.palette.background.default, 0.3),
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {enableCheckbox && selectedRows.length > 0 && onDeleteSelected && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Tooltip
                title={
                  selectedRows.length === data.length
                    ? t('table.delete_all')
                    : t('table.delete_n_records', { count: selectedRows.length })
                }
                arrow
              >
                <IconButton
                  color="error"
                  onClick={() => {
                    onDeleteSelected(selectedRows);
                    setSelectedIds(new Set());
                  }}
                  sx={{
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  <IconTrashX size={20} />
                </IconButton>
              </Tooltip>
            </motion.div>
          )}

          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            sx={{
              border: "none",
              "& .MuiTablePagination-displayedRows": {
                fontSize: { xs: 11, sm: 13 },
              },
              "& .MuiIconButton-root": {
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              },
            }}
          />
        </Box>
      </Paper>
    </motion.div>
  );
}