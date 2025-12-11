import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  code: string;
  analysisType: "structure" | "dataflow" | "dependencies" | "api" | "readme";
}

const SYSTEM_PROMPTS: Record<string, string> = {
  structure: `You are a code structure analyst. Analyze the provided code and identify:
- Main components/modules
- Class hierarchy and inheritance
- Function signatures and their purposes
- Code organization patterns
Return a structured markdown analysis with clear sections.`,

  dataflow: `You are a data flow analyst. Analyze the provided code and identify:
- Data inputs and outputs
- State management patterns
- Data transformations
- Side effects and external dependencies
Return a structured markdown analysis with clear sections.`,

  dependencies: `You are a dependency analyst. Analyze the provided code and identify:
- External dependencies/imports
- Internal module dependencies
- Dependency injection patterns
- Potential circular dependencies
Return a structured markdown analysis with clear sections.`,

  api: `You are an API analyst. Analyze the provided code and identify:
- API endpoints and routes
- Request/response formats
- Authentication patterns
- Error handling approaches
Return a structured markdown analysis with clear sections.`,

  readme: `You are a technical documentation expert. Based on the provided code analysis, generate a comprehensive README.md that includes:
# Project Name
Brief description

## Features
- Key feature 1
- Key feature 2

## Installation
Step by step installation guide

## Usage
Code examples and usage patterns

## API Reference
If applicable, document APIs

## Architecture
High-level architecture overview

## Contributing
Guidelines for contributors

## License
License information

Make it professional, clear, and developer-friendly.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, analysisType }: AnalysisRequest = await req.json();

    if (!code || !analysisType) {
      return new Response(
        JSON.stringify({ error: "Code and analysisType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = SYSTEM_PROMPTS[analysisType];
    if (!systemPrompt) {
      return new Response(
        JSON.stringify({ error: "Invalid analysis type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${analysisType} analysis for code of length ${code.length}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze the following code:\n\n${code}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze code");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "No analysis generated";

    console.log(`Analysis complete for ${analysisType}`);

    return new Response(
      JSON.stringify({ analysis, analysisType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-code function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
