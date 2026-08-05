import React from 'react';
import { Laptop, Award, Users, PlaySquare, MessageSquare, Smartphone, HeartPulse, Activity, Stethoscope, Dna, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export const WhyAttendSection: React.FC = () => {
  const kepakaranList = [
    {
      title: '1. Webinar Kardiovaskular (Jantung)',
      theme: 'Beyond the Bypass: Strategi Terintegrasi dalam Optimalisasi Tata Laksana Pasien CABG Menuju Luaran Klinis Terbaik',
      description: 'Materi mengupas tuntas seni pengambilan keputusan klinis, keperawatan fase akut terintegrasi (ERAS), hingga keberhasilan rehabilitasi jantung pasca-CABG.',
      icon: HeartPulse,
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
    },
    {
      title: '2. Webinar Neurosains (Stroke)',
      theme: 'Akselerasi Revaskularisasi Pasien Stroke, Efisiensi Length of Stay (LoS), dan Peningkatan Kualitas Hidup Secara Komprehensif dan Terkini: Zero Delay and Zero Complication',
      description: 'Menekankan filosofi "Time is Brain" guna mendorong tindakan revaskularisasi yang lebih cepat, efisiensi waktu rawat inap, dan nol komplikasi.',
      icon: Activity,
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    },
    {
      title: '3. Webinar Uronefro (Transplantasi Ginjal)',
      theme: 'Safe The Kidney, Safe The Life: Strategi Keperawatan Komprehensif Pasien Transplantasi Ginjal',
      description: 'Berfokus pada titik kritis asuhan 100 hari pertama pasca-transplantasi, mencakup deteksi dini rejeksi organ, panduan gizi, dan manajemen infeksi oportunistik.',
      icon: Stethoscope,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      title: '4. Webinar Onkologi (Transplantasi Sumsum Tulang)',
      theme: 'Sinergi Interprofesi dalam Membangun Layanan Transplantasi Sumsum Tulang yang Aman, Terintegrasi, dan Berkelanjutan',
      description: 'Menyoroti kolaborasi erat antara dokter, perawat, farmasis, dan Manajer Pelayanan Pasien (MPP) untuk menjamin keselamatan pasien pada setiap fase terapi Hematopoietic Stem Cell Transplantation (HSCT).',
      icon: Dna,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
  ];

  const reasons = [
    { title: 'Full Daring (Online)', subtitle: 'Akses fleksibel dari seluruh Indonesia', icon: Laptop },
    { title: 'Sertifikat JEP', subtitle: 'Tingkatkan poin portofolio keprofesian Anda', icon: Award },
    { title: 'Narasumber Ahli', subtitle: 'Klinisi ahli, dokter subspesialis, perawat spesialis, dan tim multidisiplin terbaik', icon: Users },
    { title: 'Rekaman Materi', subtitle: 'Akses ulang materi setelah webinar berlangsung', icon: PlaySquare },
    { title: 'Diskusi Interaktif', subtitle: 'Sesi tanya jawab langsung bersama narasumber', icon: MessageSquare },
    { title: 'Akses dari Mana Saja', subtitle: 'Belajar mudah kapan pun dan di mana pun', icon: Smartphone },
  ];

  return (
    <section id="latar-belakang" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* LATAR BELAKANG KEGIATAN SECTION */}
        <div className="bg-gradient-to-b from-slate-50 to-cyan-50/30 p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          
          {/* Header Latar Belakang */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>LATAR BELAKANG KEGIATAN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Akselerasi Kompetensi Klinis Medis & Keperawatan Berstandar Global
            </h2>
          </div>

          {/* Opening Narrative */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              Penanganan penyakit kritis di era kedokteran modern—mulai dari kasus kardiovaskular, kegawatan neurovaskular, hingga transplantasi organ—menuntut transformasi pelayanan klinis yang komprehensif, berbasis bukti (<i>evidence-based practice</i>), dan sinergi interprofesi yang kuat. Menjawab tantangan tersebut sekaligus memperingati momentum HUT ke-101, RSUP Dr. Kariadi sebagai pionir layanan rujukan nasional mempersembahkan <b>Parade Webinar Nasional</b> guna mempercepat akselerasi kompetensi klinis tenaga kesehatan di seluruh Indonesia.
            </p>
            <p className="font-semibold text-slate-800">
              Rangkaian webinar eksklusif ini berfokus pada inovasi perawatan berkelanjutan (<i>continuum of care</i>) yang mencakup 4 (empat) kepakaran unggulan medis, yaitu:
            </p>
          </div>

          {/* 4 Kepakaran Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kepakaranList.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-700 shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${item.badgeColor}`}>
                        {item.title}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                      &quot;{item.theme}&quot;
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Closing Narrative */}
          <div className="p-4 sm:p-5 rounded-2xl bg-cyan-900 text-white space-y-2 shadow-md">
            <p className="text-xs sm:text-sm leading-relaxed text-cyan-100">
              Melalui forum ilmiah lintas multidisiplin ini, seluruh peserta tidak hanya diajak untuk memperbarui ilmu pengetahuan dan keterampilan klinisnya, tetapi juga dipertajam daya saing (<i>value</i>) profesionalnya demi mewujudkan luaran layanan kesehatan pasien yang aman, efisien, dan bertaraf global.
            </p>
          </div>

        </div>

        {/* MENGAPA ANDA WAJIB MENGIKUTI */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mengapa Anda <span className="relative inline-block text-slate-900">
                Wajib
                <span className="absolute bottom-1 left-0 w-full h-1 bg-cyan-600 rounded-full"></span>
              </span> Mengikuti?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {reasons.map((item, index) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70 hover:bg-white hover:border-cyan-200 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-cyan-50 border border-slate-200 group-hover:border-cyan-200 flex items-center justify-center text-cyan-700 shadow-sm transition-colors mb-4">
                    <IconComp className="w-7 h-7" />
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-cyan-800 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.subtitle}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

