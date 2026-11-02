import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Render Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isCustomFallback = typeof this.props.fallback === 'function';
      if (isCustomFallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset,
          reloadPage: this.handleReload
        });
      }

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white rounded-2xl border border-red-200 shadow-lg p-6 sm:p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-200">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-heading font-extrabold text-[#191919] mb-2">
              {this.props.fallbackTitle || 'Kuch Galat Ho Gaya (Rendering Error)'}
            </h2>

            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              {this.props.fallbackMessage ||
                'Is component ko render karte samay ek unexpected error aayi hai. Kripya page reload karein ya dashboard par wapas jayein.'}
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-red-50/70 border border-red-200 rounded-xl text-left">
                <span className="block text-[11px] font-bold text-red-800 uppercase tracking-wider mb-1">
                  Error Details:
                </span>
                <code className="text-xs text-red-700 font-mono break-all block">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 bg-[#355E3B] hover:bg-[#294A30] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Page Reload Karein</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#F3F0E6] hover:bg-[#E2E6DC] text-[#26352A] text-xs font-bold rounded-xl transition-colors border border-[#E2E6DC]"
              >
                Retry Component
              </button>

              <a
                href={this.props.redirectUrl || '/admin/dashboard'}
                className="px-4 py-2 bg-[#26352A] hover:bg-[#1C261F] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard Par Jayein</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
