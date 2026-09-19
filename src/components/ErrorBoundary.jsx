import React from 'react';
import { AlertCircle, RotateCcw, Home, Sparkles } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Krishi Bazaar Error Boundary caught an exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#landing';
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">
                Safe Recovery / सुरक्षित रिकवरी
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The interface encountered an unexpected state. Your agricultural data and active sessions are completely safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-100 rounded-xl text-left text-xs font-mono text-slate-700 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload View / पुनः लोड करें</span>
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  if (typeof window !== 'undefined') {
                    window.location.hash = '#landing';
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
