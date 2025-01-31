import { Search } from "lucide-react";
import { Button } from "./ui/button";

interface SearchFormProps {
  searchMessage: string;
  setSearchMessage: (message: string) => void;
  onSearch: () => void;
}

export const SearchForm = ({ searchMessage, setSearchMessage, onSearch }: SearchFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(); // Trigger the search function
  };

  return (
    <form onSubmit={handleSubmit} className="min-w-[60%] place-self-center space-y-4 col-span-2">
  <div className="relative flex items-center w-full">
    <input
      id="search"
      type="text"
      placeholder="Type your search query..."
      className="w-full pr-12 p-2 border rounded-lg bg-input text-foreground border-border "
      value={searchMessage}
      onChange={(e) => setSearchMessage(e.target.value)}
    />
    <Button
      type="submit"
      className="absolute right-0 top-0 bottom-0  bg-input hover:bg-input text-secondary-foreground h-full"
    >
      <Search className="text-xl" />
    </Button>
  </div>
</form>
  );
};