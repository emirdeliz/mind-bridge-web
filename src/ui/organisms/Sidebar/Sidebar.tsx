import { useRouter } from 'next/router';
import { Icon, Title } from '@atoms';
import { ReactNode, useState, useEffect, useMemo } from 'react';
import { useI18n } from '@i18n';

export interface SidebarItem {
  to: string;
  label: string;
  icon?: ReactNode;
  submenu?: Array<Omit<SidebarItem, 'icon'>>;
}

interface SidebarProps {
  items: Array<SidebarItem>;
}

export const Sidebar = ({ items }: SidebarProps) => {
  const router = useRouter();
  const { pathname } = router;
  const { t } = useI18n();

  // Find which menu should be open based on current pathname
  const findActiveMenuId = useMemo(() => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.submenu) {
        for (const subitem of item.submenu) {
          if (pathname === subitem.to || pathname.startsWith(subitem.to + '/')) {
            return `menu-${i}`;
          }
        }
      }
    }
    return null;
  }, [items, pathname]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(findActiveMenuId);

  // Update open menu when route changes
  useEffect(() => {
    if (findActiveMenuId) {
      setOpenMenuId(findActiveMenuId);
    }
  }, [findActiveMenuId]);

  const handleMenuToggle = (menuId: string) => {
    setOpenMenuId(current => current === menuId ? null : menuId);
  };

  return (
    <div className="h-full bg-sidebar text-sidebar flex flex-col border-r-1 border-sidebar shadow-lg m-0 p-0">
      {/* Header */}
      <div className="p-4 border-b border-sidebar bg-sidebar-header text-left font-bold m-0">
        <div className="text-primary-theme font-bold text-xl font-poppins">MENU</div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 bg-sidebar m-0">
        {items.map((item, index) => {
          const menuId = `menu-${index}`;
          const isMenuOpen = openMenuId === menuId;
          const hasActiveSubmenuItem = item.submenu?.some(
            sub => pathname === sub.to || pathname.startsWith(sub.to + '/')
          );

          return (
            <div key={item.to} className="bg-transparent m-0 p-0">
              <div
                className={`flex items-center p-3 cursor-pointer transition-all duration-150 ease-in-out relative m-0 border-l-3 ${
                  hasActiveSubmenuItem
                    ? 'bg-primary-theme-50 border-l-primary-theme'
                    : 'bg-transparent border-l-transparent hover:bg-sidebar-hover hover:border-l-primary-theme'
                }`}
                onClick={() => handleMenuToggle(menuId)}
              >
                <div className={`mr-3 text-base w-5 text-center flex items-center justify-center m-0 p-0 ${
                  hasActiveSubmenuItem ? 'text-primary-theme' : 'text-gray-500'
                }`}>
                  {item.icon}
                </div>
                <div className="flex-1 m-0 p-0">
                  <Title s3>{t(item.label)}</Title>
                </div>
                <Icon.RightOpen xxs rotate90={isMenuOpen} />
              </div>

              {/* Submenu */}
              {isMenuOpen && item.submenu && (
                <div className="bg-sidebar-submenu border-t border-sidebar m-0 p-0">
                  {item.submenu.map((subitem) => {
                    const isActive = pathname === subitem.to || pathname.startsWith(subitem.to + '/');
                    return (
                      <div
                        key={subitem.to}
                        className={`px-4 py-2 pl-12 cursor-pointer transition-colors duration-150 relative m-0 text-sm ${
                          isActive
                            ? 'bg-primary-theme-100 border-l-3 border-l-primary-theme text-primary-theme-dark font-medium'
                            : 'bg-transparent text-gray-600 hover:bg-sidebar-submenu-hover hover:border-l-3 hover:border-l-primary-theme'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(subitem.to);
                        }}
                      >
                        <Title s3 fw3={isActive}>
                          {t(subitem.label)}
                        </Title>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}