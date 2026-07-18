'use client';

import { usePathname, useRouter } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isRoot = pathname === '/';

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="relative flex h-10 items-center px-2">
        <div className="flex items-center gap-1 min-w-0">
          {!isRoot && (
            <button
              onClick={() => router.back()}
              aria-label="返回"
              className="shrink-0 hover:opacity-80 transition-opacity p-1 -ml-1 text-muted-foreground hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
              </svg>
            </button>
          )}
          <a href="/" className="shrink-0 hover:opacity-80 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0"
              alt="Home"
              className="h-6 w-6 rounded-full"
            />
          </a>
        </div>
      </div>
    </nav>
  );
}
