import { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { FileDown, FileUp, AlertTriangle } from 'lucide-react';

interface DataExportImportProps {
  exportOpen: boolean;
  importOpen: boolean;
  onExportClose: () => void;
  onImportClose: () => void;
}

export function DataExportImport({
  exportOpen,
  importOpen,
  onExportClose,
  onImportClose,
}: DataExportImportProps) {
  const { state, dispatch } = useApp();
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks: state.tasks,
      todoLists: state.todoLists,
      habits: state.habits,
      categories: state.categories,
      preferences: {
        theme: state.theme,
        dailyCapacityMinutes: state.dailyCapacityMinutes,
        taskAgingDays: state.taskAgingDays,
        fixedCommitments: state.fixedCommitments,
      },
    };

    let content: string;
    let filename: string;
    let mimeType: string;

    if (exportFormat === 'json') {
      content = JSON.stringify(exportData, null, 2);
      filename = `productivity-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      mimeType = 'application/json';
    } else {
      // CSV export (tasks only for simplicity)
      const headers = ['id', 'title', 'description', 'priority', 'status', 'taskType', 'dueDate', 'estimatedDuration', 'category'];
      const rows = state.tasks.map(task => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        task.priority,
        task.status,
        task.taskType,
        task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '',
        task.estimatedDuration,
        task.category,
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `tasks-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: `Your data has been exported as ${filename}`,
    });
    onExportClose();
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      const content = await importFile.text();
      const data = JSON.parse(content);

      // Validate structure
      if (!data.version || !data.tasks) {
        throw new Error('Invalid export file format');
      }

      // Convert date strings back to Date objects
      const tasks = data.tasks.map((t: any) => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        originalDueDate: t.originalDueDate ? new Date(t.originalDueDate) : undefined,
      }));

      const todoLists = (data.todoLists || []).map((l: any) => ({
        ...l,
        createdAt: new Date(l.createdAt),
        items: l.items.map((i: any) => ({
          ...i,
          createdAt: new Date(i.createdAt),
          completedAt: i.completedAt ? new Date(i.completedAt) : undefined,
        })),
      }));

      const habits = (data.habits || []).map((h: any) => ({
        ...h,
        startDate: new Date(h.startDate),
        createdAt: new Date(h.createdAt),
      }));

      dispatch({
        type: 'IMPORT_DATA',
        payload: {
          tasks,
          todoLists,
          habits,
          categories: data.categories || state.categories,
        },
      });

      toast({
        title: 'Import successful',
        description: `Imported ${tasks.length} tasks, ${habits.length} habits`,
      });
      onImportClose();
      setImportFile(null);
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'The file format is invalid or corrupted',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={onExportClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Export Data
            </DialogTitle>
            <DialogDescription>
              Export all your tasks, habits, and settings to a file.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as 'json' | 'csv')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (Full backup)</SelectItem>
                  <SelectItem value="csv">CSV (Tasks only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm">
              <p className="font-medium mb-2">Export includes:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {state.tasks.length} tasks</li>
                <li>• {state.habits.length} habits</li>
                <li>• {state.todoLists.length} todo lists</li>
                <li>• {state.categories.length} categories</li>
                <li>• Settings and preferences</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onExportClose}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={onImportClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Import Data
            </DialogTitle>
            <DialogDescription>
              Import data from a previously exported JSON file.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">Warning</p>
                  <p className="text-muted-foreground">
                    Importing will merge with your existing data. Duplicate items may be created.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select file</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>

            {importFile && (
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm">
                <p className="font-medium">{importFile.name}</p>
                <p className="text-muted-foreground">
                  {(importFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onImportClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importFile}>
              <FileUp className="mr-2 h-4 w-4" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
