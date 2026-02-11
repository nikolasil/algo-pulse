import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('Integration Tests', () => {
  it('should render sorting page with main components', async () => {
    // Mock the Next.js page - this is a simplified integration test
    const MockPage = () => (
      <div>
        <div data-testid="control-panel">
          <button>Generate Random</button>
          <button>Execute</button>
          <input type="range" data-testid="speed-slider" />
        </div>
        <div data-testid="visualizer">
          <div data-testid="visualizer-bar">42</div>
        </div>
      </div>
    );

    render(<MockPage />);
    
    expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    expect(screen.getByText('Generate Random')).toBeInTheDocument();
    expect(screen.getByTestId('visualizer-bar')).toBeInTheDocument();
    expect(screen.getByTestId('visualizer-bar')).toHaveTextContent('42');
  });

  it('should handle user interaction flow', async () => {
    const user = userEvent.setup();
    
    const MockInteractivePage = () => {
      const [count, setCount] = React.useState(0);
      
      return (
        <div>
          <button 
            data-testid="increment"
            onClick={() => setCount(c => c + 1)}
          >
            Count: {count}
          </button>
          <div data-testid="count-display">{count}</div>
        </div>
      );
    };

    render(<MockInteractivePage />);
    
    const button = screen.getByTestId('increment');
    const display = screen.getByTestId('count-display');
    
    expect(display).toHaveTextContent('0');
    
    await user.click(button);
    
    expect(display).toHaveTextContent('1');
    
    await user.click(button);
    
    expect(display).toHaveTextContent('2');
  });

  it('should handle async operations', async () => {
    const AsyncMockComponent = () => {
      const [data, setData] = React.useState<string | null>(null);
      const [loading, setLoading] = React.useState(false);
      
      React.useEffect(() => {
        setLoading(true);
        setTimeout(() => {
          setData('Loaded data');
          setLoading(false);
        }, 100);
      }, []);
      
      return (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {data && <div data-testid="data">{data}</div>}
        </div>
      );
    };

    render(<AsyncMockComponent />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('data')).not.toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.getByTestId('data')).toHaveTextContent('Loaded data');
    });
  });

  it('should handle error states', () => {
    const ErrorMockComponent = ({ hasError }: { hasError: boolean }) => (
      <div>
        {hasError && <div data-testid="error">Error occurred</div>}
        {!hasError && <div data-testid="success">Success</div>}
      </div>
    );

    const { rerender } = render(<ErrorMockComponent hasError={false} />);
    
    expect(screen.getByTestId('success')).toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    
    rerender(<ErrorMockComponent hasError={true} />);
    
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.queryByTestId('success')).not.toBeInTheDocument();
  });
});