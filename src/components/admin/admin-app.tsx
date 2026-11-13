"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Star,
  Ticket,
  FileText,
  Settings,
  Shield,
  LogOut,
  Search,
  Menu,
  X,
  Plus,
  Minus,
  Check,
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  UserCircle,
  AlertTriangle,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useStore, type AdminView } from "@/lib/store";
import { useIsClient } from "@/hooks/use-is-client";
import { formatINR, formatDate, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ----------------------------------------------------------------------------
// Types (admin-specific response shapes)
// ----------------------------------------------------------------------------
type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerImage: string | null;
  productCount: number;
};

type Variant = {
  id?: string;
  color: string;
  colorHex: string | null;
  size: string | null;
  sku: string;
  stockQty: number;
  priceOverride: number | null;
};

// Form-friendly variant (strings instead of nullables for controlled inputs)
type FormVariant = {
  color: string;
  colorHex: string;
  size: string;
  sku: string;
  stockQty: number;
};

type AdminProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string | null;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  basePrice: number;
  mrp: number;
  discountPct: number;
  fabricType: string | null;
  weaveOrigin: string | null;
  weaveDays: number | null;
  zariType: string | null;
  blouseIncluded: boolean;
  blouseLengthM: number;
  careInstructions: string | null;
  tags: string[];
  images: string[];
  isBestseller: boolean;
  isNew: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  variants: Variant[];
  reviewCountActual: number;
  totalStock: number;
  status: string;
};

type OrderItem = {
  title: string;
  variant?: string;
  qty: number;
  price: number;
  image?: string;
};

type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
} & Record<string, unknown>;

type Courier = {
  name?: string;
  awb?: string;
  trackingUrl?: string;
} & Record<string, unknown>;

type TimelineEntry = {
  status: string;
  timestamp: string;
  note?: string;
};

type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  codSurcharge: number;
  tax: number;
  grandTotal: number;
  couponCode: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress: Address;
  courier: Courier;
  timeline: TimelineEntry[];
};

type AdminReview = {
  id: string;
  authorName: string;
  authorCity: string | null;
  rating: number;
  title: string;
  body: string;
  status: string;
  verified: boolean;
  helpfulCount: number;
  featured: boolean;
  createdAt: string;
  productId: string;
  product: { title: string; slug: string };
};

type AdminCoupon = {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  minCartValue: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
};

type AdminCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  totalOrders: number;
  totalSpent: number;
  segment: string;
  createdAt: string;
};

type AdminTestimonial = {
  id: string;
  name: string;
  city: string | null;
  quote: string;
  rating: number;
  featured: boolean;
  createdAt: string;
};

type AdminFaq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
};

type DashboardSummary = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingReviews: number;
  lowStockCount: number;
  avgOrderValue: number;
};

type DashboardData = {
  summary: DashboardSummary;
  revenueChart: { label: string; revenue: number; orders: number }[];
  statusBreakdown: { status: string; _count: number }[];
  paymentBreakdown: { paymentMethod: string; _count: number }[];
  categoryStats: { name: string; count: number }[];
  recentOrders: AdminOrder[];
  topProducts: {
    id: string;
    title: string;
    slug: string;
    price: number;
    rating: number;
    reviewCount: number;
    images: string[];
  }[];
};

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
const NAV_ITEMS: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "content", label: "Content", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

const VIEW_TITLES: Record<AdminView, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Store performance overview" },
  products: { title: "Products", subtitle: "Manage your saree catalog" },
  inventory: { title: "Inventory", subtitle: "Track and manage stock levels" },
  orders: { title: "Orders", subtitle: "Track and fulfil customer orders" },
  customers: { title: "Customers", subtitle: "Customer insights and segments" },
  reviews: { title: "Reviews", subtitle: "Moderate product reviews" },
  coupons: { title: "Coupons", subtitle: "Discount codes and promotions" },
  content: { title: "Content", subtitle: "FAQs and testimonials" },
  settings: { title: "Settings", subtitle: "Store configuration" },
};

function formatUptimeShort(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function orderStatusClasses(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "confirmed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "packed":
      return "bg-violet-100 text-violet-800 border-violet-200";
    case "shipped":
      return "bg-navy/10 text-navy border-navy/30";
    case "out_for_delivery":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "delivered":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    case "returned":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "refunded":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

function paymentStatusClasses(status: string): string {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "failed":
      return "bg-red-100 text-red-700 border-red-200";
    case "refunded":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

function productStatusClasses(status: string): string {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "draft":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "archived":
      return "bg-secondary text-muted-foreground border-border";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

function reviewStatusClasses(status: string): string {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

function segmentClasses(segment: string): string {
  switch (segment) {
    case "vip":
      return "bg-gold/15 text-gold-dark border-gold/40";
    case "bridal_lead":
      return "bg-navy/10 text-navy border-navy/30";
    case "wholesale":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "regular":
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

function prettify(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusBadge({ status, kind = "order" }: { status: string; kind?: "order" | "payment" | "product" | "review" }) {
  const cls =
    kind === "payment"
      ? paymentStatusClasses(status)
      : kind === "product"
      ? productStatusClasses(status)
      : kind === "review"
      ? reviewStatusClasses(status)
      : orderStatusClasses(status);
  return (
    <Badge variant="outline" className={cn("capitalize font-medium", cls)}>
      {prettify(status)}
    </Badge>
  );
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= Math.round(rating) ? "fill-gold text-gold" : "fill-none text-muted-foreground/40"}
        />
      ))}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// ----------------------------------------------------------------------------
// Shell: Sidebar
// ----------------------------------------------------------------------------
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const adminView = useStore((s) => s.adminView);
  const setAdminView = useStore((s) => s.setAdminView);
  const setMode = useStore((s) => s.setMode);
  const pendingReviews = useStore((s) => s.mode === "admin" ? 0 : 0);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/5 ring-1 ring-gold/40">
          <span className="font-display text-lg font-bold text-gold-gradient">N</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-display text-sm font-semibold tracking-wider text-ivory">ROYAL HERITAGE</span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-gold/80">Store Administration</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-elegant px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = adminView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setAdminView(item.id);
                onNavigate?.();
              }}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-gold-gradient text-navy shadow-gold"
                  : "text-ivory/70 hover:bg-white/5 hover:text-ivory"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-navy" : "text-ivory/60 group-hover:text-gold")} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === "reviews" && active && (
                <span className="rounded-full bg-navy/20 px-1.5 py-0.5 text-[10px] font-bold text-navy">
                  {!pendingReviews ? "" : pendingReviews}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <Separator className="bg-white/10" />

      {/* Exit */}
      <div className="p-3">
        <button
          onClick={() => {
            setMode("store");
            onNavigate?.();
          }}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-ivory/70 transition-colors hover:bg-white/5 hover:text-ivory"
        >
          <LogOut className="h-4 w-4" />
          Exit to Store
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Shell: Topbar
// ----------------------------------------------------------------------------
function Topbar({ onMenu }: { onMenu: () => void }) {
  const adminView = useStore((s) => s.adminView);
  const { title, subtitle } = VIEW_TITLES[adminView];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-ivory/95 px-4 backdrop-blur md:px-6">
      <button
        onClick={onMenu}
        className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-col leading-tight">
        <h1 className="font-serif text-lg font-semibold text-navy md:text-xl">{title}</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">{subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-9 w-56 pl-8 lg:w-72 bg-card"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 hover:bg-muted">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-navy-gradient text-xs font-semibold text-gold-gradient">
                  NT
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium text-foreground sm:block pr-1">Admin</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Signed in as</DropdownMenuLabel>
            <DropdownMenuItem className="font-medium">Nandhini Tex</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => useStore.getState().setAdminView("settings")}>
              <Settings className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => useStore.getState().setMode("store")}>
              <LogOut className="h-4 w-4" /> Exit to Store
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// ----------------------------------------------------------------------------
// Main AdminApp
// ----------------------------------------------------------------------------
export function AdminApp() {
  const mode = useStore((s) => s.mode);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isClient = useIsClient();

  if (!isClient || mode !== "admin") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex bg-ivory"
    >
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 bg-navy-gradient lg:block">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-none p-0 bg-navy-gradient">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="scrollbar-elegant flex-1 overflow-y-auto p-4 md:p-6">
          <AdminViewRouter />
        </main>
      </div>
    </motion.div>
  );
}

function AdminViewRouter() {
  const adminView = useStore((s) => s.adminView);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={adminView}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
      >
        {adminView === "dashboard" && <DashboardView />}
        {adminView === "products" && <ProductsView />}
        {adminView === "inventory" && <InventoryView />}
        {adminView === "orders" && <OrdersView />}
        {adminView === "customers" && <CustomersView />}
        {adminView === "reviews" && <ReviewsView />}
        {adminView === "coupons" && <CouponsView />}
        {adminView === "content" && <ContentView />}
        {adminView === "settings" && <SettingsView />}
      </motion.div>
    </AnimatePresence>
  );
}

