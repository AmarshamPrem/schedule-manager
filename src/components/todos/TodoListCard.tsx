import { useState } from 'react';
import { TodoList } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Archive, Trash2 } from 'lucide-react';

interface TodoListCardProps {
  list: TodoList;
}

export function TodoListCard({ list }: TodoListCardProps) {
  const { dispatch } = useApp();
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const completedCount = list.items.filter((item) => item.completed).length;
  const progress = list.items.length > 0 ? (completedCount / list.items.length) * 100 : 0;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    dispatch({
      type: 'ADD_TODO_ITEM',
      payload: { listId: list.id, text: newItemText.trim() },
    });
    setNewItemText('');
    setIsAddingItem(false);
  };

  const handleToggleItem = (itemId: string) => {
    dispatch({
      type: 'TOGGLE_TODO_ITEM',
      payload: { listId: list.id, itemId },
    });
  };

  const handleDeleteItem = (itemId: string) => {
    dispatch({
      type: 'DELETE_TODO_ITEM',
      payload: { listId: list.id, itemId },
    });
  };

  const handleArchive = () => {
    dispatch({ type: 'ARCHIVE_TODO_LIST', payload: list.id });
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: list.color }}
            />
            <CardTitle className="text-base">{list.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground">
            {completedCount}/{list.items.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {list.items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-2 rounded-md p-1.5 hover:bg-muted/50"
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => handleToggleItem(item.id)}
              className="h-4 w-4"
            />
            <span
              className={cn(
                'flex-1 text-sm',
                item.completed && 'text-muted-foreground line-through'
              )}
            >
              {item.text}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => handleDeleteItem(item.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {isAddingItem ? (
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              autoFocus
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="New item..."
              className="h-8 text-sm"
              onBlur={() => !newItemText && setIsAddingItem(false)}
            />
            <Button type="submit" size="sm" className="h-8">
              Add
            </Button>
          </form>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setIsAddingItem(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add item
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
