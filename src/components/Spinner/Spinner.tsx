// Spinner.tsx
import clsx from 'clsx';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'default' | 'white' | 'light';
  className?: string;
  fullPage?: boolean;
}

/**
 * 통일된 로딩 스피너 컴포넌트
 */
export default function Spinner({
  size = 'md',
  color = 'default',
  className = '',
  fullPage = false,
}: SpinnerProps) {
  // 크기별 스타일
  const sizeStyles = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  // 색상별 스타일
  const colorStyles = {
    default: 'border-brand border-t-transparent',
    white: 'border-white border-t-transparent',
    light: 'border-brand-light border-t-transparent',
  };

  // 전체 페이지 로딩 스타일
  const fullPageStyles = fullPage
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 z-50'
    : '';

  return (
    <div className={clsx(fullPageStyles, fullPage ? '' : className)}>
      <div
        className={clsx(
          'rounded-full animate-spin',
          sizeStyles[size],
          colorStyles[color],
          !fullPage && className
        )}
      />
    </div>
  );
}
