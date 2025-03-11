import Article from "@/app/models/Articles";
import { create, } from "zustand";

// Define the store state interface
interface ArticleState {
    // State
    articles: Article[];
    currentArticle: Article | null;
    isLoading: boolean;
    
    // Actions
    getCurrentArticle: ()=>Article | null;
    setArticles: (articles: Article[]) => void;
    setCurrentArticle: (article: Article) => void;
    clearCurrentArticle: () => void;
    setLoading: (isLoading: boolean) => void;
  }
  
  // Create the store
  export const useArticleStore = create<ArticleState>((set,get) => ({
    // Initial state
    articles: [],
    currentArticle: null,
    isLoading: false,
    
    // Actions
    getCurrentArticle: () => {
        return get().currentArticle;
      },
    setArticles: (articles: Article[]) => set({ articles }),
    setCurrentArticle: (article: Article) => set({ currentArticle: article }),
    clearCurrentArticle: () => set({ currentArticle: null }),
    setLoading: (isLoading: boolean) => set({ isLoading }),
  }));
  
  // Optional: Export the types for use elsewhere
  export type { Article, ArticleState };
