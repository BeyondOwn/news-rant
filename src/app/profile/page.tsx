'use client'
import { useAuth } from '@/context/context';
import timeAgo from '@/utilities/timeAgo';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Article from '../models/Articles';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type

const Page = ({}) => {
    const {user} = useAuth();
    
    const bookmarkArticle = async (articleId:number) =>{
        await axios.post("http://localhost:5000/bookmark",{articleId},{withCredentials:true});
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
          const response = await axios.get('http://localhost:5000/bookmarked', {
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
          <li className="mb-4 min-h-40" key={article.id}>
            <div className="md:flex p-4 bg-card">
              <div className="relative mr-2 md:min-w-[370px] md:min-h-[160px]">
                <Link href={article.link}>
                  <Image
                    src={article.image}
                    alt={article.title}
                    width={370}
                    height={210}
                    className="object-cover transition ease-in-out hover:opacity-85"
                  />
                </Link>
                <div className="flex flex-col justify-center h-8 font-bold text-sm border-2 border-secondary-foreground absolute bottom-2 left-2 text-white bg-black bg-opacity-60 p-2 rounded-md">
                <p className='justify-self-center'>{article.category}</p>
                </div>
              </div>

              <div className='flex flex-col text-wrap w-[100%]'>
                <Link className="hover:underline" href={article.link}>
                  <h3 className="font-khand text-xl md:text-3xl leading-6">{article.title}</h3>
                </Link>
                <p className="leading-5">{article.description}</p>
                <div className='flex flex-row gap-2 mt-auto'>
                By<p className='font-extrabold'>{article.author}</p> <p>{timeAgo(article.date)}</p>
                {article.isBookmarked ? (
                  <BookmarkCheck onClick={()=>bookmarkArticle(article.id)} className='ml-auto hover:text-primary'></BookmarkCheck>
                ):
                (
                  <Bookmark onClick={()=>bookmarkArticle(article.id)} className='ml-auto hover:text-primary'></Bookmark>
                )
                }
                  
                
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