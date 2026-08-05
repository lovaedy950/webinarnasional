import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/webinarData';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FaqSection: React.FC = () => {
  const [openIds, setOpenIds] = useState<number[]>([]);

  const toggleAccordion = (id: number) => {
    if (openIds.includes(id)) {
      setOpenIds(openIds.filter((item) => item !== id));
    } else {
      setOpenIds([...openIds, id]);
    }
  };

  // Divide FAQ items into 2 columns matching the image layout
  const leftColFaqs = [FAQ_ITEMS[0], FAQ_ITEMS[2], FAQ_ITEMS[4]];
  const rightColFaqs = [FAQ_ITEMS[1], FAQ_ITEMS[3], FAQ_ITEMS[5]];

  return (
    <section id="faq" className="py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang <span className="relative inline-block text-slate-900">
              Sering
              <span className="absolute bottom-1 left-0 w-full h-1 bg-cyan-600 rounded-full"></span>
            </span> Diajukan
          </h2>
        </div>

        {/* 2-Column Accordion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
          
          {/* Column 1 */}
          <div className="space-y-4">
            {leftColFaqs.map((item) => {
              const isOpen = openIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200 hover:border-cyan-300"
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full py-4 px-5 flex items-center justify-between text-left font-bold text-slate-800 hover:text-cyan-800 transition-colors cursor-pointer text-sm sm:text-base gap-3"
                  >
                    <span>{item.question}</span>
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                      {isOpen ? <Minus className="w-4 h-4 text-cyan-600" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            {rightColFaqs.map((item) => {
              const isOpen = openIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200 hover:border-cyan-300"
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full py-4 px-5 flex items-center justify-between text-left font-bold text-slate-800 hover:text-cyan-800 transition-colors cursor-pointer text-sm sm:text-base gap-3"
                  >
                    <span>{item.question}</span>
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                      {isOpen ? <Minus className="w-4 h-4 text-cyan-600" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
