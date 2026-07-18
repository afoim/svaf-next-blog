export function Footer() {
  return (
    <footer className="mt-8 border-t pt-6 pb-8">
      <div className="container mx-auto flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} 二叉树树</p>
        <p className="text-xs text-muted-foreground/60">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            皖ICP备2025099787号-2
          </a>
        </p>
      </div>
    </footer>
  );
}
