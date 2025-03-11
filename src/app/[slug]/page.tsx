'use client'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import api from "@/lib/axios";
import timeAgo from "@/lib/timeAgo";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Article from "../models/Articles";




export default function ArticleSlug() {
    const {slug} = useParams();

    const getArticle = async (slug) =>{
        try {
          const data = await api.post("/article",{articleId:Number(slug)});
          return data.data;
        }
        catch(error){
          console.log(error);
          throw new Error("Failed to fetch article"); // Explicitly throw an error
        }
      }
      
      const { data, isLoading,isFetching } = useQuery<Article>({
        queryKey: ['article'],
        queryFn: ()=>getArticle(slug),
        staleTime:0,
      });
    
      if (!data || isLoading || isFetching) return <div>Fetching</div>
    return(
                <div className="flex justify-center min-h-screen">
        <div className="w-full md:w-[60%] p-4 flex flex-col">
            <h1 className="font-khand text-secondary-foreground text-lg md:text-xl lg:text-3xl leading-6 mb-2">{data.title}</h1>

            <div className='flex flex-row gap-2'>
                <h1 className="md:flex md:flex-row md:gap-2">By<p className='font-extrabold'>{data.author}</p></h1> <p>{timeAgo(data.date)}</p>
                <p>Source: <Link className="hover:underline" href={data.link}>{data.link}</Link></p>
                </div>

            {/* Carousel Div */}
            <div className="flex justify-center ">
                {
                    data.imgs.length>=1 && (
                        <Carousel
  opts={{
    loop:true,
  }}
  className="w-full">
  <CarouselContent className={`-ml-2 md:-ml-4 ${data.imgs.length<3 && "justify-center"}`}>
    {data.imgs.map((img, index) => (
      <CarouselItem 
        key={index} 
        className="pl-2 md:pl-4 md:basis-1/3 sm:basis-1/2 basis-full"
      >
        <div className="relative aspect-square w-full rounded-md overflow-hidden">
          <Image 
            alt={`Gallery image ${index + 1}`}
            fill
            src={img} 
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      </CarouselItem>
    ))}
  </CarouselContent>
  <div className="flex justify-center gap-2 mt-4">
    <CarouselPrevious className="static transform-none mx-0" />
    <CarouselNext className="static transform-none mx-0" />
  </div>
</Carousel>
                    )
                }
            
        
            </div>
            {data.content.map((pTag, index) => (
            <div className="font-roboto text-lg mb-[2rem] leading-[1.6em] w-full" key={index}>
                {pTag}
            </div>
            ))}
        </div>
        </div>
    )
}

