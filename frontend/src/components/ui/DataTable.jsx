import { PageSpinner } from './Spinner';
import EmptyState from './EmptyState';
import { FileText } from 'lucide-react';

export default function DataTable({ columns, data, loading, emptyTitle = 'No records found', emptyDesc = '' }) {
  if (loading) return <PageSpinner />;
  if (!data || data.length === 0) {
    return <EmptyState icon={FileText} title={emptyTitle} description={emptyDesc} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E8E8E4]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#FAFAF8] border-b border-[#E8E8E4]">
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B65] uppercase tracking-wide"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} className="border-b border-[#E8E8E4] last:border-0 hover:bg-[#FAFAF8] transition-colors">
              {columns.map((col, ci) => (
                <td key={ci} className="px-4 py-3 text-sm text-[#1A1A18]">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
