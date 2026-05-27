import { Download, Upload, Print, RestartAlt, ContentCopy, Image, CheckCircle, Payment as PaymentIcon, QrCode } from "@mui/icons-material";
import { 
  IconEyeSearch, 
  IconPencilMinus, 
  IconShare3, 
  IconCircleCheck, 
  IconCircleX, 
  IconLibraryPlus, 
  IconSend, 
  IconPhone, 
  IconTrashX 
} from "@tabler/icons-react";

export const iconMap = {
  view: { icon: <IconEyeSearch stroke={2} />, label: "View", color: "#1976d2" },
  edit: { icon: <IconPencilMinus stroke={2} />, label: "Edit", color: "#2e7d32" },
  delete: { icon: <IconTrashX stroke={2} />, label: "Delete", color: "#f40e0eff" },
  download: { icon: <Download />, label: "Download", color: "#2e7d32" },
  upload: { icon: <Upload />, label: "Upload", color: "#ed6c02" },
  print: { icon: <Print />, label: "Print", color: "#000000" },
  reset: { icon: <RestartAlt />, label: "Reset", color: "#ed6c02" },
  copy: { icon: <ContentCopy />, label: "Copy", color: "#2e7d32" },
  send: { icon: <IconSend stroke={2} />, label: "Send", color: "#1976d2" },
  approve: { icon: <IconCircleCheck stroke={2} />, label: "Approve", color: "#2e7d32" },
  reject: { icon: <IconCircleX stroke={2} />, label: "Reject", color: "#d32f2f" },
  share: { icon: <IconShare3 stroke={2} />, label: "Share", color: "#d32f2f" },
  plus: { icon: <IconLibraryPlus stroke={2} />, label: "Add", color: "#d32f2f" },
  phone: { icon: <IconPhone stroke={2} />, label: "Call", color: "#d32f2f" },
  image: { icon: <Image />, label: "Site Photos", color: "#6b7280" },
  complete: { icon: <CheckCircle />, label: "Complete", color: "#4caf50" },
  payment: { icon: <PaymentIcon />, label: "Payment", color: "#9c27b0" },
  qr: { icon: <QrCode />, label: "QR Code", color: "#ff9800" },
};