type Props = {
title: string;
value: string | number;
subtitle?: string;
};
export default function ScoreCard({
title,
value,
subtitle,
}: Props) {
return (
<div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
<p className="text-xs text-slate-500">
{title}
</p>

<h2 className="text-2xl font-bold mt-2 text-slate-900">
{value}
</h2>
{subtitle && (
<p className="text-xs text-slate-400 mt-2">
{subtitle}
</p>
)}
</div>
);
}