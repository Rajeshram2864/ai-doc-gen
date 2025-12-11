import { FileCode2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="w-full py-6 px-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <FileCode2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">AI Doc Gen</h1>
            <p className="text-xs text-muted-foreground">Multi-agent documentation generator</p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
          <a href="https://github.com/Rajeshram2864/ai-doc-gen" target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4 mr-2" />
            Original Project
          </a>
        </Button>
      </div>
    </header>
  );
};
