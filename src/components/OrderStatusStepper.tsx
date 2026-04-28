// OrderStatusStepper.tsx
// Supabase Setup Notes:
// 1. Enable Realtime on orders table: Supabase Dashboard → Table Editor → orders → Enable Realtime toggle ON
// 2. RLS policy must allow SELECT for authenticated + anon users on orders table
// 3. Filter realtime by row (filter: id=eq.X) to avoid leaking other orders to customers

import { CheckCircle, Clock, Package, Truck, Gift } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';

interface Step {
  key: OrderStatus;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { key: 'pending',   label: 'Order Placed',  sublabel: 'We received your order',    icon: Clock       },
  { key: 'confirmed', label: 'Confirmed',     sublabel: 'Your order is being packed', icon: Package     },
  { key: 'shipped',   label: 'Shipped',       sublabel: 'On the way to you',          icon: Truck       },
  { key: 'delivered', label: 'Delivered',     sublabel: 'Enjoy your mangoes! 🥭',     icon: Gift        },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending: 0, confirmed: 1, shipped: 2, delivered: 3,
};

export function OrderStatusStepper({ status }: { status: string }) {
  const currentIndex = STATUS_INDEX[status as OrderStatus] ?? 0;

  return (
    <div className="w-full py-4">
      {/* Mobile: vertical layout */}
      <div className="flex flex-col gap-0 sm:hidden">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIndex;
          const isCurrent   = idx === currentIndex;
          const isPending   = idx > currentIndex;

          return (
            <div key={step.key} className="flex items-stretch gap-4">
              {/* Icon + connector line */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500
                  ${isCompleted ? 'bg-amber-500 border-amber-500 shadow-md shadow-amber-200' : ''}
                  ${isCurrent   ? 'bg-amber-500 border-amber-400 shadow-lg shadow-amber-300 animate-pulse' : ''}
                  ${isPending   ? 'bg-white border-slate-200' : ''}
                `}>
                  {isCompleted
                    ? <CheckCircle className="w-5 h-5 text-white" />
                    : <Icon className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-slate-300'}`} />
                  }
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-[28px] my-1 rounded-full transition-all duration-700 ${idx < currentIndex ? 'bg-amber-400' : 'bg-slate-200'}`} />
                )}
              </div>

              {/* Text */}
              <div className="pb-6">
                <p className={`font-bold text-sm transition-colors duration-300 ${isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 transition-colors duration-300 ${isCurrent ? 'text-amber-600 font-semibold' : isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>
                  {step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: horizontal layout */}
      <div className="hidden sm:flex items-start justify-between relative">
        {/* Background track */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 z-0" />
        {/* Filled progress track */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-amber-400 z-0 transition-all duration-700 ease-in-out"
          style={{ width: currentIndex === 0 ? '0%' : `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIndex;
          const isCurrent   = idx === currentIndex;
          const isPending   = idx > currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
              {/* Step circle */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                ${isCompleted ? 'bg-amber-500 border-amber-500 shadow-md shadow-amber-200' : ''}
                ${isCurrent   ? 'bg-amber-500 border-amber-400 shadow-lg shadow-amber-300 animate-pulse' : ''}
                ${isPending   ? 'bg-white border-slate-200' : ''}
              `}>
                {isCompleted
                  ? <CheckCircle className="w-5 h-5 text-white" />
                  : <Icon className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-slate-300'}`} />
                }
              </div>

              {/* Labels */}
              <p className={`mt-3 text-xs font-bold text-center transition-colors duration-300 ${isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </p>
              <p className={`mt-0.5 text-[10px] text-center leading-tight transition-colors duration-300 ${isCurrent ? 'text-amber-600 font-semibold' : isCompleted ? 'text-slate-400' : 'text-slate-300'}`}>
                {step.sublabel}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
