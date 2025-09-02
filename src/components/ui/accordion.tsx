import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface AccordionItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface AccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ 
  className = '', 
  children 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
};

export const AccordionItem: React.FC<AccordionItemProps> = ({ 
  className = '', 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`border rounded-lg ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AccordionTrigger) {
            return React.cloneElement(child as React.ReactElement<AccordionTriggerProps & { isOpen?: boolean; onToggle?: () => void }>, { 
              isOpen, 
              onToggle: handleToggle
            });
          }
          if (child.type === AccordionContent) {
            return React.cloneElement(child as React.ReactElement<AccordionContentProps & { isOpen?: boolean }>, { 
              isOpen
            });
          }
        }
        return child;
      })}
    </div>
  );
};

export const AccordionTrigger: React.FC<AccordionTriggerProps & { isOpen?: boolean; onToggle?: () => void }> = ({ 
  className = '', 
  children,
  isOpen = false,
  onToggle
}) => {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors ${className}`}
    >
      <span className="font-medium">{children}</span>
      <ChevronDown 
        className={`w-5 h-5 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} 
      />
    </button>
  );
};

export const AccordionContent: React.FC<AccordionContentProps & { isOpen?: boolean }> = ({ 
  className = '', 
  children,
  isOpen = false
}) => {
  return (
    <div 
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className={`px-6 pb-6 ${className}`}>
        {children}
      </div>
    </div>
  );
};