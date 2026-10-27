import { type ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  empty?: ReactNode;
}

export default function Table<T extends { id?: string }>({ columns, rows, empty }: Props<T>) {
  if (rows.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-slate-500">
        {empty ?? 'No records to display.'}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
            {columns.map((c) => (
              <th key={c.key} className={`px-5 py-3 font-semibold ${c.className ?? ''}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="hover:bg-slate-50/70 transition-colors">
              {columns.map((c) => (
                <td key={c.key} className={`px-5 py-3 align-middle text-slate-700 ${c.className ?? ''}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
