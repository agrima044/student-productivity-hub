import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReset = () => {
    // Clear potentially corrupted local data
    const confirmClear = window.confirm(
      "Do you want to reset all application data to fix this issue? This will clear all notes and tasks."
    );
    if (confirmClear) {
      localStorage.clear();
      window.location.reload();
    } else {
      this.setState({ hasError: false, error: null });
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              An unexpected error occurred in the application. This could be due to a rendering mismatch or corrupted local storage.
            </p>
            {this.state.error && (
              <pre style={styles.stack}>
                {this.state.error.toString()}
              </pre>
            )}
            <div style={styles.actions}>
              <button 
                onClick={() => window.location.reload()} 
                style={{ ...styles.button, ...styles.buttonPrimary }}
              >
                Reload Page
              </button>
              <button 
                onClick={this.handleReset} 
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                Reset Data & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#080c14',
    color: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
    padding: '2rem',
    boxSizing: 'border-box'
  },
  card: {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '0.75rem',
    padding: '2.5rem',
    maxWidth: '550px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
    color: '#ef4444'
  },
  message: {
    color: '#cbd5e1',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    marginBottom: '1.5rem'
  },
  stack: {
    backgroundColor: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '0.5rem',
    padding: '1rem',
    fontSize: '0.8rem',
    color: '#f43f5e',
    textAlign: 'left',
    overflowX: 'auto',
    marginBottom: '1.5rem',
    maxHeight: '150px',
    whiteSpace: 'pre-wrap'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  button: {
    padding: '0.625rem 1.25rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s ease'
  },
  buttonPrimary: {
    backgroundColor: '#6366f1',
    color: '#ffffff'
  },
  buttonSecondary: {
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    border: '1px solid #374151'
  }
};

export default ErrorBoundary;
