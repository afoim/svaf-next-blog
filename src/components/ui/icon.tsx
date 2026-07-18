'use client';

import { Icon as IconifyIcon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface Props {
  icon: string;
  className?: string;
}

export function Icon({ icon, className }: Props) {
  return (
    <span className={cn('inline-flex items-center justify-center shrink-0 leading-none', className)}>
      <IconifyIcon icon={icon} className="size-full block" />
    </span>
  );
}
