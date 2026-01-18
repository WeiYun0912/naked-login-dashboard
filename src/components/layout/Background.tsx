import { motion } from 'framer-motion';

const blobs = [
  {
    id: 1,
    size: 600,
    x: '10%',
    y: '20%',
    color: 'rgba(94, 106, 210, 0.15)',
    duration: 20,
  },
  {
    id: 2,
    size: 500,
    x: '70%',
    y: '60%',
    color: 'rgba(104, 114, 217, 0.12)',
    duration: 25,
  },
  {
    id: 3,
    size: 400,
    x: '50%',
    y: '10%',
    color: 'rgba(94, 106, 210, 0.1)',
    duration: 22,
  },
  {
    id: 4,
    size: 350,
    x: '80%',
    y: '20%',
    color: 'rgba(138, 143, 152, 0.08)',
    duration: 18,
  },
];

export function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(94, 106, 210, 0.15), transparent),
            radial-gradient(ellipse 60% 40% at 100% 100%, rgba(94, 106, 210, 0.1), transparent),
            linear-gradient(to bottom, #020203, #050506)
          `,
        }}
      />

      {/* Animated blobs */}
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full blur-3xl"
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.x,
            top: blob.y,
            background: blob.color,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 30, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}
