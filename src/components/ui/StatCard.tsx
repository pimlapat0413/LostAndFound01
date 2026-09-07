'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export type StatColorScheme = 'blue' | 'orange' | 'green' | 'purple';

export interface StatTrend {
  value: string | number;
  isPositive?: boolean;
  label?: string;
}

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon | React.ReactNode;
  value: string | number;
  label: string;
  colorScheme?: StatColorScheme;
  trend?: StatTrend;
  loading?: boolean;
  description?: string;
}

const colorSchemeStyles: Record<
  StatColorScheme,
  {
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    glow: string;
  }
> = {
  blue: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    glow: 'hover:border-blue-300',
  },
  orange: {
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    glow: 'hover:border-orange-300',
  },
  green: {
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    glow: 'hover:border-emerald-300',
  },
  purple: {
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    glow: 'hover:border-purple-300',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  colorScheme = 'blue',
  trend,
  loading = false,
  description,
  className = '',
  onClick,
  ...props
}) => {
  const scheme = colorSchemeStyles[colorScheme] || colorSchemeStyles.blue;
  const isClickable = Boolean(onClick);

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as LucideIcon;
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm transition-all duration-200 ${
        scheme.glow
      } ${
        isClickable
          ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
          : ''
      } ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col flex-1 pr-3">
          <span className="text-sm font-medium text-gray-500 line-clamp-1">{label}</span>

          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse my-1.5" />
          ) : (
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 tracking-tight">
              {value}
            </span>
          )}

          {trend && !loading && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{trend.value}</span>
              </span>
              {trend.label && (
                <span className="text-xs text-gray-400">{trend.label}</span>
              )}
            </div>
          )}

          {description && !trend && (
            <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">{description}</p>
          )}
        </div>

        {/* Icon Circle */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
            scheme.iconBg
          } ${scheme.iconColor} ${isClickable ? 'group-hover:scale-110' : ''}`}
        >
          {renderIcon()}
        </div>
      </div>
    </div>
  );
};

StatCard.displayName = 'StatCard';

export default StatCard;
