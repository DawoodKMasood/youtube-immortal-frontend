import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import {Card, CardBody, CardFooter} from "@nextui-org/card";
import { Spinner } from '@nextui-org/spinner';
import { Button } from '@nextui-org/button';
import { Image } from "@nextui-org/image";

import { fetchVideos } from '@/services/VideoService';
import { Chip } from '@nextui-org/chip';

const VideosComponent = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadVideos = async () => {
        try {
            const data = await fetchVideos();
            setVideos(data.videos);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch videos');
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVideos(); // Initial load

        const intervalId = setInterval(() => {
            loadVideos();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString();
    };

    if (loading) return (
        <div className="flex flex-col items-center gap-5 w-full">
            <Spinner size="lg" label="Loading..." />
        </div>
    );

    if (error) return <div>{error}</div>;

    return (
        <>
            <div className='flex items-center justify-center'>
                <Link href="/upload" className='cursor-pointer'>
                    <Button variant='flat'>Upload Video</Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {videos.map((video) => (
                    <Link key={video.id} href={video.status === 'COMPLETED' ? `https://immortals-cod-api.playwox.com/video/${video.id}/download` : '#'} target='_blank'>
                        <Card>
                            <CardBody className='flex gap-5'>
                                <div>
                                    <Image classNames={{
                                        wrapper: 'w-full !max-w-full h-32 md:h-60',
                                        img: 'w-full h-32 md:h-60 object-cover'
                                    }} src={`https://immortals-cod-api.playwox.com/video/${video.id}/thumbnail`} alt={`${video.account_name}'s video`} fallbackSrc={'/placeholder-cover.png'} />
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <div className='flex justify-between items-center'>
                                        <div className='text-gray-400 max-w-32 lg:max-w-96 truncate overflow-hidden'>{video.account_name}</div>
                                        <div><Chip size='sm' variant='flat' color={video.status === 'COMPLETED' ? 'success' : video.status === 'FAILED' ? 'danger' : video.status === 'PROCESSING' ? 'primary' : 'default'}>{video.status}</Chip></div>
                                    </div>
                                    <div className='flex flex-col gap-2 text-xs text-gray-500'>
                                        <p>{video.account_name} dominates {video.game_mode} using {video.weapon} on {video.map_name}.</p>
                                    </div>
                                </div>
                                <CardFooter className='justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-2 bg-gradient-to-br from-black/10 to-black/20 before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small z-10'>
                                    <div className='flex justify-between items-center text-sm w-full text-gray-400'>
                                        <div>{formatTime(video.created_at)}</div>
                                        <div>{formatTime(video.updated_at)}</div>
                                    </div>
                                </CardFooter>
                            </CardBody>
                        </Card>
                    </Link>
                ))}
            </div>
        </>
    );
};

export default VideosComponent;