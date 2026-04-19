import { Cpu, Fingerprint, Pencil, Settings2, Sparkles, Zap } from 'lucide-react'

export function Features() {
    return (
        <section className="py-12 md:py-20 bg-black text-white">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">The foundation for creative teams management</h2>
                    <p className="text-gray-400">Lyra is evolving to be more than just the models. It supports an entire to the APIs and platforms helping developers and businesses innovate.</p>
                </div>

                <div className="relative mx-auto grid max-w-2xl lg:max-w-4xl divide-x divide-y divide-white/10 border border-white/10 *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3 bg-black/40 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4 text-blue-500" />
                            <h3 className="text-sm font-medium">Faaast</h3>
                        </div>
                        <p className="text-sm text-gray-400">It supports an entire helping developers and innovate.</p>
                    </div>
                    <div className="space-y-2 bg-black/40 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <Cpu className="size-4 text-purple-500" />
                            <h3 className="text-sm font-medium">Powerful</h3>
                        </div>
                        <p className="text-sm text-gray-400">It supports an entire helping developers and businesses.</p>
                    </div>
                    <div className="space-y-2 bg-black/40 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="size-4 text-emerald-500" />

                            <h3 className="text-sm font-medium">Security</h3>
                        </div>
                        <p className="text-sm text-gray-400">It supports an helping developers businesses.</p>
                    </div>
                    <div className="space-y-2 bg-black/40 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <Pencil className="size-4 text-orange-500" />

                            <h3 className="text-sm font-medium">Customization</h3>
                        </div>
                        <p className="text-sm text-gray-400">It supports helping developers and businesses innovate.</p>
                    </div>
                    <div className="space-y-2 bg-black/40 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <Settings2 className="size-4 text-blue-400" />

                            <h3 className="text-sm font-medium">Control</h3>
                        </div>
                        <p className="text-sm text-gray-400">It supports helping developers and businesses innovate.</p>
                    </div>
                    <div className="space-y-2 bg-black/40 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4 text-yellow-500" />

                            <h3 className="text-sm font-medium">Built for AI</h3>
                        </div>
                        <p className="text-sm text-gray-400">It supports helping developers and businesses innovate.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
