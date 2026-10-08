"use client";

import { SentenceExerciseDto } from "@/features/admin/sentence-exercises/types/sentence-exercise";

interface ListeningDialogueTableProps {
  dialogues: SentenceExerciseDto[];
  isLoading: boolean;
  onEdit: (dialogue: SentenceExerciseDto) => void;
  onDelete: (id: string) => void;
}

const sortDialogues = (items: SentenceExerciseDto[]) =>
  [...items].sort((a, b) => {
    const groupCompare = (a.dialogueGroupId || "").localeCompare(
      b.dialogueGroupId || "",
    );
    if (groupCompare !== 0) return groupCompare;
    return (a.orderInGroup ?? 0) - (b.orderInGroup ?? 0);
  });

export function ListeningDialogueTable({
  dialogues,
  isLoading,
  onEdit,
  onDelete,
}: ListeningDialogueTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Đang tải dữ liệu dialogue...
      </div>
    );
  }

  if (dialogues.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Chưa có dialogue sentence nào trong chapter này.
      </div>
    );
  }

  const sortedDialogues = sortDialogues(dialogues);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-6 py-3">DialogueGroupId</th>
            <th className="px-6 py-3">OrderInGroup</th>
            <th className="px-6 py-3">CorrectSentence</th>
            <th className="px-6 py-3">DistractorSentence</th>
            <th className="px-6 py-3">AudioUrl</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedDialogues.map((dialogue) => (
            <tr key={dialogue.id} className="align-top hover:bg-slate-50/50">
              <td className="px-6 py-4 text-xs font-medium text-slate-500">
                {dialogue.dialogueGroupId || "-"}
              </td>
              <td className="px-6 py-4 font-semibold text-slate-700">
                {dialogue.orderInGroup ?? "-"}
              </td>
              <td className="px-6 py-4 font-medium text-slate-800">
                {dialogue.correctSentence}
              </td>
              <td className="px-6 py-4 text-slate-700">
                {dialogue.distractorSentence || "-"}
              </td>
              <td className="px-6 py-4">
                {dialogue.audioUrl ? (
                  <div className="space-y-2">
                    {/* <a
                      href={dialogue.audioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="line-clamp-1 text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      {dialogue.audioUrl}
                    </a> */}
                    <audio
                      controls
                      src={dialogue.audioUrl}
                      className="h-8 w-44"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Chưa có</span>
                )}
              </td>
              <td className="space-x-2 px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(dialogue)}
                  className="font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(dialogue.id)}
                  className="font-medium text-rose-600 hover:text-rose-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
