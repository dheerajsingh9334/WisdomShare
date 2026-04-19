import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTrendingPostsAPI } from "../../APIServices/posts/postsAPI";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Headphones,
  Heart,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  Loader2
} from "lucide-react";

// Provide fallback stock Unsplash images according to instructions
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=800&q=80",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
];

const highlights = [
  {
    title: "Audio Articles",
    description: "Immerse yourself in cinematic soundscapes crafted from our top stories.",
  },
];

export function GlassmorphismListenAppBlock() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch real data (Trending Posts) from WisdomShare APIs
  const { data: responseData, isLoading } = useQuery({
    queryKey: ["trending-posts-audio"],
    queryFn: getTrendingPostsAPI,
  });

  // Handle the backend's response structure safely
  const posts = responseData?.posts || responseData || [];
  
  // Only grab top 4 to fit the exact layout beautifully
  const displayPosts = Array.isArray(posts) ? posts.slice(0, 4) : [];

  const activeTrack = displayPosts[activeIndex];
  const activeImage = activeTrack?.image?.url || FALLBACK_IMAGES[activeIndex % FALLBACK_IMAGES.length];

  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-foreground/[0.03] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-foreground/[0.02] blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <Card className="relative overflow-hidden border border-border/50 bg-background/40 p-10 shadow-[0_40px_120px_rgba(15,23,42,0.25)] backdrop-blur-2xl md:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.05] via-transparent to-transparent" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-10">
              <div className="space-y-5">
                <Badge
                  variant="outline"
                  className="w-fit border-border/60 bg-background/40 text-xs uppercase tracking-[0.2em] text-foreground/70 backdrop-blur"
                >
                  Featured Reads & Listens
                </Badge>
                <div className="space-y-4">
                  <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                    Wisdom that feels like a private concert
                  </h2>
                  <p className="max-w-xl text-base leading-relaxed text-foreground/70 md:text-lg">
                    Stream, discover, and share incredible posts converted to audio with glassy interfaces,
                    subtle motion, and immersive visuals that keep the focus on the content.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Button size="lg" className="h-12 rounded-full px-8 text-base">
                  Start listening
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full px-8 text-base hover:bg-foreground/5"
                >
                  View library
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                {highlights.map((highlight) => (
                  <div
                    key={highlight.title}
                    className="group h-full rounded-3xl border border-border/40 bg-background/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-border"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-foreground/10 text-foreground/80">
                      <Headphones className="h-4 w-4" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {highlight.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-foreground/70">
                      {highlight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center rounded-3xl border border-border/40 bg-background/70 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
                   <Loader2 className="h-8 w-8 animate-spin text-foreground/50" />
                </div>
              ) : displayPosts.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-3xl border border-border/40 bg-background/70 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
                   <p className="text-foreground/60">No posts available right now.</p>
                </div>
              ) : (
                <div className="rounded-3xl border border-border/40 bg-background/70 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-foreground/10">
                      <img src={activeImage} alt={activeTrack.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-4 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs uppercase tracking-[0.3em] text-foreground/60">
                            Now playing
                          </p>
                          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground truncate">
                            {activeTrack.title}
                          </h3>
                          <p className="text-sm text-foreground/60 truncate">
                            {activeTrack.author?.username || "WisdomShare Creator"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 rounded-full border border-border/40 bg-background/60 text-foreground/70 backdrop-blur hover:text-foreground"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs uppercase tracking-[0.2em] text-foreground/70 backdrop-blur hover:text-foreground"
                        asChild
                      >
                        <a
                          href={`/posts/${activeTrack._id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Read Post
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6">
                    <div className="flex items-center justify-between text-xs font-medium tracking-wide text-foreground/50">
                      <span>00:00</span>
                      <span>{activeTrack.readingTimeMinutes > 0 ? `${activeTrack.readingTimeMinutes}:00` : '3:45'}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-foreground to-foreground/40 transition-[width]"
                        style={{ width: `${isPlaying ? '45%' : '0%'}` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full border border-border/40 bg-background/60 text-foreground/70 backdrop-blur hover:text-foreground"
                      >
                        <Shuffle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full border border-border/40 bg-background/60 text-foreground/70 backdrop-blur hover:text-foreground"
                        onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayPosts.length - 1))}
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button 
                      className="h-12 w-12 rounded-full bg-foreground text-background hover:bg-foreground/90 flex items-center justify-center"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full border border-border/40 bg-background/60 text-foreground/70 backdrop-blur hover:text-foreground"
                        onClick={() => setActiveIndex((prev) => (prev < displayPosts.length - 1 ? prev + 1 : 0))}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full border border-border/40 bg-background/60 text-foreground/70 backdrop-blur hover:text-foreground"
                      >
                        <Repeat className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full border border-border/40 bg-background/60 text-foreground/70 backdrop-blur hover:text-foreground"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 overflow-hidden rounded-3xl border border-border/40 bg-background/80 shadow-[0_20px_60px_rgba(15,23,42,0.35)] backdrop-blur">
                    <img 
                      src={activeImage} 
                      alt="Current Track Visualizer"
                      className="h-[152px] w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="max-h-80 space-y-3 overflow-y-auto pr-2 sm:max-h-[24rem]">
                  {!isLoading && displayPosts.map((track, index) => {
                    const isActive = index === activeIndex;
                    const fallbackImg = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                    const trackImg = track?.image?.url || fallbackImg;

                    return (
                      <button
                        key={track._id || index}
                        type="button"
                        onClick={() => {
                           setActiveIndex(index);
                           setIsPlaying(true);
                        }}
                        aria-pressed={isActive}
                        className={`group flex w-full items-center gap-4 rounded-3xl border border-border/40 bg-background/60 p-5 text-left backdrop-blur-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
                          isActive
                            ? "border-foreground/40 bg-foreground/[0.08] shadow-[0_20px_60px_rgba(15,23,42,0.35)]"
                            : "hover:-translate-y-1 hover:border-border/60"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/40 text-sm font-semibold transition-colors ${
                            isActive
                              ? "border-foreground/60"
                              : "border-border/40"
                          }`}
                        >
                          <img 
                            src={trackImg} 
                            className="h-full w-full object-cover"
                            alt=""
                          />
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground/90 truncate text-left">
                              {track.title}
                            </p>
                            <p className="text-xs text-foreground/60 truncate text-left">
                              {track.author?.username || "Creator"}
                            </p>
                          </div>
                          <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/50 flex-shrink-0">
                            {track.readingTimeMinutes > 0 ? `${track.readingTimeMinutes}:00` : '3:45'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background/90 via-background/40 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
