import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught Error in React Component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#e11d48' }}>Terjadi Kesalahan Saat Memuat Aplikasi</h2>
          <p style={{ color: '#475569', marginBottom: '1.5rem' }}>{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '0.6rem 1.2rem', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
