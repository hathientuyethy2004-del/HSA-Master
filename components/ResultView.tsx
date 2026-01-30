
import React from 'react';
import { QuizState } from '../types';
import { EXAM_CONFIGS } from '../constants';
import MathContent from './MathContent';

interface ResultViewProps {
  state: QuizState;
  onRestart: () => void;
  onHome: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ state, onRestart, onHome }) => {
  const config = EXAM_CONFIGS[state.section];
  const correctCount = state.questions.filter(q => 
    state.answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
  ).length;
  
  const score = (correctCount / state.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center items-start overflow-y-auto">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden mb-8 border border-gray-100">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-12 text-center text-white relative">
            <h1 className="text-3xl font-black mb-2 uppercase tracking-widest">Phân tích Kết quả</h1>
            <p className="opacity-60 text-sm font-bold tracking-widest uppercase">{config.name}</p>
            
            <div className="mt-8 inline-flex flex-col items-center justify-center w-48 h-48 bg-white/10 rounded-full border-8 border-white/5 backdrop-blur-xl shadow-inner">
              <span className="text-6xl font-black">{Math.round(score)}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] mt-1 opacity-60">Điểm HSA</span>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto">
               <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                <p className="text-[10px] uppercase font-black opacity-50 mb-1">Chính xác</p>
                <p className="text-2xl font-black text-green-400">{correctCount}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                <p className="text-[10px] uppercase font-black opacity-50 mb-1">Câu hỏi</p>
                <p className="text-2xl font-black">{state.questions.length}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                <p className="text-[10px] uppercase font-black opacity-50 mb-1">Thời gian</p>
                <p className="text-2xl font-black text-blue-300">{Math.floor((config.duration * 60 - state.timeLeft) / 60)}p</p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {state.analysis && (
              <section className="bg-indigo-50 rounded-[32px] p-8 border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <i className="fa-solid fa-brain text-8xl"></i>
                </div>
                <h2 className="text-xl font-black text-indigo-900 mb-6 flex items-center">
                  <i className="fa-solid fa-wand-magic-sparkles mr-3"></i> Lộ trình khắc phục lỗ hổng
                </h2>
                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-indigo-400 mb-3 tracking-widest">Ưu điểm tư duy</h3>
                    <ul className="space-y-2">
                      {state.analysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start text-sm font-bold text-indigo-800">
                          <i className="fa-solid fa-circle-check mt-1 mr-2 text-green-500"></i> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-indigo-400 mb-3 tracking-widest">Lỗ hổng kỹ năng</h3>
                    <ul className="space-y-2">
                      {state.analysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start text-sm font-bold text-red-800">
                          <i className="fa-solid fa-circle-xmark mt-1 mr-2 text-red-400"></i> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-indigo-200">
                   <p className="text-sm font-medium text-indigo-900 leading-relaxed italic">
                     <span className="font-black mr-2">Cố vấn AI:</span> {state.analysis.recommendations}
                   </p>
                </div>
              </section>
            )}

            <section>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-2xl font-black text-gray-800">Hướng dẫn giải chi tiết</h2>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nền tảng HSA Master</span>
              </div>
              <div className="space-y-12">
                {state.questions.map((q, idx) => {
                  const userAnswer = state.answers[q.id] || '(Bỏ trống)';
                  const isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                  return (
                    <div key={q.id} className="group">
                      <div className={`p-8 rounded-[32px] border-2 bg-white transition-all ${isCorrect ? 'border-green-100 shadow-sm' : 'border-red-100 shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center space-x-3">
                             <span className="bg-gray-900 text-white w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black italic">#{idx + 1}</span>
                             <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">{q.subject}</span>
                          </div>
                          {isCorrect ? (
                            <div className="flex items-center text-green-600 font-black text-[10px] uppercase tracking-widest">
                               <i className="fa-solid fa-check-circle mr-2 text-sm"></i> Hoàn hảo
                            </div>
                          ) : (
                            <div className="flex items-center text-red-500 font-black text-[10px] uppercase tracking-widest">
                               <i className="fa-solid fa-circle-exclamation mr-2 text-sm"></i> Cần xem lại
                            </div>
                          )}
                        </div>
                        
                        <MathContent content={q.content} className="text-xl text-gray-800 font-bold mb-10 leading-relaxed" />
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-10">
                          <div className={`p-6 rounded-3xl border-2 ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Bạn đã nhập</p>
                            <MathContent content={userAnswer} className={`text-2xl font-black ${isCorrect ? 'text-green-700' : 'text-red-600'}`} />
                          </div>
                          <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100">
                            <p className="text-[9px] font-black text-blue-400 uppercase mb-2 tracking-widest">Đáp án chuẩn</p>
                            <MathContent content={q.correctAnswer} className="text-2xl font-black text-blue-800" />
                          </div>
                        </div>

                        <div className="relative">
                           <div className="absolute -left-8 top-0 bottom-0 w-1 bg-blue-600 rounded-full opacity-20"></div>
                           <div className="p-6 bg-gray-50 rounded-[24px] text-gray-700">
                              <h4 className="flex items-center text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">
                                <i className="fa-solid fa-stairs mr-2"></i> Lộ trình tư duy & Giải thuật
                              </h4>
                              <MathContent content={q.explanation} className="text-sm font-medium leading-loose whitespace-pre-line" />
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-20">
          <button 
            onClick={onRestart}
            className="flex-1 bg-blue-600 text-white py-6 rounded-3xl font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center"
          >
            <i className="fa-solid fa-rotate-right mr-3"></i> Thử lại bộ đề này
          </button>
          <button 
            onClick={onHome}
            className="flex-1 bg-white border-2 border-gray-100 text-gray-500 py-6 rounded-3xl font-black hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center"
          >
            <i className="fa-solid fa-house mr-3"></i> Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
