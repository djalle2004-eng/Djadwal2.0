import React, { Suspense } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

interface QueryBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (props: { error: Error; resetErrorBoundary: () => void }) => React.ReactNode; onReset: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('QueryBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback({
        error: this.state.error,
        resetErrorBoundary: () => {
          this.props.onReset();
          this.setState({ hasError: false, error: null });
        },
      });
    }

    return this.props.children;
  }
}

export const QueryBoundary: React.FC<QueryBoundaryProps> = ({ 
  children, 
  fallback, 
  loadingFallback = <div className="p-4 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div> 
}) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ error, resetErrorBoundary }) => (
            fallback ? (
              <>{fallback}</>
            ) : (
              <div className="p-4 border border-red-300 bg-red-50 rounded-lg m-4">
                <h3 className="text-lg font-bold text-red-800 mb-2">خطأ في تحميل البيانات</h3>
                <p className="text-sm text-red-600 mb-4">{error.message}</p>
                <button
                  onClick={resetErrorBoundary}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  إعادة المحاولة
                </button>
              </div>
            )
          )}
        >
          <Suspense fallback={loadingFallback}>
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};
