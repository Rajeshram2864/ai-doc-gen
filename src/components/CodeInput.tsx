import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileCode2, Github, Sparkles, Loader2 } from "lucide-react";

interface CodeInputProps {
  onAnalyze: (code: string) => void;
  isLoading: boolean;
}

export const CodeInput = ({ onAnalyze, isLoading }: CodeInputProps) => {
  const [code, setCode] = useState("");

  const handleSubmit = () => {
    if (code.trim()) {
      onAnalyze(code);
    }
  };

  return (
    <div className="w-full space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="glass rounded-lg p-1">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
          <FileCode2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono text-muted-foreground">Paste your code</span>
        </div>
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`// Paste your code here...\n// Supports any language: Python, JavaScript, TypeScript, Go, Rust, etc.\n\nfunction example() {\n  return "Hello, AI Doc Gen!";\n}`}
          className="min-h-[300px] font-mono text-sm bg-transparent border-0 resize-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={handleSubmit} 
          disabled={!code.trim() || isLoading}
          className="flex-1 h-12 text-base font-semibold glow-primary transition-all hover:scale-[1.02]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Documentation
            </>
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Powered by free AI • Google Gemini 2.5 Flash
      </p>
    </div>
  );
};
