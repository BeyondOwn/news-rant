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
    onSearch(); // Keep this for explicit searches (e.g., when pressing enter)
  };

  return (
    <form onSubmit={handleSubmit} className="w-full place-self-center space-y-4 col-span-2">
      <div className="relative flex items-center w-full">
        <input
          id="search"
          type="text"
          placeholder="Type your search query..."
          className="active:bg-input transition-colors duration-300 col-span-2 w-full pr-12 p-2 border rounded-lg bg-input text-foreground border-border"
          value={searchMessage}
          onChange={(e) => setSearchMessage(e.target.value)} // This will trigger the debounced search
        />
        <Button
          type="submit"
          className="absolute right-0 top-0 bottom-0 bg-input hover:bg-input text-secondary-foreground h-full"
        >
          <Search className="text-xl" />
        </Button>
      </div>
    </form>
  );
};