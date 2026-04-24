// [Build] IntelliScan-Neural-Stable-v1.0.4 - Production Refresh Trigger
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import RoleGuard from './components/RoleGuard';
import TierGuard from './components/TierGuard';
import DevTools from './components/DevTools';
import CommandPalette from './components/CommandPalette';
import ActivityTracker from './components/ActivityTracker';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import { useRole } from './context/RoleContext';
import { getStoredToken, resolveHomeRoute, safeReadStoredUser, tryDecodeJwtPayload } from './utils/auth';

// Public Pages (Using their own full bespoke layouts now)
import generatedRoutes from './pages/generated/routes.json';
const generatedModules = import.meta.glob('./pages/generated/*.jsx', { eager: true });

import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import AdvancedApiExplorerSandbox from './pages/AdvancedApiExplorerSandbox';
import AiTrainingTuningSuperAdmin from './pages/AiTrainingTuningSuperAdmin';
import ForgotPassword from './pages/ForgotPassword';
import OnboardingPage from './pages/OnboardingPage';
import SsoCallback from './pages/SsoCallback';
import PublicAnalyticsPage from './pages/PublicAnalyticsPage';
import ApiDocsPage from './pages/ApiDocsPage';
import PublicProfile from './pages/generated/PublicProfile';
import AboutPage from './pages/public/AboutPage';
import ClientsPage from './pages/public/ClientsPage';
import ServicesPage from './pages/public/ServicesPage';
import CareersPage from './pages/public/CareersPage';
import ProductPage from './pages/public/ProductPage';
import FeaturesPage from './pages/public/FeaturesPage';
import PricingPage from './pages/public/PricingPage';
import FaqPage from './pages/public/FaqPage';
import ContactPage from './pages/public/ContactPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';

// User Dashboard Pages
import ScanPage from './pages/ScanPage';
import ContactsPage from './pages/ContactsPage';
import SettingsPage from './pages/SettingsPage';
import MarketplacePage from './pages/MarketplacePage';
import MarketplaceDetailPage from './pages/MarketplaceDetailPage';
import FeedbackPage from './pages/FeedbackPage';
import EventsPage from './pages/dashboard/EventsPage';
import DraftsPage from './pages/dashboard/DraftsPage';
import MyCardPage from './pages/dashboard/MyCardPage';
import CoachPage from './pages/dashboard/CoachPage';
import KioskMode from './pages/dashboard/KioskMode';
import MeetingToolsPage from './pages/dashboard/MeetingToolsPage';
import SignalsPage from './pages/dashboard/SignalsPage';
import CardCreatorPage from './pages/CardCreatorPage';
import Leaderboard from './pages/dashboard/Leaderboard';
import SetupGuidePage from './pages/SetupGuidePage';

// Email Marketing Pages
import EmailMarketingPage from './pages/email/EmailMarketingPage';
import CampaignListPage from './pages/email/CampaignListPage';
import CampaignBuilderPage from './pages/email/CampaignBuilderPage';
import CampaignDetailPage from './pages/email/CampaignDetailPage';
import TemplateLibraryPage from './pages/email/TemplateLibraryPage';
import TemplateEditorPage from './pages/email/TemplateEditorPage';
import ContactListsPage from './pages/email/ContactListsPage';
import ListDetailPage from './pages/email/ListDetailPage';
import EmailSequencesPage from './pages/email/EmailSequencesPage';
import SequenceDetailPage from './pages/email/SequenceDetailPage';

// Calendar Pages
import CalendarPage from './pages/calendar/CalendarPage';
import AvailabilityPage from './pages/calendar/AvailabilityPage';
import BookingLinksPage from './pages/calendar/BookingLinksPage';
import BookingPage from './pages/calendar/BookingPage';

