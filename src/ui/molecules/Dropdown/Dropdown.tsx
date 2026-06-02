import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GenericObject } from '@types';

export interface DropdownProps<T extends GenericObject> {
  children?: ReactNode;
  options: Array<T>;
  placeholder?: string;
  onSelect?: (value: T | undefined) => void;
  disabled?: boolean;
  error?: boolean;
  loading?: boolean;
  keyOfLabel?: keyof T;
  keyOfLabelCompost?: keyof T;
  onCustomRenderValue?: (value?: T) => ReactNode;
  onCustomRenderOption?: (option: T) => ReactNode;
  value?: T;
  onSearch?: (searchTerm: string) => void;
  hasLoadMore?: boolean;
  hasError?: boolean;
  onLoadNewPage?: () => void;
  allowWrap?: boolean;
}

export const Dropdown = <T extends GenericObject>({
  children,
  options,
  placeholder = 'Selecione uma opção',
  onSelect,
  disabled = false,
  error = false,
  loading = false,
  keyOfLabel,
  keyOfLabelCompost,
  onCustomRenderValue,
  onCustomRenderOption,
  value,
  onSearch,
  hasLoadMore,
  hasError,
  onLoadNewPage,
  allowWrap = false,
  ...props
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTimeout(() => {
          setIsOpen(false);
        }, 300);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      // Calcular posição inicial
      let top = rect.bottom + scrollTop;
      let left = rect.left + scrollLeft;
      let width = rect.width;
      
      // Verificar se o menu cabe na tela
      const menuHeight = 240; // max-height do menu
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Se o menu vai ficar fora da tela na parte inferior, posicionar acima
      if (rect.bottom + menuHeight > windowHeight) {
        top = rect.top + scrollTop - menuHeight;
      }
      
      // Se o menu vai ficar fora da tela na parte direita, ajustar
      if (rect.left + width > windowWidth) {
        left = windowWidth - width - 10; // 10px de margem
      }
      
      // Se o menu vai ficar fora da tela na parte esquerda, ajustar
      if (left < 10) {
        left = 10;
      }
      
      setMenuPosition({
        top,
        left,
        width
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !hasLoadMore || loading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          console.log('Intersection Observer: Carregando mais dados...'); // Debug
          onLoadNewPage?.();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [isOpen, hasLoadMore, loading, onLoadNewPage]);

  const handleSelect = (option: T) => {
    setIsOpen(false);
    onSelect?.(option);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch?.(term);
  };

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !hasLoadMore || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px de margem para melhor detecção

    if (isNearBottom) {
      console.log('Scroll infinito: Carregando mais dados...'); // Debug
      onLoadNewPage?.();
    }
  };

  const getDisplayValue = () => {
    if (onCustomRenderValue && value) {
      return onCustomRenderValue(value);
    }
    
    if (value) {
      if (keyOfLabelCompost) {
        // Processa propriedades aninhadas como "user.name"
        const keys = String(keyOfLabelCompost).split('.');
        let displayValue: any = value;
        
        for (const key of keys) {
          if (displayValue && typeof displayValue === 'object' && key in displayValue) {
            displayValue = displayValue[key];
          } else {
            displayValue = undefined;
            break;
          }
        }
        
        return displayValue ? String(displayValue) : 'N/A';
      }
      if (keyOfLabel) {
        return String(value[keyOfLabel]);
      }
      return String(value);
    }
    
    return placeholder;
  };

  const getOptionLabel = (option: T): ReactNode => {
    if (onCustomRenderOption) {
      return onCustomRenderOption(option);
    }
    if (keyOfLabelCompost) {
      // Processa propriedades aninhadas como "user.name"
      const keys = String(keyOfLabelCompost).split('.');
      let value: any = option;

      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }

      return value ? String(value) : 'N/A';
    }
    if (keyOfLabel) {
      return String(option[keyOfLabel]);
    }
    return String(option);
  };

  const dropdownClasses = [
    'relative inline-block w-full',
    'font-poppins',
  ].join(' ');

  const buttonClasses = [
    'w-full',
    'dropdown-button',
    // Classe CSS para estilos padronizados
    'text-left text-gray-700',
    'input-focus-primary',
    'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
    'transition-all duration-200',
    hasError && 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200',
    !hasError && 'bg-white',
    allowWrap && 'dropdown-button-wrap',
  ].filter(Boolean).join(' ');

  const dropdownMenuClasses = [
    'dropdown-menu', // Classe CSS para estilos padronizados
    'w-full mt-1',
  ].join(' ');

  const optionClasses = [
    'px-4 py-2 cursor-pointer',
    'hover:bg-primary-theme-50 hover:text-primary-theme-dark',
    'transition-colors duration-150',
  ].join(' ');

  const renderDropdownMenu = () => {
    if (!isOpen) return null;

    const menuStyle = {
      position: 'absolute' as const,
      top: `${menuPosition.top}px`,
      left: `${menuPosition.left}px`,
      width: `${menuPosition.width}px`,
      zIndex: 10000,
    };

    const menuContent = (
      <div className={dropdownMenuClasses} style={menuStyle}>
        {/* Campo de busca */}
        {onSearch && (
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-primary"
              autoFocus
            />
          </div>
        )}
        
        <div 
          ref={scrollContainerRef}
          className="max-h-60 overflow-y-auto"
          onScroll={handleScroll}
        >
          {options.map((option, index) => (
            <div
              key={index}
              className={optionClasses}
              onClick={() => handleSelect(option)}
            >
              {getOptionLabel(option)}
            </div>
          ))}
          
          {hasLoadMore && (
            <div 
              ref={sentinelRef}
              id="scroll-sentinel"
              className="h-1"
              style={{ minHeight: '1px' }}
            />
          )}
          
          {/* Indicador de carregamento */}
          {loading && hasLoadMore && (
            <div className="px-4 py-2 text-center text-gray-500 text-sm">
              Carregando...
            </div>
          )}
        </div>
      </div>
    );

    // Renderiza o menu usando portal para fora da modal
    return createPortal(menuContent, document.body);
  };

  return (
    <div className={dropdownClasses} ref={dropdownRef}>
      <button
        type="button"
        className={buttonClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
      >
        <span className={`text-left ${allowWrap ? 'dropdown-text-wrap' : 'dropdown-text-truncate'}`}>
          {getDisplayValue()}
        </span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {renderDropdownMenu()}
    </div>
  );
};
