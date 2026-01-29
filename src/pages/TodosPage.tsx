import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TodoListCard } from '@/components/todos/TodoListCard';
import { FocusMode } from '@/components/focus/FocusMode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

const PRESET_COLORS = [
  'hsl(186, 100%, 50%)',
  'hsl(142, 70%, 45%)',
  'hsl(340, 75%, 55%)',
  'hsl(280, 65%, 60%)',
  'hsl(38, 92%, 55%)',
  'hsl(220, 80%, 55%)',
];

const TodosPage = () => {
  const { state, dispatch } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState(PRESET_COLORS[0]);

  if (state.focusMode) {
    return <FocusMode />;
  }

  const activeLists = state.todoLists.filter((l) => !l.archived);
  const archivedLists = state.todoLists.filter((l) => l.archived);

  const handleCreateList = () => {
    if (!newListName.trim()) return;

    dispatch({
      type: 'ADD_TODO_LIST',
      payload: {
        name: newListName.trim(),
        color: newListColor,
      },
    });

    setNewListName('');
    setNewListColor(PRESET_COLORS[0]);
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Todo Lists</h1>
            <p className="text-muted-foreground">Organize tasks into lists</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>List Name</Label>
                  <Input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Shopping, Work Tasks..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewListColor(color)}
                        className={`h-8 w-8 rounded-full transition-transform ${
                          newListColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateList} className="w-full">
                  Create List
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Lists */}
        {activeLists.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeLists.map((list) => (
              <TodoListCard key={list.id} list={list} />
            ))}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
            <div className="text-center">
              <p className="text-muted-foreground">No lists yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first list to get started
              </p>
            </div>
          </div>
        )}

        {/* Archived Lists */}
        {archivedLists.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground">Archived</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
              {archivedLists.map((list) => (
                <TodoListCard key={list.id} list={list} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TodosPage;
