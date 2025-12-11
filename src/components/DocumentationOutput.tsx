import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Check, FileText, GitBranch, Database, Network } from "lucide-react";
import { toast } from "sonner";

interface AnalysisResult {
  structure?: string;
  dataflow?: string;
  dependencies?: string;
  api?: string;
  readme?: string;
}

interface DocumentationOutputProps {
  results: AnalysisResult;
}

export const DocumentationOutput = ({ results }: DocumentationOutputProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const tabs = [
    { id: "readme", label: "README", icon: FileText, content: results.readme },
    { id: "structure", label: "Structure", icon: GitBranch, content: results.structure },
    { id: "dataflow", label: "Data Flow", icon: Network, content: results.dataflow },
    { id: "dependencies", label: "Dependencies", icon: Database, content: results.dependencies },
    { id: "api", label: "API", icon: FileText, content: results.api },
  ].filter(tab => tab.content);

  if (tabs.length === 0) return null;

  return (
    <div className="w-full glass rounded-lg overflow-hidden animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <Tabs defaultValue={tabs[0]?.id} className="w-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-3 py-1.5 text-xs font-medium"
              >
                <tab.icon className="w-3.5 h-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(results.readme || tabs[0]?.content || "")}
              className="h-8 px-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(results.readme || "", "README.md")}
              className="h-8 px-2"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="m-0">
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <pre className="font-mono text-sm whitespace-pre-wrap text-foreground/90">
                {tab.content}
              </pre>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