// Workspace / Admin Pages
import WorkspaceDashboard from './pages/WorkspaceDashboard';
import WorkspaceContacts from './pages/WorkspaceContacts';
import MembersPage from './pages/MembersPage';
import ScannerLinksPage from './pages/ScannerLinksPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BillingPage from './pages/BillingPage';
import CheckoutPage from './pages/CheckoutPage';
import CrmMappingPage from './pages/workspace/CrmMappingPage';
import RoutingRulesPage from './pages/workspace/RoutingRulesPage';
import DataPoliciesPage from './pages/workspace/DataPoliciesPage';
import SharedRolodexPage from './pages/workspace/SharedRolodexPage';
import EmailCampaignsPage from './pages/workspace/EmailCampaignsPage';
import DataQualityCenterPage from './pages/workspace/DataQualityCenterPage';
import OrgChartPage from './pages/OrgChartPage';
import PipelinePage from './pages/workspace/PipelinePage';
import WebhookManagement from './pages/workspace/WebhookManagement';

// Super Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import EnginePerformance from './pages/EnginePerformance';
import SuperAdminFeedbackPage from './pages/SuperAdminFeedbackPage';
import CustomModelsPage from './pages/admin/CustomModelsPage';
import JobQueuesPage from './pages/admin/JobQueuesPage';
import SystemIncidentCenter from './pages/admin/SystemIncidentCenter';
import AuditTimelinePage from './pages/admin/AuditTimelinePage';

// Standalone pages pulled out of catch-all for correct layout
import GenSubscriptionPlanComparison from './pages/generated/GenSubscriptionPlanComparison.jsx';

// Generic placeholder component for pages not yet migrated
const PageStub = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
    <p className="text-gray-500 dark:text-gray-400">This page is currently being migrated from the HTML prototypes.</p>
  </div>
);

const RequireAuth = ({ children }) => {
  const token = getStoredToken();
  if (!token) return <Navigate to="/sign-in" replace />;
  return children;
};

const RootRoute = () => {
  const { isAuthenticated, isLoading: isAuth0Loading } = useAuth0();
  const token = getStoredToken();
  const { isAuthReady } = useRole();

  // 1. Wait for Auth0 to initialize AND RoleContext bootstrap (Sync)
  // CRITICAL FIX: Ensure we wait if Auth0 authenticated us but our local API sync hasn't returned the JWT yet.
  if (isAuth0Loading || !isAuthReady || (isAuthenticated && !token)) {
    return <SplashScreen message="Syncing Neural Session..." />;
  }

  // 2. Decide based on session existence
  // Check both local token and Auth0 state to be resilient
  if (!token && !isAuthenticated) return <LandingPage />;
  
  const storedUser = safeReadStoredUser();
  const derivedUser = storedUser || tryDecodeJwtPayload(token) || { role: 'user' };
  const home = resolveHomeRoute(derivedUser);
  return <Navigate to={home} replace />;
};

