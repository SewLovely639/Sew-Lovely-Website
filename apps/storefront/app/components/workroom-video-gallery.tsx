"use client";

import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, X } from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import type { CmsProduct, SiteContent } from "@sew-lovely/cms";

const fallbackVideos = [
  { id: "needle", src: "https://videos.pexels.com/video-files/8170061/8170061-hd_1920_1080_25fps.mp4", label: "Sewing detail", startAt: 0, productIds: ["ivory-suit", "mauve-set"], buttonLabel: "Shop the look", buttonColor: "#cc1f76" },
  { id: "thread", src: "https://videos.pexels.com/video-files/8170064/8170064-sd_640_360_25fps.mp4", label: "Thread and fabric", startAt: 0.8, productIds: ["mauve-set", "olive-kurta"], buttonLabel: "Shop the edit", buttonColor: "#b51863" },
  { id: "motion", src: "https://videos.pexels.com/video-files/8170061/8170061-hd_1920_1080_25fps.mp4", label: "Craft in motion", startAt: 3.8, productIds: ["olive-kurta"], buttonLabel: "View piece", buttonColor: "#c96d52" },
  { id: "workshop", src: "https://videos.pexels.com/video-files/8170064/8170064-sd_640_360_25fps.mp4", label: "Workshop detail", startAt: 2.2, productIds: ["ivory-suit", "olive-kurta"], buttonLabel: "Shop now", buttonColor: "#251521" },
] as const;

function cueClip(video: HTMLVideoElement, startAt: number) {
  if (Number.isFinite(video.duration) && startAt < video.duration - 0.5) video.currentTime = startAt;
}

export function WorkroomVideoGallery({ videos: managedVideos = [], products = [] }: { videos?: SiteContent["workroomVideos"]; products?: CmsProduct[] }) {
  const videos = managedVideos.length ? managedVideos : fallbackVideos;
  const [active, setActive] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const clip = active === null ? null : videos[active];

  useEffect(() => {
    if (!clip || !playerRef.current) return;
    const player = playerRef.current;
    const play = () => {
      cueClip(player, clip.startAt);
      player.muted = !soundOn;
      void player.play().catch(() => {
        player.muted = true;
        setSoundOn(false);
      });
    };
    if (player.readyState >= 1) play();
    else player.addEventListener("loadedmetadata", play, { once: true });
  }, [clip, soundOn]);

  useEffect(() => {
    if (active === null) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [active]);

  const change = (direction: number) => setActive((current) => current === null ? 0 : (current + direction + videos.length) % videos.length);
  const trackShopClick = (videoId: string, productId: string) => { void fetch("/api/video-shop-click", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ videoId, productId }), keepalive: true, credentials: "same-origin" }).catch(() => undefined); };

  const viewer = clip && <div className="fixed inset-0 z-[100] grid min-h-[100svh] place-items-center overflow-y-auto bg-[#211018]/90 p-4 sm:p-6" role="dialog" aria-modal="true" aria-label={`${clip.label} video`} onClick={() => setActive(null)}><div className="relative flex h-[calc(100svh-2rem)] w-[min(94vw,1200px)] items-center justify-center overflow-hidden rounded-[10px] bg-[#160e14] shadow-[0_24px_90px_rgba(27,14,23,.7)] sm:h-[min(90svh,820px)]" onClick={(event) => event.stopPropagation()}><video ref={playerRef} key={`${clip.id}-${clip.startAt}`} autoPlay playsInline className="size-full object-contain" aria-label={`${clip.label} video player`}><source src={clip.src} type="video/mp4" /></video><div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-3 py-3 text-white"><button type="button" onClick={() => setSoundOn((value) => !value)} className="grid size-9 place-items-center rounded-full bg-black/30 transition hover:bg-[#cc1f76]" aria-label={soundOn ? "Mute video" : "Enable sound"}>{soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}</button><button type="button" onClick={() => setActive(null)} className="grid size-9 place-items-center rounded-full bg-black/30 transition hover:bg-[#cc1f76]" aria-label="Close video viewer"><X className="size-4" /></button></div><button type="button" onClick={() => change(-1)} className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-[#251521] shadow-lg transition hover:bg-[#cc1f76] hover:text-white" aria-label="Previous video"><ChevronLeft className="size-5" /></button><button type="button" onClick={() => change(1)} className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-[#251521] shadow-lg transition hover:bg-[#cc1f76] hover:text-white" aria-label="Next video"><ChevronRight className="size-5" /></button><div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">{videos.map((video, index) => <button key={`${video.id}-dot`} type="button" onClick={() => setActive(index)} className={`h-1 rounded-full transition ${index === active ? "w-8 bg-[#e64092]" : "w-3 bg-white/55"}`} aria-label={`Play video ${index + 1}`} />)}</div></div></div>;

  return <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:py-14" aria-label="Sew Lovely videos"><h2 className="sr-only">Sew Lovely workroom videos</h2><div className="flex gap-3 overflow-x-auto pb-3 sm:gap-4">{videos.map((video, index) => { const taggedProducts = video.productIds.map((id) => { const product = products.find((candidate) => candidate.id === id); return { id, name: product?.name ?? id.replace(/[-_]+/g, " ") }; }); return <div key={video.id} className="group relative min-w-[34%] shrink-0 aspect-[.82] overflow-hidden bg-[#21161e] sm:min-w-[43%] md:min-w-[calc(25%-0.75rem)] md:aspect-[.76] lg:w-[calc(25%-0.75rem)] lg:flex-none"><button type="button" onClick={() => { setSoundOn(false); setActive(index); }} className="relative size-full text-left" aria-label={`Open ${video.label} video`}><video autoPlay muted loop playsInline preload="metadata" onLoadedMetadata={(event) => cueClip(event.currentTarget, video.startAt)} className="size-full object-cover transition duration-500 group-hover:scale-105"><source src={video.src} type="video/mp4" /></video><span className="absolute inset-0 bg-gradient-to-t from-[#21161e]/75 via-transparent to-transparent transition duration-300 group-hover:from-[#21161e]/85" /><span className="absolute bottom-3 left-3 grid size-8 place-items-center rounded-full border border-white/70 bg-black/15 text-white opacity-0 transition duration-300 group-hover:opacity-100 sm:size-9"><Play className="ml-0.5 size-3 fill-current" /></span></button>{taggedProducts.length > 0 && <div className="absolute bottom-3 right-3 z-10"><Link href={`/products/${taggedProducts[0].id}`} onClick={() => trackShopClick(video.id, taggedProducts[0].id)} style={{ backgroundColor: video.buttonColor }} className="inline-flex border border-white/75 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_5px_18px_rgba(0,0,0,.18)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white">Shop now</Link></div>}</div>; })}</div>{typeof document !== "undefined" && viewer ? createPortal(viewer, document.body) : null}</section>;
}
