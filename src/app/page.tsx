'use client';
import { SearchForm } from '@/components/InputForm';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/context';
import api from '@/lib/axios';
import timeAgo from '@/lib/timeAgo';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from "react-toastify";
import Article from './models/Articles';
import { Trendings, Upcomings } from './models/TrendingsUpcomings';



export default function Home() {
  const [searchMessage, setSearchMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  // const [bookmarkedArticles, setBookmarkedArticles] = useState<Record<number,boolean>>({});
  const { user, loading } = useAuth(); // Access user from the context
  const queryClient = useQueryClient();

  // const toggleBookmark = (articleId:number) => {
  //   setBookmarkedArticles(prevState => ({
  //     ...prevState,
  //     [articleId]: !prevState[articleId]
  //   }));
  //   console.log(bookmarkedArticles);
  // };

  // Define the mutation
  const bookmarkMutation = useMutation({
    mutationFn: async (articleId: number) => {
      try {
        const response = await api.post("/bookmark", { articleId });
        return {
          data: response.data,
          status: response.status
        };
      } catch (error: any) {
        // Let the error be handled by the axios interceptor
        throw error;
      }
    },
    onMutate: async (articleId) => {
      await queryClient.cancelQueries({ queryKey: ['infiniteArticles'] });
      await queryClient.cancelQueries({ queryKey: ['searchResults'] });

      // Get the current state
      const previousArticles = queryClient.getQueryData(['infiniteArticles']);

      // Optimistically update the articles
      queryClient.setQueryData(['infiniteArticles'], (old: any) => {
        if (!old?.pages) return old;
        
        return {
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((article: Article) =>
              article.id === articleId
                ? { ...article, isBookmarked: !article.isBookmarked }
                : article
            ),
          })),
          pageParams: old.pageParams,
        };
      });

      return { previousArticles };
    },
    onError: (error: any, articleId, context) => {
      // Rollback to the previous state
      queryClient.setQueryData(['infiniteArticles'], context?.previousArticles);
      
      // Error toast is now handled by axios interceptor
    },
    onSettled: () => {
      // Refetch to ensure server-client state consistency
      queryClient.invalidateQueries({ queryKey: ['infiniteArticles'] });
      queryClient.invalidateQueries({ queryKey: ['searchResults'] });
    },
  });

  // Replace the bookmarkArticle function with this
  const bookmarkArticle = async (articleId: number) => {
    try{
      const response = await api.post("/bookmark", { articleId });
     if (response.status === 201)
     {
      toast.success('Article bookmarked!')
     }
      else if  (response.status === 200)
     {
      toast.info('Article unbookmarked!')
     }
    
    
    if (searchQuery)
    {
      refetchSearch();
    }
    else{
      refetch();
    }
    }
    catch(error){
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
      console.log(error);
    }
     
  };

  const getTrendings = async () =>{
    try {
      const data = await api.get("/trendings");
      return data.data;
    }
    catch(error){
      console.log(error);
    }
  }

  const getUpcomings = async () =>{
    try {
      const data = await api.get("/upcomings");
      return data.data;
    }
    catch(error){
      console.log(error);
    }
  }
  
  const { data: trendings } = useQuery<Trendings[]>({
    queryKey: ['trendings'],
    queryFn: getTrendings,
  });

  const { data: upcomings } = useQuery<Upcomings[]>({
    queryKey: ['upcomings'],
    queryFn: getUpcomings,
  });

  

  // Fetch all articles
  const fetchAllArticles = async ({ pageParam = 1 }: { pageParam?: number }): Promise<{data:Article[], total:number; hasMore:boolean; nextPage:number}> => {
    try {
        const response = await api.get(`/data?page=${pageParam}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            window.location.href = "/login";
        }
        throw error;
    }
  };

  // Fetch search results
  const fetchSearchResults = async (): Promise<Article[]> => {
    const response = await api.get(`/api/search?q=${encodeURIComponent(searchQuery || '')}`);
    return response.data;
  };

  // React Query: Fetch all articles or search results
  const { data: articles, refetch:refetchSearch } = useQuery<Article[]>({
    queryKey: ['searchResults', searchQuery],
    queryFn: fetchSearchResults,
    enabled: Boolean(searchQuery?.trim()),
  });

   const {data:infiniteArticles, error, isError, isFetching, refetch, fetchNextPage, hasNextPage} = useInfiniteQuery({
    queryKey: ['infiniteArticles'],
    queryFn: ({pageParam}) => fetchAllArticles({pageParam : pageParam as number}),
    getNextPageParam: (lastPage) => {
        // Return the next page number if there are more pages, otherwise return undefined
        return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    initialPageParam: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
});

  // Replace setSearchQuery with a debounced version
  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    [] // Empty dependency array since we don't want to recreate the debounced function
  );

  // Update the handleSearch function
  const handleSearch = (value: string) => {
    debouncedSetSearchQuery(value);
  };

  // Flatten all articles from all pages
const allArticles = useMemo(() => {
  if (!infiniteArticles?.pages) return [];
  return infiniteArticles.pages.flatMap((page) => page.data);
}, [infiniteArticles?.pages]);

  // State for the selected category
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  //  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

// Extract unique categories dynamically
  const categories = useMemo(() => {
  if (searchQuery)
  {
    if (!articles) return [];
    const uniqueCategories = new Set(articles.map((article) => article.category));
  return ['All', ...Array.from(uniqueCategories)]; // Include 'All' for showing all articles
  }
  else{
    if (!allArticles) return [];
    const uniqueCategories = new Set(allArticles.map((article) => article.category));
  return ['All', ...Array.from(uniqueCategories)]; // Include 'All' for showing all articles
  }
  
  }, [searchQuery,articles,allArticles]);

  // Filter articles based on the selected category
  const filteredArticles = useMemo(() => {
  if (searchQuery && selectedCategory != "All")
  {
    return articles?.filter((article) => article.category === selectedCategory);
  }
  if (!searchQuery && selectedCategory != "All"){
    return allArticles?.filter((article) => article.category === selectedCategory);
  }
  if (searchQuery)
  {
    console.log (searchQuery)
    return articles;
  }
  else{
    return allArticles;
  }
  
  }, [searchQuery,articles,allArticles, selectedCategory]);

  const itemRefs = useRef({});
  const [isOpen, setIsOpen] = useState(false);

 // Initialize refs
useEffect(() => {
  const newRefs = {};
  categories.forEach((category) => {
    // Preserve existing refs if they exist
    newRefs[category] = itemRefs.current[category] || React.createRef();
  });
  itemRefs.current = newRefs;
}, [categories]);

 useEffect(() => {
  if (isOpen && selectedCategory) {
    // Add a small delay to ensure the dropdown is fully rendered
    setTimeout(() => {
      const ref = itemRefs.current[selectedCategory]?.current;
      if (ref) {
        // console.log('Scrolling to:', selectedCategory, ref);
        ref.scrollIntoView({
          behavior: "instant",
          block: "nearest",
        });
      }
    }, 50);
  }
}, [isOpen, selectedCategory]);

  // const sortedArticles = useMemo(() => {
  //   if (!filteredArticles) return [];
  //   return [...filteredArticles].sort((a, b) => {
  //     const dateA = new Date(a.date);
  //     const dateB = new Date(b.date);

  //     if (sortOrder === 'desc') {
  //       return dateA.getTime() - dateB.getTime(); // Ascending
  //     } else {
  //       return dateB.getTime() - dateA.getTime(); // Descending
  //     }
  //   });
  // }, [filteredArticles, sortOrder]);

  // const toggleSortOrder = () => {
  //   setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  // };

  //  const loaderRef = useRef<HTMLDivElement>(null);

  //  useEffect(() => {
  //    const loader = loaderRef.current;
     
  //    const observer = new IntersectionObserver((entries) => {
  //      if (entries[0].isIntersecting && hasNextPage) {
  //        fetchNextPage(); // Load next page when the loader element comes into view
  //      }
  //    }, { threshold: 0.9 });
 
  //    if (loader) {
  //      observer.observe(loader);
  //    }
 
  //    return () => {
  //      if (loader) {
  //        observer.unobserve(loader); // Cleanup observer
  //      }
  //    };
  //  }, [hasNextPage, fetchNextPage]);

  if (isError) {
    return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }

  

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex justify-center">
      <ul className="xl:grid xl:grid-cols-3 w-[80%] mt-4 scrollbar-thin scrolla">
      <SearchForm
          searchMessage={searchMessage}
          setSearchMessage={(value) => {
            setSearchMessage(value);
            handleSearch(value); // Call handleSearch whenever the input changes
          }}
          onSearch={() => {}} // We can leave this empty since we're searching on type
        />
        <div className='flex gap-2 place-items-center mb-2 mt-2 col-span-2'>


            <DropdownMenu onOpenChange={(open)=>{
              setIsOpen(open);
            }}>
                <DropdownMenuTrigger asChild>
            <Button className='font-bold font-roboto text-secondary-foreground md:text-lg ' variant="default">
                        {selectedCategory == "All" ? "Select Category" : selectedCategory}
                    </Button>
            
                    
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                
                className="w-56 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-zinc-900">
                    <DropdownMenuLabel className=''>Select Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories.map((category) => (
                        <DropdownMenuCheckboxItem
                        ref={itemRefs.current[category]}
                        key={category}
                        checked={selectedCategory === category}
                        onCheckedChange={() => setSelectedCategory(category)}
                        >
                            {category}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
     

        <div className='col-span-2 flex flex-col'>

        {isFetching && <div>Loading...</div>} {/* Subtle loading indicator */}
        {filteredArticles?.map((article) => (
          <li className="col-span-2 mb-4 min-h-40" key={article.id}>
            <div className="md:flex  p-4 bg-card">
              <div className="relative mr-2   md:min-w-[370px] ">
                <Link href={article.link}>
                  <Image
                    src={article.image}
                    alt={article.title}
                    width={370}
                    height={210}
                    className="object-cover transition ease-in-out hover:opacity-85 w-full h-full"
                  />
                </Link>
                <div className="flex flex-col py-4 px-1 text-wrap justify-center h-8 font-bold text-sm border-2 border-secondary-foreground absolute bottom-2 left-2 text-white bg-black bg-opacity-60 rounded-md">
                <p className='justify-self-center text-xs md:text-sm'>{article.category}</p>
                </div>
              </div>

              <div className='flex flex-col text-wrap w-[100%]'>
                <Link className="hover:underline" href={`/${article.id}`}>
                  <h3 className="font-khand text-secondary-foreground text-lg md:text-xl lg:text-3xl leading-6">{article.title}</h3>
                </Link>
                <p className="text-secondary-foreground leading-5">{article.description}</p>
                <div className='flex flex-row gap-2 mt-auto'>
                By<p className='font-extrabold'>{article.author}</p> <p>{timeAgo(article.date)}</p>
                {article.isBookmarked ? (
                  <BookmarkCheck 
                    onClick={() => bookmarkArticle(article.id)} 
                    className={`ml-auto hover:text-primary ${bookmarkMutation.isPending ? 'opacity-50' : ''}`}
                  />
                ) : (
                  <Bookmark 
                    onClick={() => bookmarkArticle(article.id)} 
                    className={`ml-auto hover:text-primary ${bookmarkMutation.isPending ? 'opacity-50' : ''}`}
                  />
                )}
                  
                
                </div>
               
              </div>
            </div>
          </li>
        ))}
        {/* Intersection Observer trigger element */}
        <Button onClick={()=>{
          if (hasNextPage)
          {
            fetchNextPage();
          }
        }} className='text-secondary-foreground text-3xl font-khand place-self-center w-full h-10'>SHOW MORE</Button>
        <div
          className="h-10 flex justify-center items-center"
        >
          {isFetching ? <div>Loading more...</div> : null}
          </div>

 
      </div>
      <div className='sticky h-max top-16 flex flex-col col-span-1 ml-8 overflow-hidden text-nowrap whitespace-nowrap'>
        <p className='text-3xl font-extrabold mb-1'>Trending</p>
        {trendings?.map((trending,index)=>
        <div className='mb-1 flex text-lg font-roboto font-bold ' key={trending.id}>
        <div className='px-2 border-2 mr-1 border-primary w-8 place-items-center'>
          <p>{index+1}</p>
        </div>
        <Link href={trending.link}>
        <p className='max-w-[2rem] hover:underline'>{trending.title}</p>
        </Link>
      </div>
        )}

      <p className='text-3xl font-extrabold mb-1 mt-4'>Upcoming Movies</p>
        {upcomings?.map((upcoming,index)=>
        <div className='mb-1 flex text-lg font-roboto font-bold ' key={upcoming.id}>
          <div className='px-2 border-2 mr-1 border-primary w-8 place-items-center'>
            <p>{index+1}</p>
          </div>
          <Link href={upcoming.link}>
          <p className='max-w-[2rem] hover:underline'>{upcoming.title}</p>
          </Link>
        </div>
        )}
      </div>

      
      </ul>
      
    </div>
  );
}