import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout  from './layouts/DashboardLayout';
import AdminLayout      from './layouts/AdminLayout';
import RoleGuard        from './components/RoleGuard';
import DevTools         from './components/DevTools';
import CommandPalette   from './components/CommandPalette';
import ActivityTracker  from './components/ActivityTracker';
import { useRole } from './context/RoleContext';
import { getStoredToken, resolveHomeRoute, safeReadStoredUser } from './utils/auth';

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
import PublicAnalyticsPage from './pages/PublicAnalyticsPage';
import ApiDocsPage from './pages/ApiDocsPage';
import PublicProfile from './pages/generated/PublicProfile';

// User Dashboard Pages
import ScanPage from './pages/ScanPage';
import ContactsPage from './pages/ContactsPage';
import SettingsPage from './pages/SettingsPage';
import MarketplacePage from './pages/MarketplacePage';
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

// Email Marketing Pages
import EmailMarketingPage from './pages/email/EmailMarketingPage';
import CampaignListPage from './pages/email/CampaignListPage';
import CampaignBuilderPage from './pages/email/CampaignBuilderPage';
import CampaignDetailPage from './pages/email/CampaignDetailPage';
import TemplateLibraryPage from './pages/email/TemplateLibraryPage';
import ContactListsPage from './pages/email/ContactListsPage';
import ListDetailPage from './pages/email/ListDetailPage';
import EmailSequencesPage from './pages/email/EmailSequencesPage';

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
  const token = getStoredToken();
  if (!token) return <LandingPage />;
  const storedUser = safeReadStoredUser();
  const home = resolveHomeRoute(storedUser || { role: 'user' });
  return <Navigate to={home} replace />;
};

