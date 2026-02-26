import { Component } from "react";
import type { ErrorInfo, PropsWithChildren, ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

type ErrorBoundaryProps = PropsWithChildren<{
  fallback?: ReactNode;
}>;

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));
    return { hasError: true, error: normalizedError };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              An unexpected error occurred. You can try reloading or go back to
              the previous page.
            </p>
            {this.state.error && (
              <p className="text-xs text-destructive font-mono bg-destructive/10 rounded px-3 py-2 mt-1 max-w-sm break-all">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={this.handleReset}>
              Try again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
