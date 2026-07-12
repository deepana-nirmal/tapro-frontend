import { BarChart3, CheckCircle2, ClipboardList, Clock3, CreditCard, LockKeyhole, QrCode, ShieldCheck, Store, Table2, Users, UtensilsCrossed } from 'lucide-react';
import { ReactNode } from 'react';

export type LandingNavItem = { label: string; href: string };
export type FeatureItem = { title: string; description: string; icon: ReactNode };
export type ProcessStep = { title: string; description: string };
export type PricingPlan = { name: string; audience: string; price: string; note: string; features: string[]; recommended?: boolean };
export type Testimonial = { quote: string; name: string; role: string };
export type FAQItem = { question: string; answer: string };

export const landingNavItems: LandingNavItem[] = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export const productPreviews = [
  {
    title: 'Owner dashboard',
    eyebrow: 'Operations view',
    description: 'Track order volume, table activity, and service status from the same workspace owners already use.',
  },
  {
    title: 'Digital menu',
    eyebrow: 'Guest ordering',
    description: 'Customers browse categories, search dishes, and add items from a mobile-first restaurant menu.',
  },
  {
    title: 'Order queue',
    eyebrow: 'Kitchen workflow',
    description: 'Staff move orders from pending to preparing, ready, and completed with role-aware controls.',
  },
];

export const qrDemoSteps = [
  'QR on table',
  'Menu opens',
  'Guest chooses items',
  'Order sent',
  'Kitchen receives',
  'Progress tracked',
];

export const howItWorksSteps: ProcessStep[] = [
  { title: 'Create the restaurant profile', description: 'Owners configure restaurant details, branding, and the operating workspace.' },
  { title: 'Build the digital menu', description: 'Menus, categories, item images, prices, and availability stay manageable in Tapro.' },
  { title: 'Generate table QR codes', description: 'Each table can route guests into a table-specific ordering context.' },
  { title: 'Guests scan and order', description: 'Customers open the menu, add dishes, and place orders without installing an app.' },
  { title: 'Staff process orders', description: 'Kitchen, cashier, and manager roles update order status through protected views.' },
  { title: 'Owners monitor performance', description: 'Restaurant owners review orders, reports, tables, staff, and menu activity.' },
];

export const features: FeatureItem[] = [
  { title: 'QR-based ordering', description: 'Table-specific QR routes let guests open the correct restaurant menu quickly.', icon: <QrCode /> },
  { title: 'Digital menu management', description: 'Manage categories, menu items, images, prices, and descriptions from one place.', icon: <UtensilsCrossed /> },
  { title: 'Table management', description: 'Create tables and keep QR links aligned with restaurant operations.', icon: <Table2 /> },
  { title: 'Order-status workflow', description: 'Move orders through pending, preparing, ready, completed, and payment workflows.', icon: <ClipboardList /> },
  { title: 'Staff management', description: 'Invite and manage staff and kitchen users with restaurant-aware role access.', icon: <Users /> },
  { title: 'Role-based access', description: 'Protected dashboards keep owners, managers, cashiers, kitchen staff, and customers separated.', icon: <ShieldCheck /> },
  { title: 'Restaurant analytics', description: 'Owners and admins can review revenue, average order value, and operational reports.', icon: <BarChart3 /> },
  { title: 'Availability controls', description: 'Keep menu availability current so guests only order items the restaurant can serve.', icon: <Clock3 /> },
  { title: 'Multi-restaurant SaaS', description: 'Platform administration supports restaurant management across multiple tenants.', icon: <Store /> },
  { title: 'Secure authentication', description: 'JWT-backed sign-in and protected routes preserve access boundaries.', icon: <LockKeyhole /> },
  { title: 'Restaurant profiles', description: 'Maintain restaurant details, descriptions, logos, and public menu presentation.', icon: <CheckCircle2 /> },
  { title: 'Cashier and billing views', description: 'Cashier workflows support billing, payments, and order completion.', icon: <CreditCard /> },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    audience: 'Single-location restaurants starting with QR ordering',
    price: 'Contact Sales',
    note: 'Pricing can be connected to backend subscription data later.',
    features: ['Digital menu setup', 'Table QR ordering', 'Order tracking', 'Owner dashboard'],
  },
  {
    name: 'Growth',
    audience: 'Busy restaurants that need staff workflows',
    price: 'Contact Sales',
    note: 'Recommended for teams operating daily service in Tapro.',
    recommended: true,
    features: ['Everything in Starter', 'Staff and kitchen roles', 'Order-status management', 'Reports and menu availability'],
  },
  {
    name: 'Pro',
    audience: 'Multi-branch operators and platform-managed restaurants',
    price: 'Contact Sales',
    note: 'For larger deployments that need broader administration.',
    features: ['Everything in Growth', 'Multi-restaurant management', 'Platform administration', 'Advanced operational reporting'],
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: 'Tapro preview content shows how a restaurant team can replace paper menu friction with a clearer table-ordering flow.',
    name: 'Sample restaurant operator',
    role: 'Preview testimonial',
  },
  {
    quote: 'The platform structure fits the way owners, staff, kitchen, and customers each need a focused view.',
    name: 'Sample operations manager',
    role: 'Preview testimonial',
  },
  {
    quote: 'QR ordering, menu control, and order tracking are presented as one connected workflow instead of separate tools.',
    name: 'Sample service lead',
    role: 'Preview testimonial',
  },
];

export const logoCloud = ['North Table', 'Curry Yard', 'Harbor Spoon', 'Urban Kottu', 'Mango Room', 'Bistro Nine'];

export const faqs: FAQItem[] = [
  { question: 'What is Tapro?', answer: 'Tapro is a multi-restaurant SaaS platform for QR table ordering, menu management, order workflows, staff roles, and restaurant reporting.' },
  { question: 'How does table QR ordering work?', answer: 'A customer scans a table QR code, opens the restaurant menu, adds items, places an order, and tracks the order status from the browser.' },
  { question: 'Does each table get its own QR code?', answer: 'Tapro supports table-specific ordering routes so orders can carry table context to restaurant staff.' },
  { question: 'Can restaurant staff update order statuses?', answer: 'Yes. Protected staff, manager, kitchen, cashier, and owner views include order-status workflows.' },
  { question: 'Can owners manage menu availability?', answer: 'Yes. Menu management includes item details, categories, and availability controls.' },
  { question: 'Can multiple restaurants use Tapro?', answer: 'Yes. Tapro includes platform administration for managing multiple restaurant tenants.' },
  { question: 'Do customers need to install an application?', answer: 'No. The customer QR ordering flow runs in the browser.' },
  { question: 'How are customer orders tracked?', answer: 'Orders can be tracked through a public order-tracking route that shows the current status and order details.' },
  { question: 'Can restaurants manage staff roles?', answer: 'Yes. Owners and platform admins can invite and manage restaurant-specific users.' },
  { question: 'How can a restaurant get started?', answer: 'Use the Get Started flow to create an account or contact the Tapro team to discuss setup.' },
];
