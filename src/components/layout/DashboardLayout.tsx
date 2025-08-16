import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Video, 
  FolderOpen, 
  Loader, 
  BarChart3, 
  Settings, 
  CreditCard,
  Menu,
  Search,
  Camera,
  Bell,
  User,
  Moon,
  Sun,
  Plus,
  Upload,
  Zap
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { NavigationLink } from '@/types/dashboard.types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  currentPath = '/dashboard' 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const navigationLinks: NavigationLink[] = [
    {
      label: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />,
      isActive: currentPath === '/' || currentPath === '/dashboard'
    },
    {
      label: "Projects",
      href: "/projects",
      icon: <Video className="h-5 w-5" />,
      badge: 12,
      isActive: currentPath === '/projects'
    },
    {
      label: "Media Library",
      href: "/media",
      icon: <FolderOpen className="h-5 w-5" />,
      isActive: currentPath === '/media'
    },
    {
      label: "Generation Queue",
      href: "/queue",
      icon: <Loader className="h-5 w-5" />,
      badge: 3,
      isActive: currentPath === '/queue'
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      isActive: currentPath === '/analytics'
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      isActive: currentPath === '/settings'
    },
    {
      label: "Billing",
      href: "/billing",
      icon: <CreditCard className="h-5 w-5" />,
      badge: "!",
      isActive: currentPath === '/billing'
    }
  ];

  const handleNewProject = () => {
    // Navigate to projects page or trigger new project modal
    window.location.href = '/projects';
  };

  const handleUploadMedia = () => {
    // Navigate to media library page
    window.location.href = '/media';
  };

  const handleGenerateVideo = () => {
    // Navigate to main page where video generation happens
    window.location.href = '/';
  };

  const quickActions = [
    {
      label: "New Project",
      icon: <Plus className="h-4 w-4" />,
      onClick: handleNewProject,
      variant: 'primary' as const
    },
    {
      label: "Upload Media",
      icon: <Upload className="h-4 w-4" />,
      onClick: handleUploadMedia,
      variant: 'secondary' as const
    },
    {
      label: "Generate Video",
      icon: <Zap className="h-4 w-4" />,
      onClick: handleGenerateVideo,
      variant: 'outline' as const
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Main Layout Container */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transform bg-card-bg border-r border-gray-700 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex h-full flex-col">
            {/* Sidebar Header with Logo */}
            <div className="flex items-center h-16 px-4 border-b border-gray-700 bg-gradient-to-r from-card-bg to-card-bg/80">
              <a href="/" className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/60 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-text-primary">PhotoMemory AI</span>
                  <span className="text-xs text-text-secondary">Dashboard</span>
                </div>
              </a>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4" role="list">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setSidebarOpen(false); // Close mobile sidebar on navigation
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full text-left group",
                    "hover:bg-card-hover focus:bg-card-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card-bg",
                    link.isActive 
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md" 
                      : "text-text-primary hover:text-white"
                  )}
                  role="listitem"
                  aria-current={link.isActive ? 'page' : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "transition-colors duration-200",
                      link.isActive ? "text-white" : "text-text-secondary group-hover:text-text-primary"
                    )}>
                      {link.icon}
                    </div>
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className={cn(
                      "ml-auto px-2 py-1 text-xs font-medium rounded-full transition-colors duration-200",
                      link.isActive 
                        ? "bg-white/20 text-white"
                        : typeof link.badge === 'string' && link.badge === '!'
                        ? "bg-red-500 text-white"
                        : "bg-gray-600 text-gray-300"
                    )}>
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="border-t border-gray-700 p-4 bg-card-bg/50">
              <h3 className="text-sm font-medium text-text-secondary mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    size="sm"
                    className="w-full justify-start transition-all duration-200 hover:scale-[1.02]"
                    onClick={action.onClick}
                    leftIcon={action.icon}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-dark-bg/95 border-b border-gray-700 backdrop-blur-md supports-[backdrop-filter]:bg-dark-bg/60 shadow-sm">
            <div className="flex h-16 items-center justify-between px-6">
              {/* Left side - Mobile menu + Title */}
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden hover:bg-card-hover"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {/* Page Title */}
                <div>
                  <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
                  <span className="hidden sm:block text-sm text-text-secondary">Welcome back!</span>
                </div>
              </div>

              {/* Right side - Essential actions only */}
              <div className="flex items-center space-x-2">
                {/* Search */}
                <div className="hidden md:block w-64">
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full bg-card-bg/50 border-gray-600 focus:border-primary focus:ring-primary/20"
                    leftIcon={<Search className="h-4 w-4 text-text-secondary" />}
                  />
                </div>

                {/* Mobile search button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden hover:bg-card-hover"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative hover:bg-card-hover"
                  aria-label="View notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full">
                    <span className="sr-only">New notifications</span>
                  </span>
                </Button>

                {/* User menu */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-card-hover"
                  aria-label="User menu"
                >
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main 
            id="main-content"
            className="flex-1 overflow-y-auto bg-dark-bg"
            role="main"
          >
            <div className="p-6 space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DashboardLayout;