export default function App() {
  const { isAuthReady } = useRole();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e131f] text-[#dde2f3]">
        <p className="text-sm font-semibold tracking-wide">Loading IntelliScan...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0e131f] text-[#dde2f3] min-h-screen selection:bg-indigo-600 selection:text-white">
    <ActivityTracker />
    <CommandPalette />
      <Routes>
      {/* ── PUBLIC ROUTES WITHOUT PUBLICLAYOUT BLOCK ── */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/public-stats" element={<PublicAnalyticsPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/api-docs" element={<ApiDocsPage />} />
      <Route path="/u/:slug" element={<PublicProfile />} />
      <Route path="/book/:slug" element={<BookingPage />} />
      
      <Route path="/scan/:token" element={<PageStub title="Public Scanner" />} />

      {/* ── NORMAL USER ROUTES ── */}
      <Route path="/dashboard"              element={<Navigate to="/dashboard/scan" replace />} />
      <Route path="/dashboard/scan"         element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><ScanPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/contacts"     element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><ContactsPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/calendar"     element={<RoleGuard allowedRoles={['business_admin', 'super_admin']}><DashboardLayout><CalendarPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/calendar/availability"  element={<RoleGuard allowedRoles={['business_admin', 'super_admin']}><DashboardLayout><AvailabilityPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/calendar/booking-links" element={<RoleGuard allowedRoles={['business_admin', 'super_admin']}><DashboardLayout><BookingLinksPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/events"       element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><EventsPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/drafts"       element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><DraftsPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/coach"        element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><CoachPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/my-card"      element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><MyCardPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/card-creator" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><CardCreatorPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/kiosk"        element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><KioskMode /></RoleGuard>} />
      <Route path="/dashboard/presence"     element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><MeetingToolsPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/signals"      element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><SignalsPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/feedback"     element={<RoleGuard allowedRoles={['user', 'business_admin']}><DashboardLayout><FeedbackPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/settings"     element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><SettingsPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/leaderboard"  element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><Leaderboard /></DashboardLayout></RoleGuard>} />
      <Route path="/marketplace"            element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><MarketplacePage /></DashboardLayout></RoleGuard>} />

      {/* ── EMAIL MARKETING (ENTERPRISE ONLY) ── */}
      <Route path="/dashboard/email-marketing"              element={<RoleGuard allowedRoles={['business_admin', 'super_admin']}><DashboardLayout><EmailMarketingPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/email-marketing/campaigns"     element={<RoleGuard allowedRoles={['business_admin', 'super_admin']}><DashboardLayout><CampaignListPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/email-marketing/campaigns/new" element={<RoleGuard allowedRoles={['business_admin', 'super_admin']}><DashboardLayout><CampaignBuilderPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/email-marketing/campaigns/:id" element={<RoleGuard allowedRoles={['business_admin', 'super_admin']}><DashboardLayout><CampaignDetailPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/email-marketing/templates"      element={<RoleGuard allowedRoles={['business_admin', 'super_admin']}><DashboardLayout><TemplateLibraryPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/email-marketing/lists"          element={<RoleGuard allowedRoles={['business_admin', 'super_admin']}><DashboardLayout><ContactListsPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/email-marketing/lists/:id"      element={<RoleGuard allowedRoles={['business_admin', 'super_admin']}><DashboardLayout><ListDetailPage /></DashboardLayout></RoleGuard>} />
      <Route path="/dashboard/email/sequences"                element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><DashboardLayout><EmailSequencesPage /></DashboardLayout></RoleGuard>} />

      {/* ── BUSINESS ADMIN ROUTES ── */}
      <Route path="/workspace/dashboard"     element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><WorkspaceDashboard /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/contacts"      element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><WorkspaceContacts /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/members"       element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><MembersPage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/scanner-links" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><ScannerLinksPage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/crm-mapping"   element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><CrmMappingPage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/routing-rules" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><RoutingRulesPage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/data-policies" element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><DataPoliciesPage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/data-quality"  element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><DataQualityCenterPage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/analytics"     element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><AnalyticsPage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/org-chart"     element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><OrgChartPage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/campaigns"     element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><EmailCampaignsPage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/billing"       element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><BillingPage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/shared"        element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><SharedRolodexPage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/pipeline"      element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><PipelinePage /></AdminLayout></RoleGuard>} />
      <Route path="/workspace/webhooks"      element={<RoleGuard allowedRoles={['user', 'business_admin', 'super_admin']}><AdminLayout role="business_admin"><WebhookManagement /></AdminLayout></RoleGuard>} />

      {/* ── SUPER ADMIN ROUTES ── */}
      <Route path="/admin/dashboard"          element={<RoleGuard allowedRoles={['super_admin']}><AdminLayout role="super_admin"><AdminDashboard /></AdminLayout></RoleGuard>} />
      <Route path="/admin/engine-performance" element={<RoleGuard allowedRoles={['super_admin']}><AdminLayout role="super_admin"><EnginePerformance /></AdminLayout></RoleGuard>} />
      <Route path="/admin/feedback"           element={<RoleGuard allowedRoles={['super_admin']}><AdminLayout role="super_admin"><SuperAdminFeedbackPage /></AdminLayout></RoleGuard>} />
      <Route path="/admin/incidents"          element={<RoleGuard allowedRoles={['super_admin']}><AdminLayout role="super_admin"><SystemIncidentCenter /></AdminLayout></RoleGuard>} />
      <Route path="/admin/custom-models"      element={<RoleGuard allowedRoles={['super_admin']}><AdminLayout role="super_admin"><CustomModelsPage /></AdminLayout></RoleGuard>} />
      <Route path="/admin/integration-health" element={<RoleGuard allowedRoles={['super_admin']}><AdminLayout role="super_admin"><JobQueuesPage /></AdminLayout></RoleGuard>} />
      <Route path="/admin/job-queues"         element={<RoleGuard allowedRoles={['super_admin']}><AdminLayout role="super_admin"><JobQueuesPage /></AdminLayout></RoleGuard>} />

      {/* ── EXPLICITLY ROUTED GENERATED PAGES (correct layout) ── */}
      <Route path="/subscription-plan-comparison" element={<RequireAuth><DashboardLayout><GenSubscriptionPlanComparison /></DashboardLayout></RequireAuth>} />

      {/* ── MASS MIGRATED AUTO-ROUTES ── */}
      {generatedRoutes
        .filter(route => route.path !== 'subscription-plan-comparison') // Already handled above
        .map(route => {
          const modulePath = `./pages/generated/${route.name}.jsx`;
          const Component = generatedModules[modulePath]?.default;
          if (!Component) return null;
          // Super-admin-only pages keep AdminLayout; all others default to DashboardLayout
          const adminKeywords = [
            'super-admin', 
            'workspaces-organizations', 
            'ai-model-versioning', 
            'audit-logs', 
            'privacy-gdpr', 
            'advanced-api', 
            'api-integrations',
            'system-health',
            'advanced-security',
            'integration-health',
            'training-tuning'
          ];
          const isSuperAdminPage = adminKeywords.some(kw => route.path.includes(kw));
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                isSuperAdminPage
                  ? <RoleGuard allowedRoles={['super_admin']}><AdminLayout role="super_admin"><Component /></AdminLayout></RoleGuard>
                  : <RequireAuth><DashboardLayout><Component /></DashboardLayout></RequireAuth>
              }
            />
          );
        })
      }
    </Routes>
      <DevTools />
    </div>
  );
}