// ----------------------------------------------------------------------------
// View: Dashboard
// ----------------------------------------------------------------------------
function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<{ status: string; uptime: number; responseMs: number; services: Record<string, { status: string; latencyMs?: number }> } | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      setLoading(true);
      fetch("/api/dashboard")
        .then((r) => r.json())
        .then((d) => {
          if (alive) {
            setData(d);
            setLoading(false);
          }
        })
        .catch(() => {
          if (alive) setLoading(false);
        });
      // Also fetch system health
      fetch("/api/health")
        .then((r) => r.json())
        .then((h) => { if (alive) setHealth(h); })
        .catch(() => {});
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  if (loading || !data) return <DashboardSkeleton />;

  const { summary } = data;
  const stats = [
    { label: "Total Revenue", value: formatINR(summary.totalRevenue), icon: IndianRupee, tone: "navy" as const },
    { label: "Total Orders", value: String(summary.totalOrders), icon: ShoppingBag, tone: "gold" as const },
    { label: "Customers", value: String(summary.totalCustomers), icon: Users, tone: "navy" as const },
    { label: "Avg Order Value", value: formatINR(summary.avgOrderValue), icon: TrendingUp, tone: "gold" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="gap-0 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className="mt-2 font-serif text-2xl font-bold text-navy">{s.value}</p>
              </div>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  s.tone === "navy" ? "bg-navy-gradient" : "bg-gold-gradient"
                )}
              >
                <s.icon className={cn("h-5 w-5", s.tone === "navy" ? "text-gold" : "text-navy")} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AlertCard
          icon={AlertTriangle}
          tone="amber"
          label="Low Stock Variants"
          value={summary.lowStockCount}
          hint="Variants with under 5 units"
        />
        <AlertCard
          icon={Star}
          tone="gold"
          label="Pending Reviews"
          value={summary.pendingReviews}
          hint="Awaiting moderation"
        />
        <AlertCard
          icon={PackageCheck}
          tone="navy"
          label="Total Products"
          value={summary.totalProducts}
          hint="Across all categories"
        />
      </div>

      {/* System Health Widget */}
      {health && (
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                health.status === "healthy" ? "bg-emerald-100" : health.status === "degraded" ? "bg-amber-100" : "bg-red-100"
              )}>
                <Activity className={cn(
                  "h-5 w-5",
                  health.status === "healthy" ? "text-emerald-600" : health.status === "degraded" ? "text-amber-600" : "text-red-600"
                )} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">System Health</p>
                <p className="font-serif text-lg font-bold capitalize text-navy">
                  {health.status}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    · DB {health.services?.database?.status} {health.services?.database?.latencyMs !== undefined ? `(${health.services.database.latencyMs}ms)` : ""}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Uptime</p>
                <p className="text-sm font-semibold text-navy">{formatUptimeShort(health.uptime)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Response</p>
                <p className="text-sm font-semibold text-navy">{health.responseMs}ms</p>
              </div>
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted"
              >
                API Docs
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 gap-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-navy">Revenue — Last 7 days</CardTitle>
            <CardDescription>Daily revenue and order volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A227" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#C9A227" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD5" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#8B7E74" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#8B7E74" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                  />
                  <RTooltip
                    contentStyle={{
                      background: "#0A1F44",
                      border: "1px solid rgba(201,162,39,0.4)",
                      borderRadius: 8,
                      color: "#FBF7F1",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#C9A227" }}
                    formatter={(value: number, name: string) =>
                      name === "revenue" ? [formatINR(value), "Revenue"] : [String(value), "Orders"]
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C9A227"
                    strokeWidth={2.5}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-navy">Order Status</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {data.statusBreakdown.length === 0 && (
                <li className="text-sm text-muted-foreground">No orders yet.</li>
              )}
              {data.statusBreakdown.map((s) => (
                <li key={s.status} className="flex items-center justify-between">
                  <StatusBadge status={s.status} kind="order" />
                  <span className="font-mono text-sm font-semibold text-navy">{s._count}</span>
                </li>
              ))}
            </ul>

            <Separator className="my-4" />

            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment Methods</p>
            <ul className="space-y-2">
              {data.paymentBreakdown.map((p) => (
                <li key={p.paymentMethod} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-foreground">{prettify(p.paymentMethod)}</span>
                  <span className="font-mono font-semibold text-navy">{p._count}</span>
                </li>
              ))}
              {data.paymentBreakdown.length === 0 && (
                <li className="text-sm text-muted-foreground">No payments yet.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders + Top products */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3 gap-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-navy">Recent Orders</CardTitle>
            <CardDescription>Latest 6 customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                )}
                {data.recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs font-medium text-navy">{o.orderNumber}</TableCell>
                    <TableCell className="font-medium">{o.customerName}</TableCell>
                    <TableCell className="font-semibold text-navy">{formatINR(o.grandTotal)}</TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{relativeTime(o.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 gap-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-navy">Top Products</CardTitle>
            <CardDescription>Bestsellers by rating</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.topProducts.length === 0 && (
                <li className="py-4 text-center text-sm text-muted-foreground">No products yet.</li>
              )}
              {data.topProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <StarRating rating={p.rating} size={11} />
                      <span className="text-xs text-muted-foreground">({p.reviewCount})</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-navy">{formatINR(p.price)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AlertCard({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: typeof Star;
  tone: "amber" | "gold" | "navy";
  label: string;
  value: number;
  hint: string;
}) {
  const toneCls =
    tone === "amber"
      ? "bg-amber-100 text-amber-700"
      : tone === "gold"
      ? "bg-gold/15 text-gold-dark"
      : "bg-navy/10 text-navy";
  return (
    <Card className="gap-0 p-5">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", toneCls)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-serif text-2xl font-bold text-navy">{value}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Skeleton className="h-64 w-full rounded-xl lg:col-span-3" />
        <Skeleton className="h-64 w-full rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// View: Products
// ----------------------------------------------------------------------------
function ProductsView() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const adminProductEditingId = useStore((s) => s.adminProductEditingId);
  const setAdminProductEditing = useStore((s) => s.setAdminProductEditing);
  const bumpToast = useStore((s) => s.bumpToast);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status && status !== "all") params.set("status", status);
    if (category && category !== "all") params.set("category", category);
    fetch(`/api/admin/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 250);
    return () => clearTimeout(t);
  }, [q, status, category]);

  const openAdd = () => {
    setAdminProductEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (id: string) => {
    setAdminProductEditing(id);
    setDialogOpen(true);
  };

  const editingProduct = adminProductEditingId
    ? products.find((p) => p.id === adminProductEditingId) || null
    : null;

  const handleSave = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      const isEdit = !!adminProductEditingId;
      const res = await fetch(
        isEdit ? `/api/admin/products/${adminProductEditingId}` : "/api/admin/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success(isEdit ? "Product updated" : "Product added");
      bumpToast();
      setDialogOpen(false);
      setAdminProductEditing(null);
      fetchProducts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/products/${deleteId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("Product deleted");
      bumpToast();
      setDeleteId(null);
      fetchProducts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete product");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products by title or slug..."
            className="pl-8 bg-card"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40 bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44 bg-card">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openAdd} className="bg-gold-gradient text-navy hover:opacity-90 shadow-gold">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card className="gap-0 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`s${i}`}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate text-sm font-medium text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.categoryName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold text-navy">{formatINR(p.basePrice)}</div>
                    {p.mrp > p.basePrice && (
                      <div className="text-xs text-muted-foreground line-through">{formatINR(p.mrp)}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "font-mono text-sm font-medium",
                        p.totalStock === 0
                          ? "text-red-600"
                          : p.totalStock < 5
                          ? "text-amber-600"
                          : "text-foreground"
                      )}
                    >
                      {p.totalStock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} kind="product" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={p.rating} size={12} />
                      <span className="text-xs text-muted-foreground">{p.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Product actions">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(p.id)}>
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteId(p.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      {/* Product dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setAdminProductEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scrollbar-elegant">
          <DialogHeader>
            <DialogTitle className="text-navy">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update the product details and variants."
                : "Create a new saree listing with variants."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            key={editingProduct?.id || "new"}
            product={editingProduct}
            categories={categories}
            saving={saving}
            onSave={handleSave}
            onCancel={() => {
              setDialogOpen(false);
              setAdminProductEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product and all its variants will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  saving,
  onSave,
  onCancel,
}: {
  product: AdminProduct | null;
  categories: Category[];
  saving: boolean;
  onSave: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [basePrice, setBasePrice] = useState(String(product?.basePrice ?? ""));
  const [mrp, setMrp] = useState(String(product?.mrp ?? ""));
  const [fabricType, setFabricType] = useState(product?.fabricType ?? "");
  const [weaveOrigin, setWeaveOrigin] = useState(product?.weaveOrigin ?? "");
  const [zariType, setZariType] = useState(product?.zariType ?? "");
  const [blouseIncluded, setBlouseIncluded] = useState(product?.blouseIncluded ?? true);
  const [imagesText, setImagesText] = useState((product?.images ?? []).join(", "));
  const [status, setStatus] = useState(product?.status ?? "published");
  const [isBestseller, setIsBestseller] = useState(product?.isBestseller ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [variants, setVariants] = useState<FormVariant[]>(
    product?.variants?.length
      ? product.variants.map((v) => ({
          color: v.color,
          colorHex: v.colorHex ?? "",
          size: v.size ?? "",
          sku: v.sku,
          stockQty: v.stockQty,
        }))
      : [{ color: "", colorHex: "", size: "Free Size", sku: "", stockQty: 0 }]
  );

  const addVariant = () =>
    setVariants((v) => [...v, { color: "", colorHex: "", size: "Free Size", sku: "", stockQty: 0 }]);
  const removeVariant = (i: number) => setVariants((v) => v.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: keyof FormVariant, value: string) =>
    setVariants((v) => v.map((vv, idx) => (idx === i ? { ...vv, [field]: value } : vv)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const images = imagesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({
      title,
      description,
      categoryId,
      basePrice: parseFloat(basePrice) || 0,
      mrp: parseFloat(mrp) || 0,
      fabricType: fabricType || null,
      weaveOrigin: weaveOrigin || null,
      zariType: zariType || null,
      blouseIncluded,
      images,
      status,
      isBestseller,
      isNew,
      isFeatured,
      variants: variants.map((v) => ({
        color: v.color,
        colorHex: v.colorHex || null,
        size: v.size || null,
        sku: v.sku,
        stockQty: parseInt(String(v.stockQty)) || 0,
      })),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="p-title">Title</Label>
          <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Kanjivaram Bridal Silk Saree" />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="bg-card"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="p-desc">Description</Label>
          <Textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Detailed saree description..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-price">Base Price (INR)</Label>
          <Input id="p-price" type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-mrp">MRP (INR)</Label>
          <Input id="p-mrp" type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} />
          <p className="text-xs text-muted-foreground">Optional — defaults to base price if left blank.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-fabric">Fabric Type</Label>
          <Input id="p-fabric" value={fabricType} onChange={(e) => setFabricType(e.target.value)} placeholder="Pure Silk" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-weave">Weave Origin</Label>
          <Input id="p-weave" value={weaveOrigin} onChange={(e) => setWeaveOrigin(e.target.value)} placeholder="Kanchipuram" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-zari">Zari Type</Label>
          <Input id="p-zari" value={zariType} onChange={(e) => setZariType(e.target.value)} placeholder="Tested Zari" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-images">Image URLs (comma-separated)</Label>
          <Input id="p-images" value={imagesText} onChange={(e) => setImagesText(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 rounded-md border border-border bg-card p-3">
        <ToggleRow label="Blouse Included" checked={blouseIncluded} onChange={setBlouseIncluded} />
        <ToggleRow label="Bestseller" checked={isBestseller} onChange={setIsBestseller} />
        <ToggleRow label="New Arrival" checked={isNew} onChange={setIsNew} />
        <ToggleRow label="Featured" checked={isFeatured} onChange={setIsFeatured} />
      </div>

      {/* Variants */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-navy">Variants</Label>
          <Button type="button" size="sm" variant="outline" onClick={addVariant}>
            <Plus className="h-3.5 w-3.5" /> Add variant
          </Button>
        </div>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 rounded-md border border-border bg-card p-2 sm:grid-cols-6">
              <Input placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} className="bg-background sm:col-span-1" />
              <Input placeholder="Hex (#fff)" value={v.colorHex ?? ""} onChange={(e) => updateVariant(i, "colorHex", e.target.value)} className="bg-background sm:col-span-1" />
              <Input placeholder="Size" value={v.size ?? ""} onChange={(e) => updateVariant(i, "size", e.target.value)} className="bg-background sm:col-span-1" />
              <Input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="bg-background sm:col-span-1" />
              <Input placeholder="Stock" type="number" value={String(v.stockQty)} onChange={(e) => updateVariant(i, "stockQty", e.target.value)} className="bg-background sm:col-span-1" />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(i)} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-navy text-ivory hover:bg-navy-light">
          {saving ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onChange} />
      <span className="text-sm text-foreground">{label}</span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// View: Inventory
// ----------------------------------------------------------------------------
type InventoryRow = {
  id: string;
  productId: string;
  productTitle: string;
  slug: string;
  images: string[];
  category: string;
  color: string;
  colorHex: string | null;
  size: string | null;
  sku: string;
  stockQty: number;
  priceOverride: number | null;
  basePrice: number;
  mrp: number;
  status: string;
};

type InventorySummary = {
  totalVariants: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
};

function InventoryView() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editAction, setEditAction] = useState<"set" | "add" | "subtract">("set");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkValue, setBulkValue] = useState("");
  const [bulkAction, setBulkAction] = useState<"set" | "add">("add");
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (q) params.set("q", q);
    if (categoryFilter) params.set("category", categoryFilter);
    try {
      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      const data = await res.json();
      setRows(data.rows || []);
      setSummary(data.summary || null);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (q) params.set("q", q);
    if (categoryFilter) params.set("category", categoryFilter);
    fetch(`/api/admin/inventory?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setRows(data.rows || []);
        setSummary(data.summary || null);
      })
      .catch(() => { if (!cancelled) toast.error("Failed to load inventory"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filter, q, categoryFilter]);

  const handleQuickUpdate = async (variantId: string, delta: number) => {
    setSaving(true);
    try {
      await fetch(`/api/admin/inventory/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQty: delta, action: "add" }),
      });
      // optimistic update
      setRows((prev) => prev.map((r) => (r.id === variantId ? { ...r, stockQty: Math.max(0, r.stockQty + delta) } : r)));
      setSummary((prev) => prev ? { ...prev, totalUnits: Math.max(0, (prev.totalUnits || 0) + delta) } : prev);
      toast.success(delta > 0 ? `Added ${delta} units` : `Removed ${Math.abs(delta)} units`);
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (variantId: string) => {
    const qty = parseInt(editValue);
    if (isNaN(qty) || qty < 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    setSaving(true);
    try {
      await fetch(`/api/admin/inventory/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQty: qty, action: editAction }),
      });
      toast.success("Stock updated");
      setEditingId(null);
      setEditValue("");
      fetchInventory();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    const qty = parseInt(bulkValue);
    if (isNaN(qty) || qty < 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    // apply to all filtered rows
    const updates = rows.map((r) => ({
      id: r.id,
      stockQty: bulkAction === "add" ? r.stockQty + qty : qty,
    }));
    setSaving(true);
    try {
      const res = await fetch("/api/admin/inventory/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      toast.success(`Updated ${data.updated} variants`);
      setBulkOpen(false);
      setBulkValue("");
      fetchInventory();
    } catch {
      toast.error("Bulk update failed");
    } finally {
      setSaving(false);
    }
  };

  const stockBadge = (qty: number) => {
    if (qty === 0) return <Badge className="bg-red-100 text-red-700 border-red-200">Out of Stock</Badge>;
    if (qty < 5) return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Low · {qty} left</Badge>;
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">In Stock · {qty}</Badge>;
  };

  const FILTER_TABS = [
    { id: "all", label: "All", count: summary?.totalVariants || 0 },
    { id: "instock", label: "In Stock", count: (summary?.totalVariants || 0) - (summary?.lowStockCount || 0) - (summary?.outOfStockCount || 0) },
    { id: "low", label: "Low Stock", count: summary?.lowStockCount || 0 },
    { id: "out", label: "Out of Stock", count: summary?.outOfStockCount || 0 },
  ];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card className="border-l-4 border-l-navy">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Variants</p>
                <p className="mt-1 font-serif text-2xl font-bold text-navy">{summary?.totalVariants ?? "—"}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-gold"><Boxes className="h-4 w-4" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Units</p>
                <p className="mt-1 font-serif text-2xl font-bold text-navy">{summary?.totalUnits?.toLocaleString("en-IN") ?? "—"}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Package className="h-4 w-4" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Low Stock</p>
                <p className="mt-1 font-serif text-2xl font-bold text-amber-600">{summary?.lowStockCount ?? "—"}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600"><AlertTriangle className="h-4 w-4" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Out of Stock</p>
                <p className="mt-1 font-serif text-2xl font-bold text-red-600">{summary?.outOfStockCount ?? "—"}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600"><XCircle className="h-4 w-4" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gold">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stock Value</p>
                <p className="mt-1 font-serif text-2xl font-bold text-navy">{summary ? formatINR(summary.totalStockValue) : "—"}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-gradient text-gold"><IndianRupee className="h-4 w-4" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low stock alert banner */}
      {summary && summary.lowStockCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">{summary.lowStockCount} variant{summary.lowStockCount === 1 ? "" : "s"} running low on stock</p>
            <p className="text-xs text-amber-700">Consider restocking soon to avoid stockouts.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setFilter("low")} className="border-amber-400 text-amber-700 hover:bg-amber-100">
            View Low Stock
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-1.5">
              {FILTER_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    filter === t.id ? "bg-navy text-ivory" : "bg-muted text-muted-foreground hover:bg-muted/70"
                  )}
                >
                  {t.label} <span className="ml-1 opacity-70">({t.count})</span>
                </button>
              ))}
            </div>
            {/* Search + category + bulk */}
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search product..."
                  className="h-9 w-44 pl-8 text-sm"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-gold"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Button onClick={() => setBulkOpen(true)} className="h-9 bg-gold-gradient text-navy hover:opacity-90">
                <Plus className="mr-1 h-4 w-4" /> Bulk Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Boxes className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 font-serif text-lg text-foreground">No variants found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-elegant">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="min-w-[200px]">Product / Variant</TableHead>
                    <TableHead className="min-w-[100px]">SKU</TableHead>
                    <TableHead className="min-w-[80px]">Color</TableHead>
                    <TableHead className="min-w-[60px]">Size</TableHead>
                    <TableHead className="min-w-[90px] text-right">Price</TableHead>
                    <TableHead className="min-w-[120px]">Stock Status</TableHead>
                    <TableHead className="min-w-[140px] text-right">Quick Adjust</TableHead>
                    <TableHead className="min-w-[100px] text-right">Set Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {r.images[0] && (
                            <img src={r.images[0]} alt={r.productTitle} className="h-10 w-8 shrink-0 rounded object-cover" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{r.productTitle}</p>
                            <p className="text-[10px] uppercase tracking-wider text-gold-dark">{r.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[11px] text-muted-foreground">{r.sku}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {r.colorHex && (
                            <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: r.colorHex }} />
                          )}
                          <span className="text-xs text-foreground">{r.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{r.size || "—"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-semibold text-navy">{formatINR(r.priceOverride || r.basePrice)}</span>
                      </TableCell>
                      <TableCell>{stockBadge(r.stockQty)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleQuickUpdate(r.id, -1)}
                            disabled={saving || r.stockQty === 0}
                            aria-label="Decrease stock by 1"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm font-bold tabular-nums text-navy">{r.stockQty}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleQuickUpdate(r.id, 1)}
                            disabled={saving}
                            aria-label="Increase stock by 1"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === r.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <select
                              value={editAction}
                              onChange={(e) => setEditAction(e.target.value as typeof editAction)}
                              className="h-8 rounded border border-border bg-background px-1.5 text-xs"
                            >
                              <option value="set">Set</option>
                              <option value="add">Add</option>
                              <option value="subtract">Subtract</option>
                            </select>
                            <Input
                              type="number"
                              min="0"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-8 w-16 text-sm"
                              autoFocus
                            />
                            <Button size="sm" className="h-8 bg-navy px-2 text-ivory hover:bg-navy-light" onClick={() => handleSaveEdit(r.id)} disabled={saving}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => { setEditingId(null); setEditValue(""); }}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-navy hover:bg-muted"
                            onClick={() => { setEditingId(r.id); setEditAction("set"); setEditValue(String(r.stockQty)); }}
                          >
                            <Pencil className="mr-1 h-3 w-3" /> Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk update dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-navy">Bulk Stock Update</DialogTitle>
            <DialogDescription>
              Apply a stock change to all {rows.length} variant{rows.length === 1 ? "" : "s"} matching your current filter. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-navy">Action</Label>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setBulkAction("add")}
                  className={cn("flex-1 rounded-md border px-3 py-2 text-sm font-medium", bulkAction === "add" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-border text-muted-foreground")}
                >
                  Add units
                </button>
                <button
                  onClick={() => setBulkAction("set")}
                  className={cn("flex-1 rounded-md border px-3 py-2 text-sm font-medium", bulkAction === "set" ? "border-navy bg-navy/5 text-navy" : "border-border text-muted-foreground")}
                >
                  Set absolute
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-navy">
                {bulkAction === "add" ? "Units to add" : "Stock level to set"}
              </Label>
              <Input
                type="number"
                min="0"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="Enter quantity"
                className="mt-2"
                autoFocus
              />
            </div>
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Summary:</p>
              <p className="mt-1">This will {bulkAction === "add" ? "add" : "set"} {bulkValue || "0"} units to {rows.length} variant{rows.length === 1 ? "" : "s"}.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkUpdate} disabled={saving} className="bg-navy text-ivory hover:bg-navy-light">
              {saving ? "Updating..." : "Apply to All"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----------------------------------------------------------------------------
// View: Orders
// ----------------------------------------------------------------------------
function OrdersView() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const adminOrderEditingId = useStore((s) => s.adminOrderEditingId);
  const setAdminOrderEditing = useStore((s) => s.setAdminOrderEditing);
  const bumpToast = useStore((s) => s.bumpToast);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status && status !== "all") params.set("status", status);
    fetch(`/api/admin/orders?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchOrders, 250);
    return () => clearTimeout(t);
  }, [q, status]);

  const editingOrder = adminOrderEditingId
    ? orders.find((o) => o.id === adminOrderEditingId) || null
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order # or customer..."
            className="pl-8 bg-card"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-52 bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="packed">Packed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="gap-0 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`s${i}`}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs font-medium text-navy">{o.orderNumber}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-foreground">{o.customerName}</div>
                    <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{relativeTime(o.createdAt)}</TableCell>
                  <TableCell className="font-mono text-sm">{o.items?.length ?? 0}</TableCell>
                  <TableCell className="font-semibold text-navy">{formatINR(o.grandTotal)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs capitalize text-foreground">{prettify(o.paymentMethod)}</span>
                      <StatusBadge status={o.paymentStatus} kind="payment" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} kind="order" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAdminOrderEditing(o.id)}
                      className="text-navy hover:bg-navy/5"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!adminOrderEditingId} onOpenChange={(o) => !o && setAdminOrderEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto scrollbar-elegant">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-navy">
              <ShoppingCart className="h-5 w-5 text-gold" />
              {editingOrder?.orderNumber ?? "Order Detail"}
            </DialogTitle>
            <DialogDescription>
              {editingOrder && `Placed ${relativeTime(editingOrder.createdAt)}`}
            </DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <OrderDetailBody
              order={editingOrder}
              onUpdated={() => {
                bumpToast();
                fetchOrders();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderDetailBody({ order, onUpdated }: { order: AdminOrder; onUpdated: () => void }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [newPayment, setNewPayment] = useState(order.paymentStatus);
  const [saving, setSaving] = useState(false);
  const setAdminOrderEditing = useStore((s) => s.setAdminOrderEditing);

  const addr = order.shippingAddress || {};
  const courier = order.courier || {};

  const update = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, paymentStatus: newPayment }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Order updated");
      onUpdated();
      // refresh single order detail
      const fresh = await fetch(`/api/admin/orders/${order.id}`).then((r) => r.json());
      // we keep the dialog open; timeline not refreshed here for simplicity
      void fresh;
    } catch {
      toast.error("Could not update order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Status update control */}
      <div className="rounded-md border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-navy">Update Status</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Order status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"].map((s) => (
                  <SelectItem key={s} value={s}>{prettify(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Payment status</Label>
            <Select value={newPayment} onValueChange={setNewPayment}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["pending", "paid", "failed", "refunded"].map((s) => (
                  <SelectItem key={s} value={s}>{prettify(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button disabled={saving} onClick={update} className="bg-gold-gradient text-navy hover:opacity-90 shadow-gold">
            {saving ? "Saving..." : "Update"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Customer info */}
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <p className="text-sm font-semibold text-navy">Customer</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <UserCircle className="h-4 w-4 text-muted-foreground" /> {order.customerName}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> {order.customerPhone}
            </div>
            {order.customerEmail && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" /> {order.customerEmail}
              </div>
            )}
          </div>
          <Separator />
          <p className="text-sm font-semibold text-navy">Shipping Address</p>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-0.5">
              {addr.line1 && <div className="text-foreground">{String(addr.line1)}</div>}
              {addr.line2 && <div>{String(addr.line2)}</div>}
              <div>
                {[addr.city, addr.state].filter(Boolean).map(String).join(", ")}
                {addr.pincode ? ` — ${addr.pincode}` : ""}
              </div>
              {addr.phone && <div className="text-xs">Phone: {String(addr.phone)}</div>}
            </div>
          </div>
        </div>

        {/* Payment + courier */}
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <p className="text-sm font-semibold text-navy">Payment</p>
          <div className="space-y-2 text-sm">
            <Row label="Method" value={prettify(order.paymentMethod)} />
            <Row label="Payment status">
              <StatusBadge status={order.paymentStatus} kind="payment" />
            </Row>
            {order.couponCode && <Row label="Coupon" value={order.couponCode} />}
          </div>
          <Separator />
          <p className="text-sm font-semibold text-navy">Courier</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            {courier.name ? (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" /> {String(courier.name)}
              </div>
            ) : (
              <p className="text-xs">No courier assigned.</p>
            )}
            {courier.awb && <p className="font-mono text-xs">AWB: {String(courier.awb)}</p>}
            {courier.trackingUrl && (
              <a href={String(courier.trackingUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-navy hover:underline">
                Track shipment <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-md border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-navy">Items ({order.items?.length ?? 0})</p>
        <ul className="space-y-3">
          {order.items?.map((it, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                {it.image ? (
                  <img src={it.image} alt={it.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{it.title}</p>
                <p className="text-xs text-muted-foreground">
                  {it.variant ? `${it.variant} · ` : ""}Qty {it.qty}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-navy">{formatINR(it.price * it.qty)}</p>
                <p className="text-xs text-muted-foreground">{formatINR(it.price)} each</p>
              </div>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <div className="ml-auto max-w-xs space-y-1.5 text-sm">
          <Row label="Subtotal" value={formatINR(order.subtotal)} />
          {order.discount > 0 && <Row label="Discount" value={`- ${formatINR(order.discount)}`} />}
          <Row label="Shipping" value={order.shippingFee === 0 ? "Free" : formatINR(order.shippingFee)} />
          {order.codSurcharge > 0 && <Row label="COD surcharge" value={formatINR(order.codSurcharge)} />}
          <Separator className="my-1" />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-navy">Grand Total</span>
            <span className="font-serif text-lg font-bold text-navy">{formatINR(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {order.timeline?.length > 0 && (
        <div className="rounded-md border border-border bg-card p-4">
          <p className="mb-3 text-sm font-semibold text-navy">Timeline</p>
          <ol className="space-y-3">
            {order.timeline.map((t, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-gold" />
                  {i < order.timeline.length - 1 && <div className="h-full w-px flex-1 bg-border" />}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.status} kind="order" />
                    <span className="text-xs text-muted-foreground">{relativeTime(t.timestamp)}</span>
                  </div>
                  {t.note && <p className="mt-1 text-xs text-muted-foreground">{t.note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={() => setAdminOrderEditing(null)}>Close</Button>
      </DialogFooter>
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {value !== undefined ? <span className="font-medium text-foreground">{value}</span> : children}
    </div>
  );
}

// ----------------------------------------------------------------------------
// View: Customers
// ----------------------------------------------------------------------------
function CustomersView() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState("all");

  useEffect(() => {
    const load = () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (segment && segment !== "all") params.set("segment", segment);
      fetch(`/api/admin/customers?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          setCustomers(d.customers || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    load();
  }, [segment]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={segment} onValueChange={setSegment}>
          <SelectTrigger className="w-full sm:w-52 bg-card">
            <SelectValue placeholder="Segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All segments</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="bridal_lead">Bridal Lead</SelectItem>
            <SelectItem value="wholesale">Wholesale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="gap-0 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`s${i}`}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading && customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-navy-gradient text-[10px] font-semibold text-gold-gradient">
                          {initials(c.name || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.city || "—"}</TableCell>
                  <TableCell className="font-mono text-sm font-semibold">{c.totalOrders}</TableCell>
                  <TableCell className="font-semibold text-navy">{formatINR(c.totalSpent)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", segmentClasses(c.segment))}>
                      {c.segment === "bridal_lead" ? "Bridal Lead" : prettify(c.segment)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ----------------------------------------------------------------------------
// View: Reviews
// ----------------------------------------------------------------------------
function ReviewsView() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const filter = useStore((s) => s.adminReviewFilter);
  const setFilter = useStore((s) => s.setAdminReviewFilter);
  const bumpToast = useStore((s) => s.bumpToast);

  // Default to pending to surface the moderation queue
  useEffect(() => {
    if (filter === "all") setFilter("pending");
  }, []);

  useEffect(() => {
    const load = () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter && filter !== "all") params.set("status", filter);
      fetch(`/api/admin/reviews?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          setReviews(d.reviews || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    load();
  }, [filter]);

  const refresh = () => {
    const params = new URLSearchParams();
    if (filter && filter !== "all") params.set("status", filter);
    fetch(`/api/admin/reviews?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []));
  };

  const patch = async (id: string, body: Record<string, unknown>, msg: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(msg);
      bumpToast();
      refresh();
    } catch {
      toast.error("Action failed");
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Review deleted");
      bumpToast();
      refresh();
    } catch {
      toast.error("Could not delete review");
    }
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="gap-0 p-10 text-center">
          <Star className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No reviews in this filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {reviews.map((r) => (
            <Card key={r.id} className="gap-0 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-navy-gradient text-xs font-semibold text-gold-gradient">
                      {initials(r.authorName || "A")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.authorCity ? `${r.authorCity} · ` : ""}
                      {relativeTime(r.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.verified && (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                  <StatusBadge status={r.status} kind="review" />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <StarRating rating={r.rating} size={13} />
                <span className="text-xs text-muted-foreground">{r.rating}.0</span>
              </div>

              <p className="mt-2 text-sm font-medium text-navy">{r.title}</p>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{r.body}</p>

              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                <span className="mr-auto truncate text-xs text-muted-foreground">
                  on <span className="font-medium text-foreground">{r.product?.title}</span>
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {r.status !== "approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => patch(r.id, { status: "approved" }, "Review approved")}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </Button>
                )}
                {r.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => patch(r.id, { status: "rejected" }, "Review rejected")}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={r.featured ? "default" : "outline"}
                  onClick={() => patch(r.id, { featured: !r.featured }, r.featured ? "Unfeatured" : "Featured")}
                  className={cn(
                    r.featured
                      ? "bg-gold-gradient text-navy hover:opacity-90 shadow-gold"
                      : "border-gold/40 text-gold-dark hover:bg-gold/10"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" /> {r.featured ? "Featured" : "Feature"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(r.id)}
                  className="ml-auto text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// View: Coupons
// ----------------------------------------------------------------------------
function CouponsView() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const adminCouponEditingId = useStore((s) => s.adminCouponEditingId);
  const setAdminCouponEditing = useStore((s) => s.setAdminCouponEditing);
  const bumpToast = useStore((s) => s.bumpToast);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCoupons = () => {
    setLoading(true);
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => {
        setCoupons(d.coupons || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const editingCoupon = adminCouponEditingId
    ? coupons.find((c) => c.id === adminCouponEditingId) || null
    : null;

  const toggleActive = async (c: AdminCoupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: c.code,
          description: c.description,
          type: c.type,
          value: c.value,
          minCartValue: c.minCartValue,
          usageLimit: c.usageLimit,
          perUserLimit: c.perUserLimit,
          active: !c.active,
          expiresAt: c.expiresAt,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(c.active ? "Coupon deactivated" : "Coupon activated");
      bumpToast();
      fetchCoupons();
    } catch {
      toast.error("Could not toggle coupon");
    }
  };

  const handleSave = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      const isEdit = !!adminCouponEditingId;
      const res = await fetch(
        isEdit ? `/api/admin/coupons/${adminCouponEditingId}` : "/api/admin/coupons",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Coupon updated" : "Coupon created");
      bumpToast();
      setDialogOpen(false);
      setAdminCouponEditing(null);
      fetchCoupons();
    } catch {
      toast.error("Could not save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/coupons/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Coupon deleted");
      bumpToast();
      setDeleteId(null);
      fetchCoupons();
    } catch {
      toast.error("Could not delete coupon");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{coupons.length} coupon(s) configured</p>
        <Button
          onClick={() => {
            setAdminCouponEditing(null);
            setDialogOpen(true);
          }}
          className="bg-gold-gradient text-navy hover:opacity-90 shadow-gold"
        >
          <Plus className="h-4 w-4" /> Add Coupon
        </Button>
      </div>

      <Card className="gap-0 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min Cart</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`s${i}`}>
                  <TableCell colSpan={9}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading && coupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  No coupons yet. Create your first discount code.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-bold text-gold-dark">{c.code}</span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {c.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        c.type === "percent"
                          ? "border-navy/30 bg-navy/10 text-navy"
                          : "border-gold/40 bg-gold/15 text-gold-dark"
                      )}
                    >
                      {prettify(c.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-navy">
                    {c.type === "percent" ? `${c.value}%` : formatINR(c.value)}
                  </TableCell>
                  <TableCell className="text-sm">{c.minCartValue ? formatINR(c.minCartValue) : "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.usedCount}
                    {c.usageLimit > 0 ? ` / ${c.usageLimit}` : " / ∞"}
                  </TableCell>
                  <TableCell>
                    <Switch checked={c.active} onCheckedChange={() => toggleActive(c)} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.expiresAt ? formatDate(c.expiresAt) : "No expiry"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setAdminCouponEditing(c.id);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(c.id)}>
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setAdminCouponEditing(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-navy">{editingCoupon ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
            <DialogDescription>
              {editingCoupon ? "Update the discount code." : "Create a new discount code."}
            </DialogDescription>
          </DialogHeader>
          <CouponForm
            key={editingCoupon?.id || "new"}
            coupon={editingCoupon}
            saving={saving}
            onSave={handleSave}
            onCancel={() => {
              setDialogOpen(false);
              setAdminCouponEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              The coupon code will be permanently removed and can no longer be applied at checkout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CouponForm({
  coupon,
  saving,
  onSave,
  onCancel,
}: {
  coupon: AdminCoupon | null;
  saving: boolean;
  onSave: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(coupon?.code ?? "");
  const [description, setDescription] = useState(coupon?.description ?? "");
  const [type, setType] = useState(coupon?.type ?? "percent");
  const [value, setValue] = useState(String(coupon?.value ?? "10"));
  const [minCartValue, setMinCartValue] = useState(String(coupon?.minCartValue ?? "0"));
  const [usageLimit, setUsageLimit] = useState(String(coupon?.usageLimit ?? "0"));
  const [perUserLimit, setPerUserLimit] = useState(String(coupon?.perUserLimit ?? "1"));
  const [active, setActive] = useState(coupon?.active ?? true);
  const [expiresAt, setExpiresAt] = useState(
    coupon?.expiresAt ? coupon.expiresAt.slice(0, 10) : ""
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code,
      description: description || null,
      type,
      value: parseFloat(value) || 0,
      minCartValue: parseFloat(minCartValue) || 0,
      usageLimit: parseInt(usageLimit) || 0,
      perUserLimit: parseInt(perUserLimit) || 1,
      active,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="c-code">Code</Label>
        <Input id="c-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="FESTIVE10" className="font-mono" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-desc">Description</Label>
        <Input id="c-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="10% off festive orders" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">Percent (%)</SelectItem>
              <SelectItem value="flat">Flat (INR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-value">Value</Label>
          <Input id="c-value" type="number" value={value} onChange={(e) => setValue(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-min">Min Cart Value</Label>
          <Input id="c-min" type="number" value={minCartValue} onChange={(e) => setMinCartValue(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-limit">Usage Limit (0 = ∞)</Label>
          <Input id="c-limit" type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-per">Per User Limit</Label>
          <Input id="c-per" type="number" value={perUserLimit} onChange={(e) => setPerUserLimit(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-exp">Expires At</Label>
          <Input id="c-exp" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
      </div>
      <ToggleRow label="Active" checked={active} onChange={setActive} />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-navy text-ivory hover:bg-navy-light">
          {saving ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ----------------------------------------------------------------------------
// View: Content (FAQs + Testimonials)
// ----------------------------------------------------------------------------
function ContentView() {
  return (
    <Tabs defaultValue="faqs">
      <TabsList>
        <TabsTrigger value="faqs"><FileText className="h-4 w-4" /> FAQs</TabsTrigger>
        <TabsTrigger value="testimonials"><Sparkles className="h-4 w-4" /> Testimonials</TabsTrigger>
      </TabsList>
      <TabsContent value="faqs" className="mt-4">
        <FaqsTab />
      </TabsContent>
      <TabsContent value="testimonials" className="mt-4">
        <TestimonialsTab />
      </TabsContent>
    </Tabs>
  );
}

function FaqsTab() {
  const [faqs, setFaqs] = useState<AdminFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const bumpToast = useStore((s) => s.bumpToast);

  const fetchFaqs = () => {
    setLoading(true);
    fetch("/api/admin/faqs")
      .then((r) => r.json())
      .then((d) => {
        setFaqs(d.faqs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const editing = editingId ? faqs.find((f) => f.id === editingId) || null : null;

  const handleSave = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/admin/faqs/${editingId}` : "/api/admin/faqs",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error();
      toast.success(editingId ? "FAQ updated" : "FAQ added");
      bumpToast();
      setDialogOpen(false);
      setEditingId(null);
      fetchFaqs();
    } catch {
      toast.error("Could not save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/faqs/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("FAQ deleted");
      bumpToast();
      setDeleteId(null);
      fetchFaqs();
    } catch {
      toast.error("Could not delete FAQ");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{faqs.length} FAQ entries</p>
        <Button
          onClick={() => {
            setEditingId(null);
            setDialogOpen(true);
          }}
          className="bg-gold-gradient text-navy hover:opacity-90 shadow-gold"
        >
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <Card className="gap-0 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`s${i}`}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading && faqs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No FAQs yet.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              faqs.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="max-w-[260px] font-medium text-foreground">{f.question}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">{f.answer}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-secondary text-muted-foreground">
                      {f.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{f.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingId(f.id);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(f.id)}>
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditingId(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-navy">{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            <DialogDescription>{editing ? "Update the FAQ entry." : "Create a new frequently asked question."}</DialogDescription>
          </DialogHeader>
          <FaqForm
            key={editing?.id || "new"}
            faq={editing}
            saving={saving}
            onSave={handleSave}
            onCancel={() => {
              setDialogOpen(false);
              setEditingId(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
            <AlertDialogDescription>This FAQ entry will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FaqForm({
  faq,
  saving,
  onSave,
  onCancel,
}: {
  faq: AdminFaq | null;
  saving: boolean;
  onSave: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [category, setCategory] = useState(faq?.category ?? "General");
  const [sortOrder, setSortOrder] = useState(String(faq?.sortOrder ?? "0"));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ question, answer, category, sortOrder: parseInt(sortOrder) || 0 });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="f-q">Question</Label>
        <Input id="f-q" value={question} onChange={(e) => setQuestion(e.target.value)} required placeholder="How should I store my silk saree?" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="f-a">Answer</Label>
        <Textarea id="f-a" value={answer} onChange={(e) => setAnswer(e.target.value)} required rows={4} placeholder="Store wrapped in muslin cloth..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["General", "Shipping", "Returns", "COD", "Payments", "Sarees", "Care"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-sort">Sort Order</Label>
          <Input id="f-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-navy text-ivory hover:bg-navy-light">
          {saving ? "Saving..." : faq ? "Update FAQ" : "Add FAQ"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function TestimonialsTab() {
  const [items, setItems] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const bumpToast = useStore((s) => s.bumpToast);

  const fetchItems = () => {
    setLoading(true);
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.testimonials || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const editing = editingId ? items.find((t) => t.id === editingId) || null : null;

  const handleSave = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/admin/testimonials/${editingId}` : "/api/admin/testimonials",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Testimonial updated" : "Testimonial added");
      bumpToast();
      setDialogOpen(false);
      setEditingId(null);
      fetchItems();
    } catch {
      toast.error("Could not save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Testimonial deleted");
      bumpToast();
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error("Could not delete testimonial");
    }
  };

  const toggleFeatured = async (t: AdminTestimonial) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: t.name,
          city: t.city,
          quote: t.quote,
          rating: t.rating,
          featured: !t.featured,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(t.featured ? "Unfeatured" : "Featured");
      bumpToast();
      fetchItems();
    } catch {
      toast.error("Could not update testimonial");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} testimonials</p>
        <Button
          onClick={() => {
            setEditingId(null);
            setDialogOpen(true);
          }}
          className="bg-gold-gradient text-navy hover:opacity-90 shadow-gold"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="gap-0 p-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No testimonials yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <Card key={t.id} className="gap-0 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-navy-gradient text-xs font-semibold text-gold-gradient">
                      {initials(t.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    {t.city && <p className="text-xs text-muted-foreground">{t.city}</p>}
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDeleteId(t.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <div className="mt-3">
                <StarRating rating={t.rating} size={13} />
              </div>
              <p className="mt-2 line-clamp-4 text-sm italic text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">{relativeTime(t.createdAt)}</span>
                <Button
                  size="sm"
                  variant={t.featured ? "default" : "outline"}
                  onClick={() => toggleFeatured(t)}
                  className={cn(
                    "h-7",
                    t.featured
                      ? "bg-gold-gradient text-navy hover:opacity-90"
                      : "border-gold/40 text-gold-dark hover:bg-gold/10"
                  )}
                >
                  <Sparkles className="h-3 w-3" /> {t.featured ? "Featured" : "Feature"}
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="mt-1 h-7 w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEditingId(t.id);
                  setDialogOpen(true);
                }}
              >
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditingId(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-navy">{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            <DialogDescription>{editing ? "Update the testimonial." : "Add a customer testimonial."}</DialogDescription>
          </DialogHeader>
          <TestimonialForm
            key={editing?.id || "new"}
            item={editing}
            saving={saving}
            onSave={handleSave}
            onCancel={() => {
              setDialogOpen(false);
              setEditingId(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this testimonial?</AlertDialogTitle>
            <AlertDialogDescription>This testimonial will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TestimonialForm({
  item,
  saving,
  onSave,
  onCancel,
}: {
  item: AdminTestimonial | null;
  saving: boolean;
  onSave: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [city, setCity] = useState(item?.city ?? "");
  const [quote, setQuote] = useState(item?.quote ?? "");
  const [rating, setRating] = useState(String(item?.rating ?? "5"));
  const [featured, setFeatured] = useState(item?.featured ?? false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, city: city || null, quote, rating: parseInt(rating) || 5, featured });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="t-name">Name</Label>
          <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Priya Sharma" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-city">City</Label>
          <Input id="t-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Chennai" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="t-quote">Quote</Label>
        <Textarea id="t-quote" value={quote} onChange={(e) => setQuote(e.target.value)} required rows={3} placeholder="The saree quality was exceptional..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Rating</Label>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[5, 4, 3, 2, 1].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end pb-1.5">
          <ToggleRow label="Featured" checked={featured} onChange={setFeatured} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-navy text-ivory hover:bg-navy-light">
          {saving ? "Saving..." : item ? "Update Testimonial" : "Add Testimonial"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ----------------------------------------------------------------------------
// View: Settings
// ----------------------------------------------------------------------------
function SettingsView() {
  const bumpToast = useStore((s) => s.bumpToast);

  const [storeName, setStoreName] = useState("Nandhini Tex");
  const [supportPhone, setSupportPhone] = useState("+91 98765 43210");
  const [supportEmail, setSupportEmail] = useState("hello@nandhinitex.in");
  const [address, setAddress] = useState("Elampillai, Salem District, Tamil Nadu 637502");

  const [freeShipThreshold, setFreeShipThreshold] = useState("999");
  const [shipFee, setShipFee] = useState("60");
  const [codSurcharge, setCodSurcharge] = useState("40");

  const [upi, setUpi] = useState(true);
  const [card, setCard] = useState(true);
  const [netbanking, setNetbanking] = useState(true);
  const [cod, setCod] = useState(true);

  const [gstDisplay, setGstDisplay] = useState(true);
  const [gstInclusive, setGstInclusive] = useState(true);

  const save = () => {
    bumpToast();
    toast.success("Settings saved");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Store information */}
      <Card className="gap-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-navy">
            <Shield className="h-4 w-4 text-gold" /> Store Information
          </CardTitle>
          <CardDescription>Basic store identity and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="s-name">Store Name</Label>
              <Input id="s-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="bg-card" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-phone">Support Phone</Label>
              <Input id="s-phone" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} className="bg-card" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-email">Support Email</Label>
              <Input id="s-email" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="bg-card" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-addr">Address</Label>
              <Input id="s-addr" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-card" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping rules */}
      <Card className="gap-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-navy">
            <Truck className="h-4 w-4 text-gold" /> Shipping Rules
          </CardTitle>
          <CardDescription>Configure shipping thresholds and fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="ship-free">Free Shipping Threshold (INR)</Label>
              <Input id="ship-free" type="number" value={freeShipThreshold} onChange={(e) => setFreeShipThreshold(e.target.value)} className="bg-card" />
              <p className="text-xs text-muted-foreground">Orders above this ship free.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ship-fee">Standard Shipping Fee</Label>
              <Input id="ship-fee" type="number" value={shipFee} onChange={(e) => setShipFee(e.target.value)} className="bg-card" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ship-cod">COD Surcharge</Label>
              <Input id="ship-cod" type="number" value={codSurcharge} onChange={(e) => setCodSurcharge(e.target.value)} className="bg-card" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment methods */}
      <Card className="gap-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-navy">
            <CreditCard className="h-4 w-4 text-gold" /> Payment Methods
          </CardTitle>
          <CardDescription>Toggle accepted payment options</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SettingToggle label="UPI" desc="Google Pay, PhonePe, Paytm" checked={upi} onChange={setUpi} />
          <SettingToggle label="Cards" desc="Credit / Debit cards" checked={card} onChange={setCard} />
          <SettingToggle label="Net Banking" desc="All major banks" checked={netbanking} onChange={setNetbanking} />
          <SettingToggle label="Cash on Delivery" desc="Pay at doorstep" checked={cod} onChange={setCod} />
        </CardContent>
      </Card>

      {/* Tax */}
      <Card className="gap-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-navy">
            <IndianRupee className="h-4 w-4 text-gold" /> Tax Settings
          </CardTitle>
          <CardDescription>GST display configuration</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SettingToggle label="Display GST" desc="Show GST on invoices" checked={gstDisplay} onChange={setGstDisplay} />
          <SettingToggle label="GST Inclusive" desc="Prices include GST" checked={gstInclusive} onChange={setGstInclusive} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} className="bg-gold-gradient text-navy hover:opacity-90 shadow-gold">
          <CheckCircle2 className="h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
}

function SettingToggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
