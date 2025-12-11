import { useState } from "react";
import { Header } from "@/components/Header";
import { CodeInput } from "@/components/CodeInput";
import { AgentCard } from "@/components/AgentCard";
import { DocumentationOutput } from "@/components/DocumentationOutput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Boxes, GitBranch, Database, Network, FileText } from "lucide-react";

type AgentStatus = "idle" | "running" | "complete";

interface AgentState {
  structure: AgentStatus;
  dataflow: AgentStatus;
  dependencies: AgentStatus;
  api: AgentStatus;
  readme: AgentStatus;
}

interface AnalysisResults {
  structure?: string;
  dataflow?: string;
  dependencies?: string;
  api?: string;
  readme?: string;
}

const AGENTS = [
  { id: "structure" as const, icon: Boxes, title: "Code Structure Agent", description: "Analyzes components, classes, and organization" },
  { id: "dataflow" as const, icon: Network, title: "Data Flow Agent", description: "Traces data inputs, outputs, and transformations" },
  { id: "dependencies" as const, icon: GitBranch, title: "Dependency Agent", description: "Maps external and internal dependencies" },
  { id: "api" as const, icon: Database, title: "API Analyst Agent", description: "Documents endpoints and request/response formats" },
  { id: "readme" as const, icon: FileText, title: "Documentation Generator", description: "Creates comprehensive README documentation" },
];

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [agentStates, setAgentStates] = useState<AgentState>({
    structure: "idle",
    dataflow: "idle",
    dependencies: "idle",
    api: "idle",
    readme: "idle",
  });
  const [results, setResults] = useState<AnalysisResults>({});

  const runAgent = async (code: string, type: keyof AgentState): Promise<string> => {
    setAgentStates(prev => ({ ...prev, [type]: "running" }));
    
    const { data, error } = await supabase.functions.invoke("analyze-code", {
      body: { code, analysisType: type },
    });

    if (error) throw error;
    
    setAgentStates(prev => ({ ...prev, [type]: "complete" }));
    return data.analysis;
  };

  const handleAnalyze = async (code: string) => {
    setIsLoading(true);
    setResults({});
    setAgentStates({
      structure: "idle",
      dataflow: "idle",
      dependencies: "idle",
      api: "idle",
      readme: "idle",
    });

    try {
      // Run analysis agents concurrently (first 4)
      const analysisTypes: (keyof AgentState)[] = ["structure", "dataflow", "dependencies", "api"];
      
      const analysisPromises = analysisTypes.map(type => 
        runAgent(code, type).then(analysis => ({ type, analysis }))
      );

      const analysisResults = await Promise.all(analysisPromises);
      
      const newResults: AnalysisResults = {};
      analysisResults.forEach(({ type, analysis }) => {
        newResults[type] = analysis;
      });
      setResults(newResults);

      // Now generate README based on all analysis
      const combinedAnalysis = `
Code Analysis Summary:

## Structure Analysis
${newResults.structure}

## Data Flow Analysis  
${newResults.dataflow}

## Dependency Analysis
${newResults.dependencies}

## API Analysis
${newResults.api}

Original Code:
${code}
`;
      
      const readme = await runAgent(combinedAnalysis, "readme");
      setResults(prev => ({ ...prev, readme }));

      toast.success("Documentation generated successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze code. Please try again.");
      // Reset failed agents
      setAgentStates(prev => {
        const reset = { ...prev };
        Object.keys(reset).forEach(key => {
          if (reset[key as keyof AgentState] === "running") {
            reset[key as keyof AgentState] = "idle";
          }
        });
        return reset;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="max-w-5xl mx-auto px-4 pb-16">
          {/* Hero Section */}
          <section className="text-center py-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">AI-Powered</span> Documentation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multi-agent system that analyzes your codebase and generates comprehensive documentation. 
              <span className="text-primary font-medium"> 100% Free</span> — powered by Google Gemini.
            </p>
          </section>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Code Input */}
            <div className="lg:col-span-2">
              <CodeInput onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>

            {/* Right: Agent Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Analysis Agents
              </h3>
              {AGENTS.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  icon={agent.icon}
                  title={agent.title}
                  description={agent.description}
                  status={agentStates[agent.id]}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Results Section */}
          {hasResults && (
            <section className="mt-12">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Generated Documentation
              </h3>
              <DocumentationOutput results={results} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