import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  // Database Wake-Up Ping (Prevents Cold Start Timeouts)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/health`).catch(() => {});
  }, []);

  const { isAuthReady } = useRole();
  const { isLoading: isAuth0Loading, isAuthenticated } = useAuth0();
  const token = getStoredToken();

  // 🛡️ Safety Lock Clear: If we have a token, we are NOT logging out.
  useEffect(() => {
    if (token) {
      localStorage.removeItem('intelliscan_logout_active');
    }
  }, [token]);

  // 🛡️ Loop Breaker: If we are at the root but already authenticated, jump to dashboard immediately
  useEffect(() => {
    if (isAuthenticated && token && window.location.pathname === '/') {
      console.log('[App] Authenticated user detected at root. Forcing redirect to dashboard...');
      const decoded = tryDecodeJwtPayload(token);
      const home = resolveHomeRoute({ role: decoded?.role || 'user', tier: decoded?.tier || 'personal' });
      window.location.assign(home);
    }
  }, [isAuthenticated, token]);

  // App-level loading to prevent flicker
  // Only show full splash if we are truly unauthenticated or bootstrapping for the first time
  if ((isAuth0Loading || !isAuthReady) && !token) {
    return <SplashScreen message="Loading IntelliScan Neural Cluster..." />;
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="min-h-screen selection:bg-brand-600 selection:text-white transition-colors duration-300">
        <ActivityTracker />
        <CommandPalette />
        <ErrorBoundary>
          <Routes>
            {/* ── PUBLIC ROUTES WITHOUT PUBLICLAYOUT BLOCK ── */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/public-stats" element={<PublicAnalyticsPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/sso-callback" element={<SsoCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
            <Route path="/u/:slug" element={<PublicProfile />} />
            <Route path="/book/:slug" element={<BookingPage />} />

            <Route path="/scan/:token" element={<PageStub title="Public Scanner" />} />

            {/* ── USER DASHBOARD & MARKETPLACE (Persistent Layout) ── */}
            <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
              <Route path="/dashboard" element={<Navigate to="/dashboard/scan" replace />} />
              <Route path="/dashboard/scan" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><ScanPage /></RoleGuard>} />
              <Route path="/dashboard/contacts" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><ContactsPage /></RoleGuard>} />
              <Route path="/dashboard/calendar" element={<TierGuard minTier="pro" featureName="Calendar"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><CalendarPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/calendar/availability" element={<TierGuard minTier="pro" featureName="Calendar Availability"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AvailabilityPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/calendar/booking-links" element={<TierGuard minTier="pro" featureName="Booking Links"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><BookingLinksPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/events" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><EventsPage /></RoleGuard>} />
              <Route path="/dashboard/drafts" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DraftsPage /></RoleGuard>} />
              <Route path="/dashboard/coach" element={<TierGuard minTier="pro" featureName="AI Networking Coach"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><CoachPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/my-card" element={<TierGuard minTier="pro" featureName="Digital Business Card"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><MyCardPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/card-creator" element={<TierGuard minTier="pro" featureName="Card Creator"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><CardCreatorPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/kiosk" element={<TierGuard minTier="pro" featureName="Event Kiosk"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><KioskMode /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/presence" element={<TierGuard minTier="pro" featureName="Meeting Presence"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><MeetingToolsPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/signals" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><SignalsPage /></RoleGuard>} />
              <Route path="/dashboard/feedback" element={<RoleGuard allowedRoles={['user', 'business_admin']}><FeedbackPage /></RoleGuard>} />
              <Route path="/dashboard/settings" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><SettingsPage /></RoleGuard>} />
              <Route path="/dashboard/billing" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><BillingPage /></RoleGuard>} />
              <Route path="/dashboard/checkout/:planId" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><CheckoutPage /></RoleGuard>} />
              <Route path="/dashboard/leaderboard" element={<TierGuard minTier="enterprise" featureName="Performance Leaderboard"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><Leaderboard /></RoleGuard></TierGuard>} />
              <Route path="/setup/whatsapp" element={<SetupGuidePage />} />
              <Route path="/marketplace" element={<TierGuard minTier="pro" featureName="Marketplace Apps"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><MarketplacePage /></RoleGuard></TierGuard>} />
              <Route path="/marketplace/:appId" element={<TierGuard minTier="pro" featureName="Marketplace Apps"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><MarketplaceDetailPage /></RoleGuard></TierGuard>} />
              <Route path="/subscription-plan-comparison" element={<GenSubscriptionPlanComparison />} />
              
              {/* Email Marketing Persistence Group */}
              <Route path="/dashboard/email-marketing" element={<TierGuard minTier="pro" featureName="Email Marketing"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><EmailMarketingPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/email-marketing/campaigns" element={<TierGuard minTier="pro" featureName="Email Marketing"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><CampaignListPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/email-marketing/campaigns/new" element={<TierGuard minTier="pro" featureName="Email Marketing"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><CampaignBuilderPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/email-marketing/campaigns/:id" element={<TierGuard minTier="pro" featureName="Email Marketing"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><CampaignDetailPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/email-marketing/templates" element={<TierGuard minTier="pro" featureName="Email Marketing"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><TemplateLibraryPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/email-marketing/templates/new" element={<TierGuard minTier="pro" featureName="Email Marketing"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><TemplateEditorPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/email-marketing/templates/:id" element={<TierGuard minTier="pro" featureName="Email Marketing"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><TemplateEditorPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/email-marketing/lists" element={<TierGuard minTier="pro" featureName="Email Marketing"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><ContactListsPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/email-marketing/lists/:id" element={<TierGuard minTier="pro" featureName="Email Marketing"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><ListDetailPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/email-marketing/automations" element={<TierGuard minTier="pro" featureName="Email Marketing"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><EmailSequencesPage /></RoleGuard></TierGuard>} />
              <Route path="/dashboard/email-marketing/automations/:id" element={<TierGuard minTier="pro" featureName="Email Marketing"><RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><SequenceDetailPage /></RoleGuard></TierGuard>} />
              
              {/* Auto-routes that default to DashboardLayout */}
              {generatedRoutes
                .filter(route => {
                   const adminKeywords = ['super-admin', 'workspaces-organizations', 'ai-model-versioning', 'audit-logs', 'privacy-gdpr', 'advanced-api', 'api-integrations', 'system-health', 'advanced-security', 'integration-health', 'training-tuning'];
                   return !adminKeywords.some(kw => route.path.includes(kw)) && route.path !== 'subscription-plan-comparison';
                })
                .map(route => {
                  const modulePath = `./pages/generated/${route.name}.jsx`;
                  const Component = generatedModules[modulePath]?.default;
                  if (!Component) return null;
                  return <Route key={route.path} path={route.path} element={<Component />} />;
                })
              }
            </Route>

            <Route path="/dashboard/email/sequences" element={<Navigate to="/dashboard/email-marketing/automations" replace />} />

            {/* ── WORKSPACE ADMIN (Persistent Layout) ── */}
            <Route element={<RoleGuard allowedRoles={['business_admin', 'super_admin']}><AdminLayout role="business_admin"/></RoleGuard>}>
              <Route path="/workspace/dashboard" element={<WorkspaceDashboard />} />
              <Route path="/workspace/contacts" element={<WorkspaceContacts />} />
              <Route path="/workspace/members" element={<MembersPage />} />
              <Route path="/workspace/scanner-links" element={<ScannerLinksPage />} />
              <Route path="/workspace/crm-mapping" element={<CrmMappingPage />} />
              <Route path="/workspace/routing-rules" element={<RoutingRulesPage />} />
              <Route path="/workspace/data-policies" element={<DataPoliciesPage />} />
              <Route path="/workspace/data-quality" element={<DataQualityCenterPage />} />
              <Route path="/workspace/analytics" element={<AnalyticsPage />} />
              <Route path="/workspace/org-chart" element={<OrgChartPage />} />
              <Route path="/workspace/campaigns" element={<EmailCampaignsPage />} />
              <Route path="/workspace/billing" element={<BillingPage />} />
              <Route path="/workspace/shared" element={<SharedRolodexPage />} />
              <Route path="/workspace/pipeline" element={<PipelinePage />} />
              <Route path="/workspace/webhooks" element={<WebhookManagement />} />
              <Route path="/workspace/settings" element={<SettingsPage />} />
            </Route>

            {/* ── SUPER ADMIN (Persistent Layout) ── */}
            <Route element={<RoleGuard allowedRoles={['super_admin']}><AdminLayout role="super_admin"/></RoleGuard>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/engine-performance" element={<EnginePerformance />} />
              <Route path="/admin/feedback" element={<SuperAdminFeedbackPage />} />
              <Route path="/admin/incidents" element={<SystemIncidentCenter />} />
              <Route path="/admin/custom-models" element={<CustomModelsPage />} />
              <Route path="/admin/integration-health" element={<JobQueuesPage />} />
              <Route path="/admin/audit-logs" element={<AuditTimelinePage />} />
              <Route path="/admin/job-queues" element={<JobQueuesPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              
              {/* Auto-routes for Super Admin */}
              {generatedRoutes
                .filter(route => {
                   const adminKeywords = ['super-admin', 'workspaces-organizations', 'ai-model-versioning', 'audit-logs', 'privacy-gdpr', 'advanced-api', 'api-integrations', 'system-health', 'advanced-security', 'integration-health', 'training-tuning'];
                   return adminKeywords.some(kw => route.path.includes(kw));
                })
                .map(route => {
                  const modulePath = `./pages/generated/${route.name}.jsx`;
                  const Component = generatedModules[modulePath]?.default;
                  if (!Component) return null;
                  return <Route key={route.path} path={route.path} element={<Component />} />;
                })
              }
            </Route>
          </Routes>
        </ErrorBoundary>
        {import.meta.env.DEV ? <DevTools /> : null}
      </div>
      </NotificationProvider>
    </ThemeProvider>
  );
}
