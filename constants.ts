
import { Section, Subject, Question } from './types';

export const EXAM_CONFIGS = {
  [Section.QUANTITATIVE]: {
    name: 'Phần 1: Toán học & Xử lý số liệu',
    subtitle: '75 phút - 50 câu',
    duration: 75,
    totalQuestions: 50,
    icon: 'fa-calculator',
    color: 'blue',
    structure: '35 MCQ + 15 Điền đáp án'
  },
  [Section.VERBAL]: {
    name: 'Phần 2: Ngôn ngữ - Văn học',
    subtitle: '60 phút - 50 câu',
    duration: 60,
    totalQuestions: 50,
    icon: 'fa-book-open-reader',
    color: 'purple',
    structure: '25 Câu đơn + 5 Chùm câu (x5)'
  },
  [Section.SCIENCE_ENGLISH]: {
    name: 'Phần 3: Khoa học / Tiếng Anh',
    subtitle: '60 phút - 50 câu',
    duration: 60,
    totalQuestions: 50,
    icon: 'fa-flask-vial',
    color: 'emerald',
    structure: 'Khoa học (MCQ + Điền số) / Tiếng Anh (MCQ + Chùm)'
  }
};

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 's1',
    type: 'FILL_IN',
    section: Section.QUANTITATIVE,
    subject: Subject.MATH,
    content: 'Một doanh nghiệp có hàm lợi nhuận biên $P\'(x) = 200 - 2x$ (triệu đồng/đơn vị). Biết chi phí cố định là 500 triệu đồng. Hãy tính lợi nhuận tối đa (triệu đồng) của doanh nghiệp.',
    correctAnswer: '9500',
    explanation: 'Lợi nhuận đạt cực đại khi $P\'(x) = 0 \\Leftrightarrow x = 100$. Lợi nhuận $P(x) = \\int (200 - 2x)dx = 200x - x^2 + C$. Với $x=0, P(0)=-500 \\Rightarrow C=-500$. $P(100) = 200(100) - 100^2 - 500 = 9500$.',
    difficulty: 'LEVEL_3'
  }
];

export const MINDSET_GUIDE = [
  {
    title: "Toán học (75')",
    content: "35 câu trắc nghiệm và 15 câu điền đáp án. Tập trung vào tư duy mô hình hóa và xử lý số liệu thực tiễn."
  },
  {
    title: "Ngôn ngữ (60')",
    content: "Đề có 5 chùm câu hỏi. Mỗi chùm 1 ngữ cảnh đi kèm 5 câu hỏi liên quan. Cần đọc hiểu và suy luận nhanh."
  },
  {
    title: "Khoa học (60')",
    content: "Mỗi môn có ít nhất 1 câu điền đáp án. Có các chùm câu hỏi 3 câu dựa trên 1 thí nghiệm hoặc hiện tượng."
  },
  {
    title: "Tiếng Anh (60')",
    content: "30 câu đơn (Từ vựng/Ngữ pháp), 3 chùm đọc hiểu (x5 câu) và 5 câu suy luận tình huống."
  }
];
