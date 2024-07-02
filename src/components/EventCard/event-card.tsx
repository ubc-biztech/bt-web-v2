import React from "react";
import { useEffect, useState } from "react";
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// more-vert icon
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Button } from "@/components/ui/button"

// this is placeholder if no event image is found
import placeHolderImage from '../../assets/event-placeholder.jpeg';
import Image from 'next/image';

// this needs to take in props
export default function EventCard() {
  return (
    <Card className="w-9/10 border-none bg-events-card-bg">
        <Image
            src={placeHolderImage} 
            alt="event-image"
            className="w-full h-[300px] rounded-t-lg"
            />
      <CardFooter className="font-poppins text-white block mt-4 mb-4 ml-1 mr-1 pb-0">
      <div className="flex items-center justify-between">
        <h5 className="text-white font-500">Event Title</h5> {/* change this to use props */}
        <Button variant="ghost" className="text-white bg-transparent w-2 h-7">
            <MoreVertIcon/>
        </Button>
      </div>
        <p className="p3 text-baby-blue mt-2 mb-2">Event Date, Start Time</p> {/* change this to use props */}
      </CardFooter>
    </Card>
  );
};
