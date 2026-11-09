import { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ArrowRight
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { saveSection, getSectionVersions, SectionVersion } from '../saveSection';
import toast from 'react-hot-toast';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  sectionTitle?: string;
  onRestored?: (restoredData: any) => void;
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatValuePreview(val: any): string {
  if (val === undefined) return '<undefined>';
  if (val === null) return 'null';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'string') return val.length > 80 ? `${val.slice(0, 80)}...` : val;
  if (Array.isArray(val)) return `Array (${val.length} items)`;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

interface FieldDiff {
  key: string;
  oldVal: any;
  currentVal: any;
  status: 'changed' | 'added' | 'removed';
}

function computeDiff(versionData: Record<string, any>, currentData: Record<string, any>): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  const ignoredKeys = new Set(['updatedAt', 'savedAt', 'timestamp', 'docId']);

  const allKeys = Array.from(
    new Set([...Object.keys(versionData || {}), ...Object.keys(currentData || {})])
  ).filter((k) => !ignoredKeys.has(k));

  for (const k of allKeys) {
    const hasOld = k in (versionData || {});
    const hasCurrent = k in (currentData || {});
    const oldVal = versionData ? versionData[k] : undefined;
    const currentVal = currentData ? currentData[k] : undefined;

    if (!hasOld && hasCurrent) {
      diffs.push({ key: k, oldVal: undefined, currentVal, status: 'added' });
    } else if (hasOld && !hasCurrent) {
      diffs.push({ key: k, oldVal, currentVal: undefined, status: 'removed' });
    } else {
      const oldStr = JSON.stringify(oldVal);
      const currStr = JSON.stringify(currentVal);
      if (oldStr !== currStr) {
        diffs.push({ key: k, oldVal, currentVal, status: 'changed' });
      }
    }
  }

  return diffs;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  docId,
  sectionTitle,
  onRestored
}: HistoryDrawerProps) {
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<SectionVersion[]>([]);
  const [currentDoc, setCurrentDoc] = useState<Record<string, any> | null>(null);
  const [expandedDiffId, setExpandedDiffId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchVersionsAndCurrent = async () => {
    setLoading(true);
    try {
      // 1. Fetch current live doc
      const currentSnap = await getDoc(doc(db, 'portfolio_content', docId));
      if (currentSnap.exists()) {
        setCurrentDoc(currentSnap.data());
      } else {
        setCurrentDoc({});
      }

      // 2. Fetch versions
      const vers = await getSectionVersions(docId);
      setVersions(vers);
    } catch (err) {
      console.error('Error fetching version history:', err);
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVersionsAndCurrent();
      setExpandedDiffId(null);
    }
  }, [isOpen, docId]);

  if (!isOpen) return null;

  const handleRestore = async (version: SectionVersion) => {
    const formattedDate = new Date(version.timestamp).toLocaleString();
    const confirmed = confirm(
      `Restore version from ${formattedDate}?\n\nA backup of current data will be saved to history first, then this version will be applied.`
    );
    if (!confirmed) return;

    setRestoringId(version.id);
    try {
      // Calling saveSection automatically backs up current doc to versions first!
      await saveSection(docId, version.data, {
        notify: true,
        successMessage: `Restored version from ${formattedDate}`
      });

      if (onRestored) {
        onRestored(version.data);
      }

      // Refresh list to show the new version created by saveSection
      await fetchVersionsAndCurrent();
    } catch (err) {
      console.error('Error restoring version:', err);
      toast.error('Failed to restore version');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <aside className="relative w-full max-w-xl bg-[#111827] border-l border-slate-800 shadow-2xl flex flex-col z-50 text-white">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Version History</h3>
              <p className="text-xs text-slate-400 font-mono">
                {sectionTitle || docId} • portfolio_content/{docId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-teal-400">Automatic safety net:</span> Every admin save archives
            the previous document state. Up to 10 versions are kept. Restoring any version automatically creates
            a new backup first.
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
              <span className="text-xs font-mono">Loading saved snapshots...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="font-medium text-white text-sm">No previous versions found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Snapshots are automatically created here whenever changes are saved from the editor.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((ver, idx) => {
                const dateObj = new Date(ver.timestamp);
                const isExpanded = expandedDiffId === ver.id;
                const isRestoring = restoringId === ver.id;
                const diffs = currentDoc ? computeDiff(ver.data, currentDoc) : [];

                return (
                  <div
                    key={ver.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 transition-all hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">
                            {dateObj.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-xs text-slate-400">
                            {dateObj.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 border border-teal-800/40 px-2 py-0.5 rounded">
                            {formatRelativeTime(ver.timestamp)}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              Latest backup
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 mt-1">
                          Snapshot ID: {ver.id}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedDiffId(isExpanded ? null : ver.id)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          Preview diff
                        </button>

                        <button
                          type="button"
                          disabled={isRestoring}
                          onClick={() => handleRestore(ver)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                          {isRestoring ? 'Restoring...' : 'Restore'}
                        </button>
                      </div>
                    </div>

                    {/* Diff Preview Expandable */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                          <span>Comparison: This snapshot vs Current live</span>
                          <span>{diffs.length} field {diffs.length === 1 ? 'difference' : 'differences'}</span>
                        </div>

                        {diffs.length === 0 ? (
                          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-teal-400" />
                            This snapshot is identical to the currently live content.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {diffs.map((diff) => (
                              <div
                                key={diff.key}
                                className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5"
                              >
                                <div className="font-bold text-slate-300 flex items-center justify-between">
                                  <span className="text-teal-400">{diff.key}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${
                                    diff.status === 'changed'
                                      ? 'bg-yellow-500/10 text-yellow-400'
                                      : diff.status === 'added'
                                      ? 'bg-blue-500/10 text-blue-400'
                                      : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {diff.status}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                                    <div className="text-[10px] text-slate-500 uppercase">In this snapshot</div>
                                    <div className="text-slate-300 break-words mt-0.5">
                                      {formatValuePreview(diff.oldVal)}
                                    </div>
                                  </div>

                                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                                    <div className="text-[10px] text-slate-500 uppercase">Currently live</div>
                                    <div className="text-slate-300 break-words mt-0.5">
                                      {formatValuePreview(diff.currentVal)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
