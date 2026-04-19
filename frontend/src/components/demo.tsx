import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid"
import Pricing from "@/components/ui/pricing-section";
import { SalesDashboard } from "@/components/ui/live-sales-dashboard";
import { Features } from "@/components/ui/features-4";
import { FeatureCard } from "./ui/grid-feature-cards";
import { Zap, Cpu, Fingerprint, Pencil, Settings2, Sparkles, CheckCircle, TrendingUp, Video, Globe } from "lucide-react";
import { motion, useReducedMotion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const itemsSample: BentoItem[] = [
    {
        title: "Analytics Dashboard",
        meta: "v2.4.1",
        description: "Real-time metrics with AI-powered insights and predictive analytics",
        icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
        status: "Live",
        tags: ["Statistics", "Reports", "AI"],
        colSpan: 2,
        hasPersistentHover: true,
    },
    {
        title: "Task Manager",
        meta: "84 completed",
        description: "Automated workflow management with priority scheduling",
        icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
        image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2672&auto=format&fit=crop",
        status: "Updated",
        tags: ["Productivity", "Automation"],
    },
    {
        title: "Media Library",
        meta: "12GB used",
        description: "Cloud storage with intelligent content processing",
        icon: <Video className="w-4 h-4 text-purple-500" />,
        image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2671&auto=format&fit=crop",
        tags: ["Storage", "CDN"],
        colSpan: 2,
    },
    {
        title: "Global Network",
        meta: "6 regions",
        description: "Multi-region deployment with edge computing",
        icon: <Globe className="w-4 h-4 text-sky-500" />,
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop",
        status: "Beta",
        tags: ["Infrastructure", "Edge"],
    },
];

export function BentoGridDemo() {
    return <BentoGrid items={itemsSample} />
}

export default function DemoOne() {
  return (
    <div className="bg-black min-h-screen text-white p-4">
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-white/5 border border-white/10 rounded-none">
            <TabsTrigger value="dashboard" className="rounded-none data-[state=active]:bg-white/10">Sales Dashboard</TabsTrigger>
            <TabsTrigger value="pricing" className="rounded-none data-[state=active]:bg-white/10">Pricing</TabsTrigger>
            <TabsTrigger value="features" className="rounded-none data-[state=active]:bg-white/10">Features 1</TabsTrigger>
            <TabsTrigger value="features2" className="rounded-none data-[state=active]:bg-white/10">Grid Features</TabsTrigger>
            <TabsTrigger value="bento" className="rounded-none data-[state=active]:bg-white/10">Bento Grid</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="dashboard" className="mt-0">
          <SalesDashboard 
            totalPosts={124}
            totalFollowing={45}
            avgLikes={8.5}
            posts={[
              { _id: '1', title: 'Getting Started with React', views: 1200, likesCount: 150, commentsCount: 24, createdAt: new Date().toISOString(), slug: 'react-start' },
              { _id: '2', title: 'Mastering Tailwind CSS', views: 800, likesCount: 90, commentsCount: 12, createdAt: new Date().toISOString(), slug: 'tailwind-master' },
              { _id: '3', title: 'The Future of AI', views: 3000, likesCount: 450, commentsCount: 89, createdAt: new Date().toISOString(), slug: 'ai-future' },
            ]}
          />
        </TabsContent>
        <TabsContent value="pricing" className="mt-0">
          <Pricing />
        </TabsContent>
        <TabsContent value="features" className="mt-0">
          <Features />
        </TabsContent>
        <TabsContent value="features2" className="mt-0">
          <section className="py-16 md:py-32">
            <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
              <AnimatedContainer className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold text-white">
                  Power. Speed. Control.
                </h2>
                <p className="text-gray-400 mt-4 text-sm tracking-wide text-balance md:text-base">
                  Everything you need to build fast, secure, scalable apps.
                </p>
              </AnimatedContainer>

              <AnimatedContainer
                delay={0.4}
                className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed border-white/10 divide-white/10 sm:grid-cols-2 md:grid-cols-3"
              >
                {[
                  { title: 'Faaast', icon: Zap, description: 'It supports an entire helping developers and innovate.' },
                  { title: 'Powerful', icon: Cpu, description: 'It supports an entire helping developers and businesses.' },
                  { title: 'Security', icon: Fingerprint, description: 'It supports an helping developers businesses.' },
                  { title: 'Customization', icon: Pencil, description: 'It supports helping developers and businesses innovate.' },
                  { title: 'Control', icon: Settings2, description: 'It supports helping developers and businesses innovate.' },
                  { title: 'Built for AI', icon: Sparkles, description: 'It supports helping developers and businesses innovate.' },
                ].map((feature, i) => (
                  <FeatureCard key={i} feature={feature} />
                ))}
              </AnimatedContainer>
            </div>
          </section>
        </TabsContent>
        <TabsContent value="bento" className="mt-0">
          <div className="max-w-6xl mx-auto py-10">
            <BentoGridDemo />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnimatedContainer({ className, delay = 0.1, children }: { className?: string, delay?: number, children: React.ReactNode }) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
