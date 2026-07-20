import { Button } from '../../ui/button';

export function SearchModeNav() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button>BM25</Button>
      <Button>Vector</Button>
      <Button>Hybrid</Button>
    </div>
  );
}
