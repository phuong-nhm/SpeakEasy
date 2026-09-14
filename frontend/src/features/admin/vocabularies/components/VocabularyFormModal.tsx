import { VocabularyDto } from "@/features/admin/vocabularies/types/vocabulary";
interface VocabularyFormModalProps {
  isOpen: boolean;
  editingVocabulary: VocabularyDto | null;
  word: string;
  setWord: (val: string) => void;
  meaning: string;
  setMeaning: (val: string) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  audioUrl: string;
  setAudioUrl: (val: string) => void;
  distractor: string;
  setDistractor: (val: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function VocabularyFormModal({
  isOpen,
  editingVocabulary,
  word,
  setWord,
  meaning,
  setMeaning,
  imageUrl,
  setImageUrl,
  audioUrl,
  setAudioUrl,
  distractor,
  setDistractor,
  isSubmitting,
  onClose,
  onSubmit,
}: VocabularyFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800">
          {editingVocabulary ? "Sửa Từ Vựng" : "Thêm Từ Vựng Mới"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Từ vựng (Word)
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Ví dụ: Apple"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nghĩa (Meaning)
            </label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Ví dụ: Quả táo"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Đường dẫn ảnh (ImageUrl)
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Đường dẫn âm thanh (AudioUrl)
            </label>
            <input
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Đáp án nhiễu Quiz (Distractor)
            </label>
            <input
              type="text"
              value={distractor}
              onChange={(e) => setDistractor(e.target.value)}
              placeholder="Ví dụ: Quả cam"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
