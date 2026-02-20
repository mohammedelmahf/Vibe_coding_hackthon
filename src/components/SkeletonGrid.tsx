export default function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 p-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="skeleton aspect-[4/3.5]" style={{ borderRadius: '16px 16px 0 0' }} />
          <div className="px-3 pt-2.5 pb-3 space-y-2">
            <div className="skeleton h-3.5 w-[85%] rounded-md" />
            <div className="skeleton h-3 w-[55%] rounded-md" />
            <div className="skeleton h-4.5 w-[40%] rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
