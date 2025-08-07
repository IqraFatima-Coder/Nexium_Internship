import { ChevronDown, Sparkles, Zap, Languages, Globe } from "lucide-react";

export function Hero() {
  return (
    <div className="relative isolate overflow-hidden min-h-screen flex items-center">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 -z-10">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
        
        {/* Animated floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill-opacity='0.05'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M0 0h30v30H0z' fill='%23667eea'/%3E%3Cpath d='M30 30h30v30H30z' fill='%23667eea'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Enhanced Hero Content */}
          <div className="space-y-8">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Powered by Advanced AI</span>
            </div>

            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Smart Blog
                </span>
                <br />
                <span className="text-foreground">Summarizer</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Transform lengthy articles into concise summaries instantly. 
                Get bilingual insights in English and Urdu with our cutting-edge AI technology.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl glass-card">
                <Zap className="h-6 w-6 text-primary" />
                <span className="font-medium">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl glass-card">
                <Languages className="h-6 w-6 text-primary" />
                <span className="font-medium">Bilingual Support</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl glass-card">
                <Globe className="h-6 w-6 text-primary" />
                <span className="font-medium">Any Website</span>
              </div>
            </div>

            {/* Call to action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#summarize-form"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white btn-gradient rounded-xl hover:scale-[1.02] transition-all duration-300 shadow-lg"
              >
                Start Summarizing
                <ChevronDown className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold glass-card hover:bg-primary/10 rounded-xl transition-all duration-300"
              >
                Learn More
                <span className="ml-2" aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Enhanced Visual Element */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Central animation container */}
            <div className="relative w-80 h-80">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin" style={{animationDuration: "20s"}}></div>
              
              {/* Middle rotating ring */}
              <div className="absolute inset-4 rounded-full border-4 border-secondary/30 animate-spin" style={{animationDuration: "15s", animationDirection: "reverse"}}></div>
              
              {/* Inner pulsing core */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm animate-pulse flex items-center justify-center">
                <div className="text-6xl">🤖</div>
              </div>
              
              {/* Floating icons */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center animate-bounce delay-1000">
                <Languages className="h-6 w-6 text-secondary" />
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center animate-bounce delay-2000">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-bounce delay-3000">
                <Globe className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-muted-foreground" />
      </div>
    </div>
  );
}
