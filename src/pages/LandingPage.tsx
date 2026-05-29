import { ArrowRight, ArrowUpRight, Shield, ShieldCheck, Sparkles, Zap, EyeOff, Lock } from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export function LandingPage({ onLaunchApp }: LandingPageProps) {
  return (
    <div className="bg-grid antialiased font-sans text-zinc-100 flex flex-col h-full overflow-y-auto">
      <style>{`
        .bg-grid {
            background-size: 40px 40px;
            background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
      `}</style>
      
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-blue-500" /> MaskMyID
                </span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                <a href="#features" className="hover:text-white transition">Features</a>
                <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
                <a href="#features" className="hover:text-white transition">Privacy First</a>
            </div>

            <div>
                <button onClick={onLaunchApp}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition">
                    Launch App <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </nav>

      <header className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                <Lock className="w-3.5 h-3.5" /> 100% Client-Side Processing
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
                Redact sensitive data. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    Keep your identity yours.
                </span>
            </h1>

            <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Mask IDs, passports, and utility bills instantly. Your files never touch a server—everything happens
                safely right inside your web browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={onLaunchApp}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-600/10">
                    <Sparkles className="w-5 h-5" /> Start Masking Free
                </button>
                <a href="#how-it-works"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition">
                    See How it Works
                </a>
            </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/30 p-2 backdrop-blur-sm shadow-2xl group">
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[16/9] flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 opacity-60"></div>

                <div className="w-full h-full flex opacity-85">
                    <div className="w-1/4 border-r border-zinc-900 p-4 space-y-4 hidden sm:block bg-zinc-900/40">
                        <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg"></div>
                            <div className="h-10 bg-zinc-800 rounded-lg"></div>
                        </div>
                        <div className="h-4 bg-zinc-800 rounded w-2/3 pt-4"></div>
                        <div className="h-8 bg-zinc-800 rounded-lg"></div>
                        <div className="h-8 bg-zinc-800 rounded-lg"></div>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-8 bg-zinc-950 relative">
                        <div className="relative rounded-lg overflow-hidden max-w-xs border border-zinc-800">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
                                alt="Sample Masking UI" className="brightness-75" />
                            <div className="absolute top-[20%] left-[25%] w-24 h-6 bg-black border border-zinc-600 rounded shadow-md flex items-center justify-center text-[8px] tracking-wider text-zinc-400 select-none">
                                MASKED</div>
                            <div className="absolute top-[45%] left-[15%] w-32 h-10 bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded shadow-md flex items-center justify-center text-[8px] tracking-wider text-white select-none">
                                PIXELATED</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section id="features" className="border-t border-zinc-900 bg-zinc-900/20 py-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">Everything you need to protect
                    your documents</h2>
                <p className="text-zinc-400">Simple tools engineered specifically for document shielding and privacy
                    defense.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-5">
                        <EyeOff className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Multiple Mask Styles</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">Choose between professional solid black blocks,
                        aesthetic pixelation filters, or classic heavy blurs to obscure your private data.</p>
                </div>
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-5">
                        <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Zero Cloud Risk</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">Our static architecture means images never leave
                        your local system. Absolute immunity from database hacks and cloud leaks.</p>
                </div>
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5">
                        <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast & Free</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">No signups, no watermarks, no subscriptions. Drop
                        your file, mask your confidential text, and export your copy in under 5 seconds.</p>
                </div>
            </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">Secure redaction in 3 simple
                    steps</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                <div className="relative">
                    <div className="text-6xl font-black text-zinc-800 mb-4 select-none">01</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Import Image</h3>
                    <p className="text-sm text-zinc-400">Drag & drop your passport, ID card, or billing statements straight
                        into the workspace panel.</p>
                </div>
                <div className="relative">
                    <div className="text-6xl font-black text-zinc-800 mb-4 select-none">02</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Draw & Hide</h3>
                    <p className="text-sm text-zinc-400">Select rectangles or circles to trace over sensitive details like
                        account numbers, signatures, or faces.</p>
                </div>
                <div className="relative">
                    <div className="text-6xl font-black text-zinc-800 mb-4 select-none">03</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Safe Export</h3>
                    <p className="text-sm text-zinc-400">Download a flattened secure copy directly to your download
                        directory instantly.</p>
                </div>
            </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 md:p-12 text-center overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to safely protect your documents?</h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-8 text-sm sm:text-base">Join thousands of users keeping their
                data offline and safe from online fraud exposures.</p>

            <button onClick={onLaunchApp}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-600/15">
                Launch Editor Panel <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </section>

      <footer className="border-t border-zinc-900 py-8 bg-zinc-950 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>&copy; 2026 MaskMyID. Open-source, client-side, privacy design.</p>
            <div className="flex items-center gap-6">
                <span className="flex items-center gap-1 text-emerald-500/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Fully Local Processing Active
                </span>
            </div>
        </div>
      </footer>
    </div>
  );
}
