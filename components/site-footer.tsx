import { Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-text-dim/20 px-6 py-8 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <span className="font-mono">
            Scout<span className="text-text-dim">Daily</span>
          </span>
          <span className="text-text-dim">
            Signals from HN, Reddit, GitHub &amp; Product Hunt
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/leonardomjq/scout-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors inline-flex items-center gap-1.5"
          >
            <Github className="size-3.5" />
            Source
          </a>
        </div>
      </div>
    </footer>
  );
}
