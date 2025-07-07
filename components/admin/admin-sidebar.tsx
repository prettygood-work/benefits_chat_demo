'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, Building, Users, Settings, LineChart, FileText, 
  Database, Globe, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCollapsed: boolean;
}

function NavItem({ href, label, icon, isActive, isCollapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
        isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white",
        isCollapsed && "justify-center px-2"
      )}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { href: '/admin/tenants', label: 'Tenants', icon: <Building className="h-5 w-5" /> },
    { href: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
    { href: '/admin/analytics', label: 'Analytics', icon: <LineChart className="h-5 w-5" /> },
    { href: '/admin/documents', label: 'Documents', icon: <FileText className="h-5 w-5" /> },
    { href: '/admin/database', label: 'Database', icon: <Database className="h-5 w-5" /> },
    { href: '/admin/domains', label: 'Domains', icon: <Globe className="h-5 w-5" /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];
  
  return (
    <aside className={cn(
      "bg-gray-900 text-white transition-all duration-300",
      isCollapsed ? "w-[60px]" : "w-[240px]"
    )}>
      <div className="flex h-16 items-center border-b border-gray-800 px-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">Admin Portal</h2>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("ml-auto text-gray-400", isCollapsed && "mx-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <nav className="space-y-1 p-2">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </aside>
  );
}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </aside>
  );
}
            >
              <FileText className="h-5 w-5 mr-3" />
              Documents
            </Link>
          </li>
          
          <li className="pt-4 mt-4 border-t border-gray-800">
            <Link 
              href="/admin/settings" 
              className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                isActive('/admin/settings') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </Link>
          </li>
          
          <li>
            <Link 
              href="/" 
              className="flex items-center px-4 py-2.5 rounded-md transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Home className="h-5 w-5 mr-3" />
              Back to App
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
