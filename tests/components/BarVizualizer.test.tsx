import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VisualizerBar } from '@/components/vizualizer/BarVizualizer';

describe('VisualizerBar', () => {
  it('should render bar with correct height', () => {
    render(<VisualizerBar val={50} status="idle" />);
    
    const bar = screen.getByTestId('visualizer-bar');
    expect(bar).toHaveStyle({ height: '47.61904761904761%' }); // 50 / (100 + 5) * 100
  });

  it('should apply idle status style', () => {
    render(<VisualizerBar val={50} status="idle" />);
    
    const bar = screen.getByTestId('visualizer-bar');
    expect(bar).toHaveClass('bg-slate-700/20');
  });

  it('should apply comparing status style', () => {
    render(<VisualizerBar val={50} status="comparing" />);
    
    const bar = screen.getByTestId('visualizer-bar');
    expect(bar).toHaveClass('bg-rose-500');
  });

  it('should apply swapping status style', () => {
    render(<VisualizerBar val={50} status="swapping" />);
    
    const bar = screen.getByTestId('visualizer-bar');
    expect(bar).toHaveClass('bg-amber-400');
  });

  it('should apply found status style', () => {
    render(<VisualizerBar val={50} status="found" />);
    
    const bar = screen.getByTestId('visualizer-bar');
    expect(bar).toHaveClass('bg-emerald-400');
  });

  it('should display value when width is sufficient', () => {
    render(<VisualizerBar val={50} status="idle" width={32} />);
    
    const bar = screen.getByTestId('visualizer-bar');
    expect(bar).toHaveTextContent('50');
  });

  it('should hide text when width is too small', () => {
    render(<VisualizerBar val={50} status="idle" width={20} />);
    
    const bar = screen.getByTestId('visualizer-bar');
    expect(bar.querySelector('span')).toBeNull();
  });

  it('should apply first and last rounded corners', () => {
    render(<VisualizerBar val={50} status="idle" isFirst={true} isLast={true} />);
    
    const bar = screen.getByTestId('visualizer-bar');
    expect(bar).toHaveClass('rounded-tl-xl', 'rounded-tr-xl');
  });

  it('should apply custom className', () => {
    render(<VisualizerBar val={50} status="idle" className="custom-class" />);
    
    const bar = screen.getByTestId('visualizer-bar');
    expect(bar).toHaveClass('custom-class');
  });

  it('should scale correctly with max value', () => {
    render(<VisualizerBar val={100} status="idle" maxVal={200} />);
    
    const bar = screen.getByTestId('visualizer-bar');
    expect(bar).toHaveStyle({ height: '48.78048780487805%' }); // 100 / (200 + 5) * 100
  });

  it('should set correct width', () => {
    render(<VisualizerBar val={50} status="idle" width={64} />);
    
    const bar = screen.getByTestId('visualizer-bar');
    expect(bar).toHaveStyle({ minWidth: '64px' });
  });

  it('should show sparkle for found state', () => {
    render(<VisualizerBar val={50} status="found" />);
    
    const bar = screen.getByTestId('visualizer-bar');
    const sparkle = bar?.querySelector('[layoutId="sparkle"]');
    expect(sparkle).toBeInTheDocument();
  });
});