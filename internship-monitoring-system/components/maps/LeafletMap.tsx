"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
});

type LeafletMapProps = {
  latitude: number;
  longitude: number;
};

export default function LeafletMap(props: LeafletMapProps) {
  return (
    <Map {...props} />
  );
}