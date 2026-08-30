import type { CSSProperties } from 'react'
import type { SvgIconComponent } from '@mui/icons-material'
import Menu from '@mui/icons-material/Menu'
import Close from '@mui/icons-material/Close'
import DocumentScanner from '@mui/icons-material/DocumentScanner'
import CurrencyExchange from '@mui/icons-material/CurrencyExchange'
import WifiOff from '@mui/icons-material/WifiOff'
import ArrowDownward from '@mui/icons-material/ArrowDownward'
import Notifications from '@mui/icons-material/Notifications'
import ShoppingCart from '@mui/icons-material/ShoppingCart'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Mail from '@mui/icons-material/Mail'
import Error from '@mui/icons-material/Error'
import Lock from '@mui/icons-material/Lock'
import Payments from '@mui/icons-material/Payments'
import Logout from '@mui/icons-material/Logout'
import Refresh from '@mui/icons-material/Refresh'
import Visibility from '@mui/icons-material/Visibility'
import Cancel from '@mui/icons-material/Cancel'
import CheckCircle from '@mui/icons-material/CheckCircle'

const ICONS: Record<string, SvgIconComponent> = {
  menu: Menu,
  close: Close,
  document_scanner: DocumentScanner,
  currency_exchange: CurrencyExchange,
  wifi_off: WifiOff,
  arrow_downward: ArrowDownward,
  notifications: Notifications,
  shopping_cart: ShoppingCart,
  arrow_back: ArrowBack,
  arrow_forward: ArrowForward,
  mail: Mail,
  error: Error,
  lock: Lock,
  payments: Payments,
  logout: Logout,
  refresh: Refresh,
  visibility: Visibility,
  cancel: Cancel,
  check_circle: CheckCircle,
}

interface MaterialIconProps {
  name: string
  className?: string
  style?: CSSProperties
}

/**
 * Renders an inline SVG icon from the Material icon set, replacing the
 * Material Symbols webfont so the landing page no longer downloads the
 * ~1.1 MB icon font.
 */
export function MaterialIcon({ name, ...props }: MaterialIconProps) {
  const Icon = ICONS[name] ?? Menu
  return <Icon {...props} />
}
