import type { MeetingConflict } from "../../types";
import { formatDateTime } from "../../lib/utils";

interface ConflictBadgeProps {
  conflicts: MeetingConflict[];
}

export default function ConflictBadge({ conflicts }: ConflictBadgeProps) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full px-2 py-1 text-xs font-medium z-10 shadow-sm group">
      <span>Konflikt {conflicts.length > 1 ? `(${conflicts.length})` : ""}</span>

      {/* Tooltip z detalami konfliktów */}
      <div className="absolute hidden group-hover:block right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg rounded-md p-3 z-20 w-64">
        <h5 className="font-semibold text-gray-800 mb-2">Konflikty z istniejącymi spotkaniami:</h5>
        <ul className="space-y-2">
          {conflicts.map((conflict) => (
            <li key={conflict.id} className="border-l-2 border-amber-500 pl-2 py-1">
              <p className="font-medium text-gray-800">{conflict.title}</p>
              <p className="text-xs text-gray-500">
                {formatDateTime(conflict.startTime, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {formatDateTime(conflict.endTime, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
