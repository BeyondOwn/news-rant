'use client'
import { useAuth } from '@/context/context';
import api from '@/lib/axios';
import timeAgo from '@/lib/timeAgo';
import { useQuery } from '@tanstack/react-query';
import { BookmarkCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Article from '../models/Articles';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type

const Page = ({}) => {
    const {user} = useAuth();
    
    const bookmarkArticle = async (articleId:number) =>{
        await api.post("/bookmark",{articleId},{withCredentials:true});
        toast.info('Article unbookmarked!')
          refetch();
      }

      const fetchBookmarks = async (): Promise<Article[]> => {
        if (!user) {
          // Instead of throwing an error, handle the case when the user is not logged in
          window.location.href = "/login"
          return [];
        }
      
        try {
          const response = await api.get('/bookmarked', {
            withCredentials: true,
          });
      
          if (!response || !response.data) {
            throw new Error('Failed to fetch bookmarks');
          }
      
          return response.data;
        } catch (error) {
          console.error('Error fetching bookmarks:', error);
          throw new Error('Unable to fetch bookmarks');
        }
      };
    
    

    // React Query: Fetch all articles or search results
    const { data, refetch } = useQuery<Article[]>({
    queryKey: ['bookmarks'],
    queryFn: fetchBookmarks,
    staleTime:0,
    });

  return <div>
    <div className="flex justify-center">
    <ul className="w-[80%] mt-4">

    {data?.map((article) => (
          <li className="mb-4 min-h-40 " key={article.id}>
            <div className="flex flex-col md:flex-row bg-card p-4 gap-4">
              {/* Image container */}
              <div className="relative w-full md:w-[350px] h-[200px] flex-shrink-0">
                <Link href={article.link}>
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 350px"
                    className="object-cover transition ease-in-out hover:opacity-85 rounded-md"
                    priority
                  />
                </Link>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 rounded-md border-2 border-secondary-foreground">
                  <p className='text-xs md:text-sm text-white font-bold'>{article.category}</p>
                </div>
              </div>

              {/* Content container */}
              <div className='flex flex-col flex-grow min-w-0'>
                <Link className="hover:underline" href={article.link}>
                  <h3 className="font-khand font-bold text-secondary-foreground text-lg md:text-xl lg:text-2xl leading-tight line-clamp-3 mb-2">
                    {article.title}
                  </h3>
                </Link>
                <p className="text-secondary-foreground leading-5  mb-4">
                  {article.description}
                </p>
                <div className='flex flex-row gap-2 mt-auto items-center'>
                  <span>By</span>
                  <p className='font-extrabold'>{article.author}</p> 
                  <p>{timeAgo(article.date)}</p>
                
                    <BookmarkCheck 
                      onClick={() => bookmarkArticle(article.id)} 
                      className="ml-auto hover:text-primary"
                    />
                  
                  
                </div>
              </div>
            </div>
          </li>
        ))}

    </ul>
    </div>
    </div>
    
}

export default Page