
import React, { useState, useEffect } from 'react';
import { Section, Subject, QuizState, Question, PracticeMode, HistoryRecord } from './types';
import { EXAM_CONFIGS, SAMPLE_QUESTIONS, MINDSET_GUIDE } from './constants';
import { generateHSAQuestions, analyzePerformance } from './services/geminiService';
import QuizView from './components/QuizView';
import ResultView from './components/ResultView';

const STATE_KEY = 'hsa_focus_state_v2';
const HISTORY_KEY = 'hsa_focus_history_v2';

const App: React.FC = () => {
  const [showPicker, setShowPicker] = useState<{section: Section, mode: PracticeMode} | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(() => {
    const saved = localStorage.getItem(STATE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (quizState && !quizState.isFinished) {
      localStorage.setItem(STATE_KEY, JSON.stringify(quizState));
    } else {
      localStorage.removeItem(STATE_KEY);
    }
  }, [quizState]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    let interval: number;
    if (quizState && !quizState.isFinished && quizState.timeLeft > 0) {
      interval = window.setInterval(() => {
        setQuizState(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null);
      }, 1000);
    } else if (quizState && quizState.timeLeft === 0 && !quizState.isFinished) {
      handleFinish();
    }
    return () => clearInterval(interval);
  }, [quizState]);

  const handleFinish = async () => {
    if (!quizState) return;
    setIsLoading(true);
    const analysis = await analyzePerformance(quizState.questions, quizState.answers);
    
    const correctCount = quizState.questions.filter(q => 
      quizState.answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
    ).length;
    const score = (correctCount / quizState.questions.length) * 100;

    const newRecord: HistoryRecord = {
      id: `history-${Date.now()}`,
      date: Date.now(),
      section: quizState.section,
      score,
      correctCount,
      totalQuestions: quizState.questions.length,
      analysis,
      mode: quizState.mode
    };

    setHistory(prev => [newRecord, ...prev].slice(0, 20));
    setQuizState(prev => prev ? ({ ...prev, isFinished: true, analysis }) : null);
    setIsLoading(false);
  };

  const startQuiz = async (section: Section, subjects: Subject[] = [], mode: PracticeMode = PracticeMode.FULL_EXAM) => {
    setIsLoading(true);
    setShowPicker(null);
    // Theo đề 2026: Phần 3 có 50 câu chia đều cho các lựa chọn. Ta demo 15 câu luyện tập.
    const questionCount = 15;
    const questions = await generateHSAQuestions(section, subjects, questionCount, mode);
    
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      isFinished: false,
      timeLeft: EXAM_CONFIGS[section].duration * 60,
      questions: questions.length > 0 ? questions : SAMPLE_QUESTIONS.filter(q => q.section === section),
      section,
      selectedSubjects: subjects,
      mode
    });
    setIsLoading(false);
  };

  const averageScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) 
    : 0;

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="relative mb-12">
          <div className="w-24 h-24 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-blue-600">
            <i className="fa-solid fa-graduation-cap text-2xl animate-pulse"></i>
          </div>
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Đang nạp đề minh họa 2026</h2>
        <p className="text-gray-500 max-w-xs mx-auto text-sm font-medium">Hệ thống đang cấu trúc lại bộ câu hỏi chùm theo tiêu chuẩn mới...</p>
      </div>
    );
  }

  if (quizState?.isFinished) {
    return (
      <ResultView 
        state={quizState} 
        onRestart={() => startQuiz(quizState.section, quizState.selectedSubjects, quizState.mode)} 
        onHome={() => setQuizState(null)} 
      />
    );
  }

  if (quizState) {
    return (
      <QuizView 
        state={quizState} 
        onAnswer={(id, ans) => setQuizState(prev => prev ? ({ ...prev, answers: { ...prev.answers, [id]: ans }}) : null)}
        onFinish={handleFinish}
        onNavigate={(idx) => setQuizState(prev => prev ? ({ ...prev, currentQuestionIndex: idx }) : null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {showPicker && (
        <SubjectPicker 
          mode={showPicker.mode}
          section={showPicker.section}
          onConfirm={(subs) => startQuiz(showPicker.section, subs, showPicker.mode)} 
          onCancel={() => setShowPicker(null)} 
        />
      )}
      
      <nav className="bg-white border-b sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-100">H</div>
          <span className="text-2xl font-black text-blue-900 tracking-tight">HSA<span className="text-orange-500">Master</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
            <i className="fa-solid fa-check-double mr-2"></i> Update 2026 Sát Thực Tế
          </div>
          <button 
            onClick={() => { if(confirm('Xóa sạch lịch sử?')) { localStorage.clear(); location.reload(); } }}
            className="text-gray-300 text-[10px] font-black uppercase hover:text-red-400 transition-colors"
          >
            Reset
          </button>
        </div>
      </nav>

      <header className="bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 py-24 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 text-9xl"><i className="fa-solid fa-superscript"></i></div>
          <div className="absolute bottom-10 right-10 text-9xl"><i className="fa-solid fa-dna"></i></div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <span className="inline-block px-4 py-1.5 bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-8">Chiến lược HSA 2026</span>
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
            Ôn Thi <span className="text-blue-400">ĐGNL 2026</span>
          </h1>
          <p className="text-xl opacity-60 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Hệ thống mô phỏng sát cấu trúc đề minh họa mới nhất: 3 phần thi, 75 phút/phần, câu hỏi chùm xử lý thông tin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {MINDSET_GUIDE.map((m, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl text-left hover:bg-white/10 transition-colors group">
                <h4 className="font-black text-blue-400 text-sm mb-2 uppercase tracking-widest">{m.title}</h4>
                <p className="text-xs opacity-70 leading-relaxed font-medium">{m.content}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl">
              <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                <i className="fa-solid fa-chart-line text-blue-600 mr-3"></i> Thống kê Năng lực
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
                    <span>Performance Score</span>
                    <span className="text-blue-600">{averageScore}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-1000" style={{width: `${averageScore}%`}}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Số câu đúng</p>
                    <p className="text-xl font-black text-gray-800">
                      {history.reduce((acc, curr) => acc + curr.correctCount, 0)}
                    </p>
                  </div>
                   <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Đã luyện</p>
                    <p className="text-xl font-black text-gray-800">
                      {history.reduce((acc, curr) => acc + curr.totalQuestions, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl max-h-[400px] overflow-hidden flex flex-col">
              <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                <i className="fa-solid fa-clock-rotate-left text-orange-500 mr-3"></i> Nhật ký luyện đề
              </h3>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <p className="text-center py-10 text-gray-400 text-sm font-bold italic">Chưa có dữ liệu bài làm</p>
                ) : (
                  history.map((record) => (
                    <div key={record.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-black text-blue-600 uppercase">
                          {EXAM_CONFIGS[record.section].name}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] text-gray-500 font-bold uppercase">{record.mode === PracticeMode.FILL_IN_ONLY ? 'Điền số' : 'Tổng hợp'}</p>
                         <span className="text-sm font-black text-gray-800">{Math.round(record.score)}/100</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.values(Section).map((sec, idx) => {
                const config = EXAM_CONFIGS[sec];
                return (
                  <div key={sec} className="bg-white rounded-[48px] p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all flex flex-col group animate-fade-in" style={{animationDelay: `${idx * 100}ms`}}>
                    <div className="flex justify-between items-start mb-8">
                      <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${
                        sec === Section.QUANTITATIVE ? 'bg-blue-50 text-blue-600' : 
                        sec === Section.VERBAL ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <i className={`fa-solid ${config.icon}`}></i>
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">New 2026</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-3">{config.name}</h3>
                    <p className="text-gray-500 text-xs mb-8 leading-relaxed font-medium">{config.subtitle}. Đánh giá năng lực suy luận và vận dụng kiến thức.</p>
                    <div className="mt-auto space-y-2">
                      <button 
                        onClick={() => setShowPicker({section: sec, mode: PracticeMode.FULL_EXAM})}
                        className="w-full py-4 bg-blue-600 text-white rounded-[20px] font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center text-sm"
                      >
                        <i className="fa-solid fa-play mr-2"></i> Bắt đầu Luyện thi
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
               <div className="relative z-10 max-w-lg">
                 <h4 className="text-2xl font-black mb-4 italic">Cảnh báo Phần 1 & Phần 3</h4>
                 <p className="text-sm opacity-90 leading-relaxed font-medium">
                   "Đề minh họa 2026 nhấn mạnh các câu hỏi <b>Điền đáp án số</b> chiếm tỉ lệ quan trọng. Hãy cẩn trọng với các phép tính phân số và số thập phân vì chỉ cần sai một chữ số là mất điểm cả câu."
                 </p>
               </div>
               <div className="absolute right-0 bottom-0 p-8 opacity-20 scale-150">
                 <i className="fa-solid fa-circle-exclamation text-9xl"></i>
               </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="py-16 text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.4em] px-6">
        Hệ thống ôn thi HSA Master &bull; Chuẩn cấu trúc 2026 &bull; AI Powered
      </footer>
    </div>
  );
};

const SubjectPicker: React.FC<{ 
  mode: PracticeMode,
  section: Section,
  onConfirm: (subjects: Subject[]) => void, 
  onCancel: () => void 
}> = ({ mode, section, onConfirm, onCancel }) => {
  const [selected, setSelected] = useState<Subject[]>([]);
  
  const optionsMap: Record<Section, {id: Subject, name: string, icon: string, color: string}[]> = {
    [Section.QUANTITATIVE]: [
      { id: Subject.MATH, name: 'Toán & Xử lý số liệu', icon: 'fa-chart-line', color: 'bg-blue-100 text-blue-600' }
    ],
    [Section.VERBAL]: [
      { id: Subject.LITERATURE, name: 'Ngôn ngữ - Văn học', icon: 'fa-pen-nib', color: 'bg-purple-100 text-purple-600' }
    ],
    [Section.SCIENCE_ENGLISH]: [
      { id: Subject.PHYSICS, name: 'Vật lí (Khoa học)', icon: 'fa-atom', color: 'bg-orange-100 text-orange-600' },
      { id: Subject.CHEMISTRY, name: 'Hóa học (Khoa học)', icon: 'fa-vial', color: 'bg-blue-100 text-blue-600' },
      { id: Subject.BIOLOGY, name: 'Sinh học (Khoa học)', icon: 'fa-dna', color: 'bg-green-100 text-green-600' },
      { id: Subject.HISTORY, name: 'Lịch sử (Khoa học)', icon: 'fa-landmark', color: 'bg-red-100 text-red-600' },
      { id: Subject.GEOGRAPHY, name: 'Địa lí (Khoa học)', icon: 'fa-earth-americas', color: 'bg-emerald-100 text-emerald-600' },
      { id: Subject.ENGLISH, name: 'Tiếng Anh (Tùy chọn)', icon: 'fa-language', color: 'bg-indigo-100 text-indigo-600' },
    ]
  };

  const options = optionsMap[section];

  const toggle = (id: Subject) => {
    if (id === Subject.ENGLISH) {
      setSelected([id]); // Chọn Anh thì không chọn Khoa học
      return;
    }
    if (selected.includes(Subject.ENGLISH)) {
      setSelected([id]); // Chọn Khoa học thì bỏ Anh
      return;
    }

    if (selected.includes(id)) setSelected(selected.filter(s => s !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
  };

  const isInvalid = section === Section.SCIENCE_ENGLISH && 
                    !selected.includes(Subject.ENGLISH) && 
                    selected.length !== 3 && 
                    selected.length !== 0;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl animate-fade-in">
        <h2 className="text-3xl font-black text-gray-800 mb-2">Lựa chọn môn thi</h2>
        <p className="text-gray-500 mb-8 font-medium">
          {section === Section.SCIENCE_ENGLISH ? "Chọn 3 môn Khoa học HOẶC 1 môn Tiếng Anh." : "Xác nhận để bắt đầu bài thi 75 phút."}
        </p>
        
        <div className="grid grid-cols-1 gap-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`flex items-center p-5 rounded-[24px] border-2 transition-all ${
                selected.includes(opt.id) ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-gray-100 hover:border-blue-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mr-4 ${opt.color}`}>
                <i className={`fa-solid ${opt.icon}`}></i>
              </div>
              <span className="font-black text-gray-700 text-lg">{opt.name}</span>
              {selected.includes(opt.id) && <i className="fa-solid fa-circle-check text-blue-600 ml-auto text-xl"></i>}
            </button>
          ))}
        </div>

        <div className="flex space-x-3">
          <button onClick={onCancel} className="flex-1 py-5 text-gray-400 font-black hover:bg-gray-50 rounded-3xl transition-colors">Hủy</button>
          <button 
            disabled={selected.length === 0 || isInvalid}
            onClick={() => onConfirm(selected)}
            className="flex-1 py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-100 disabled:opacity-30 transition-all hover:bg-blue-700"
          >
            Vào thi ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
