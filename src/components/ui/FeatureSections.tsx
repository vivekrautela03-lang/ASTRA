import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Eye, Workflow, Globe2 } from 'lucide-react';

export const FeatureSections: React.FC = () => {
  const features = [
    {
      id: 'neural',
      badge: '01 / COGNITION',
      title: 'Neural Intelligence',
      subtitle: 'Living digital consciousness driven by GPU particle shaders and real-time reasoning.',
      icon: Cpu,
      stats: [
        { label: 'Latency', value: '12ms' },
        { label: 'Particles', value: '10,000+' },
        { label: 'Context', value: 'Infinite' },
      ],
    },
    {
      id: 'spatial',
      badge: '02 / PERCEPTION',
      title: 'Spatial 3D Awareness',
      subtitle: 'Responds instantly to cursor movement, camera depth, and user proximity with spring inertia.',
      icon: Eye,
      stats: [
        { label: 'Frame Rate', value: '60 FPS' },
        { label: 'Depth Planes', value: '12 Layers' },
        { label: 'Physics', value: 'Spring Lerp' },
      ],
    },
    {
      id: 'autonomous',
      badge: '03 / ORCHESTRATION',
      title: 'Autonomous Subagents',
      subtitle: 'Self-directed AI subagent network executing background code, research, and system workflows.',
      icon: Workflow,
      stats: [
        { label: 'Subagents', value: 'Active' },
        { label: 'Isolation', value: '100% Local' },
        { label: 'Security', value: 'Encrypted' },
      ],
    },
    {
      id: 'news',
      badge: '04 / LIVE NEWS',
      title: 'World & India News Pulse',
      subtitle: 'A quick glance at the latest headlines from international outlets and India-side updates in one place.',
      icon: Globe2,
      stats: [
        { label: 'International', value: 'Live' },
        { label: 'India', value: 'Live' },
        { label: 'Coverage', value: '24/7' },
      ],
      newsGroups: [
        {
          label: 'International',
          items: [
            { title: 'Global markets react to fresh rate and energy signals', source: 'Reuters', time: '8m ago' },
            { title: 'New climate and trade talks reshape major supply chains', source: 'BBC', time: '22m ago' },
            { title: 'Tech leaders unveil next wave of AI infrastructure updates', source: 'The Verge', time: '41m ago' },
          ],
        },
        {
          label: 'India',
          items: [
            { title: 'India pushes new digital public infrastructure and startup initiatives', source: 'NDTV', time: '12m ago' },
            { title: 'Major cities see renewed focus on transport and clean-energy projects', source: 'Times of India', time: '33m ago' },
            { title: 'Policy updates drive growth across health, education and finance sectors', source: 'Economic Times', time: '55m ago' },
          ],
        },
      ],
    },
  ];

  return (
    <section className="relative w-full py-32 px-4 md:px-12 max-w-6xl mx-auto space-y-32 z-30 pointer-events-auto">
      {features.map((feat) => {
        const Icon = feat.icon;
        return (
          <motion.div
            key={feat.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hud-card p-8 md:p-12 rounded-3xl glass-panel-glow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-white/10"
          >
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20">
                {feat.badge}
              </span>

              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-heading">
                {feat.title}
              </h2>

              <p className="text-base text-white/60 font-light leading-relaxed max-w-xl">
                {feat.subtitle}
              </p>

              {feat.id === 'news' && feat.newsGroups ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {feat.newsGroups.map((group) => (
                    <div key={group.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-sm font-semibold text-cyan-300 mb-3">{group.label}</div>
                      <ul className="space-y-2 text-sm text-white/70">
                        {group.items.map((item, idx) => (
                          <li key={`${group.label}-${idx}`} className="border-b border-white/10 pb-2 last:border-b-0 last:pb-0">
                            <div className="font-medium text-white/90">{item.title}</div>
                            <div className="text-[11px] uppercase tracking-wide text-white/40 mt-1">
                              {item.source} • {item.time}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                  {feat.stats.map((st, i) => (
                    <div key={i}>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-0.5">
                        {st.label}
                      </span>
                      <span className="text-lg md:text-xl font-bold font-mono text-cyan-300">
                        {st.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Icon Card Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-48 h-48 rounded-3xl glass-panel flex items-center justify-center border border-cyan-400/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-transparent blur-xl group-hover:opacity-100 transition-opacity" />
                <Icon className="w-16 h-16 text-cyan-400 relative z-10 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
};
