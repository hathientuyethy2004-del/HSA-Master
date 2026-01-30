
import React from 'react';
import { QuizState, PracticeMode } from '../types';
import { EXAM_CONFIGS } from '../constants';
import Keypad from './Keypad';
import MathContent from './MathContent';

interface QuizViewProps {
  state: QuizState;
  onAnswer: (questionId: string, answer: string) => void;
  onFinish: () => void;
  onNavigate: (index: number) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ state, onAnswer, onFinish, onNavigate }) => {
  const { currentQuestionIndex, questions, answers, timeLeft, mode } = state;
  const currentQuestion = questions[currentQuestionIndex];
  const config = (EXAM_CONFIGS as any)[state.section];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleKeypadInput = (val: string) => {
    const currentVal = answers[currentQuestion.id] || '';
    if (val === '.' && currentVal.includes('.')) return;
    if (val === '-' && currentVal.length > 0) return;
    if (currentVal.length > 15) return;
    onAnswer(currentQuestion.id, currentVal + val);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm relative z-50">
        <div className="flex items-center space-x-3">
          <button onClick={() => {if(confirm('Thoát bài thi?')) onFinish()}} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
          <div>
            <div className="flex items-center space-x-2">
               <h1 className="font-black text-gray-800 text-sm">{config.name}</h1>
               <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">HSA 2026</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{config.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-4 py-1.5 rounded-xl font-mono font-bold text-lg border-2 transition-all ${timeLeft < 300 ? 'border-red-500 text-red-600 animate-pulse' : 'border-blue-100 text-blue-600'}`}>
            {formatTime(timeLeft)}
          </div>
          <button onClick={onFinish} className="bg-blue-600 text-white px-5 py-1.5 rounded-xl text-sm font-black shadow-lg hover:bg-blue-700 transition-all">Nộp bài</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <aside className="hidden md:block w-72 bg-white border-r p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Lưới câu hỏi</h4>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => onNavigate(idx)}
                  className={`h-11 rounded-xl text-[11px] font-black transition-all ${
                    idx === currentQuestionIndex 
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : answers[q.id] ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-400 border border-transparent'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Cấu trúc 2026</p>
               <p className="text-[11px] text-gray-600 leading-relaxed font-medium">{config.structure}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
               <p className="text-[10px] font-bold text-orange-400 mb-2 uppercase">Lưu ý</p>
               <p className="text-[11px] text-orange-700 leading-relaxed font-medium italic">"Câu hỏi chùm sẽ có ngữ liệu dài. Đừng bỏ sót thông tin trong bảng biểu."</p>
            </div>
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 flex flex-col items-center">
          <div className="w-full max-w-5xl space-y-6 animate-fade-in pb-20">
            
            {currentQuestion.context && (
              <div className="bg-indigo-950 text-white rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/10">
                <div className="flex items-center space-x-3 mb-6">
                   <span className="bg-blue-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Ngữ liệu chùm</span>
                   <div className="h-px flex-1 bg-white/10"></div>
                </div>
                <MathContent 
                  content={currentQuestion.context} 
                  className="text-sm md:text-base leading-relaxed opacity-90 prose prose-invert max-w-none font-medium" 
                />
              </div>
            )}

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 relative">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-3">
                   <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Câu {currentQuestionIndex + 1}</span>
                   <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${
                     currentQuestion.difficulty === 'LEVEL_3' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                   }`}>
                     {currentQuestion.difficulty}
                   </span>
                </div>
                <div className="flex items-center space-x-2">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentQuestion.subject}</span>
                   <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border shadow-sm ${currentQuestion.type === 'FILL_IN' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {currentQuestion.type === 'MCQ' ? 'Trắc nghiệm' : 'Điền đáp án số'}
                  </span>
                </div>
              </div>

              <MathContent 
                content={currentQuestion.content} 
                className="text-xl md:text-2xl text-gray-800 leading-relaxed font-bold mb-12" 
              />

              {currentQuestion.type === 'MCQ' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options?.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => onAnswer(currentQuestion.id, option)}
                      className={`group flex items-center p-6 rounded-2xl border-2 transition-all text-left ${
                        answers[currentQuestion.id] === option 
                        ? 'border-blue-600 bg-blue-50 shadow-lg' 
                        : 'border-gray-50 hover:border-blue-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black mr-4 shrink-0 ${
                        answers[currentQuestion.id] === option ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <MathContent 
                        content={option} 
                        className={`text-lg font-bold ${answers[currentQuestion.id] === option ? 'text-blue-900' : 'text-gray-600'}`} 
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
                  <div className="w-full max-w-sm">
                    <div className="text-center mb-6">
                      <p className="text-[10px] font-black text-gray-300 uppercase mb-4 tracking-[0.3em]">Kết quả tính toán</p>
                      <input
                        type="text"
                        readOnly
                        value={answers[currentQuestion.id] || ''}
                        className="w-full h-20 bg-gray-900 border-4 border-blue-500 rounded-3xl px-6 text-4xl font-black text-center text-blue-400 shadow-2xl focus:outline-none"
                        placeholder="---"
                      />
                    </div>
                  </div>
                  <div className="w-full max-w-[320px] bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <Keypad 
                      onInput={handleKeypadInput} 
                      onBackspace={() => onAnswer(currentQuestion.id, (answers[currentQuestion.id] || '').slice(0, -1))} 
                      onClear={() => onAnswer(currentQuestion.id, '')} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center px-4">
              <button
                onClick={() => onNavigate(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="px-8 py-3 bg-white border border-gray-100 rounded-2xl font-black text-gray-400 disabled:opacity-20 hover:bg-gray-50 transition-all"
              >
                <i className="fa-solid fa-chevron-left mr-3"></i> Trước
              </button>
              <button
                onClick={() => onNavigate(currentQuestionIndex + 1)}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all"
              >
                Sau <i className="fa-solid fa-chevron-right ml-3"></i>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default QuizView;
