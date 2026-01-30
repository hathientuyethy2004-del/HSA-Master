
import { GoogleGenAI, Type } from "@google/genai";
import { Section, Subject, Question, PracticeMode, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHSAQuestions = async (
  section: Section, 
  subjects: Subject[] = [], 
  count: number = 10,
  mode: PracticeMode = PracticeMode.FULL_EXAM
): Promise<Question[]> => {
  const isFillInOnly = mode === PracticeMode.FILL_IN_ONLY;
  
  const sectionPrompts = {
    [Section.QUANTITATIVE]: `
      MỤC TIÊU 2026: Đánh giá năng lực mô hình hóa và giải quyết vấn đề toán học thực tiễn.
      - Cấu trúc: 70% MCQ, 30% FILL_IN (Điền đáp án số).
      - Nội dung: Số học, Đại số, Giải tích, Hình học, Thống kê & Xác suất.
      - Phân hóa: 10% Dễ, 20% TB, 70% Khó (Vận dụng cao).`,
    [Section.VERBAL]: `
      MỤC TIÊU 2026: Đánh giá tư duy ngôn ngữ và năng lực lập luận văn học.
      - Cấu trúc: BẮT BUỘC tạo 1-2 "Chùm câu hỏi" (Cluster). 1 văn bản/ngữ liệu đi kèm 5 câu hỏi liên quan.
      - Ngữ liệu: Văn hóa, Xã hội, Lịch sử, Nghệ thuật.
      - Dạng: 100% MCQ 4 lựa chọn.`,
    [Section.SCIENCE_ENGLISH]: subjects.includes(Subject.ENGLISH) ? `
      MỤC TIÊU 2026: Tiếng Anh.
      - Cấu trúc: 60% Câu đơn (Vocab/Grammar), 30% Đọc hiểu (Chùm 5 câu), 10% Suy luận tình huống.
      - Dạng: 100% MCQ.
    ` : `
      MỤC TIÊU 2026: Khoa học (Lý, Hóa, Sinh, Sử, Địa).
      - Cấu trúc: Mỗi môn (${subjects.join(", ")}) BẮT BUỘC có ít nhất 1 câu FILL_IN (Điền đáp án số).
      - Chùm câu hỏi: Tạo 1 chùm câu hỏi gồm 1 ngữ cảnh (thí nghiệm/hiện tượng) đi kèm 3 câu hỏi.
    `
  };

  const prompt = `
    Bạn là chuyên gia Khảo thí của ĐHQGHN. Hãy tạo bộ đề ${count} câu hỏi HSA 2026.
    
    QUY ĐỊNH CHẶT CHẼ:
    1. Câu hỏi chùm (Cluster): Nếu tạo câu hỏi chùm, tất cả câu hỏi trong chùm đó phải có nội dung trường 'context' giống hệt nhau.
    2. Điền đáp án: Trường 'correctAnswer' cho loại FILL_IN phải là số nguyên hoặc số thập phân.
    3. LaTeX: BẮT BUỘC dùng $...$ cho mọi công thức và ký hiệu toán học.
    4. Bảng biểu: Dùng Markdown Table trong trường 'context' nếu có số liệu.
    5. Độ khó: 70% câu hỏi phải ở mức LEVEL_3 (Vận dụng cao).

    MÔ TẢ CHI TIẾT: ${sectionPrompts[section]}
    
    Yêu cầu trả về JSON Array các Question object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              context: { type: Type.STRING, description: "Ngữ liệu chung (văn bản/bảng biểu/thí nghiệm)" },
              content: { type: Type.STRING, description: "Nội dung câu hỏi cụ thể" },
              type: { type: Type.STRING, enum: ["MCQ", "FILL_IN"] },
              options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 lựa chọn cho MCQ" },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              subject: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["LEVEL_1", "LEVEL_2", "LEVEL_3"] }
            },
            required: ["content", "type", "correctAnswer", "explanation", "subject", "difficulty"]
          }
        }
      }
    });

    const rawQuestions = JSON.parse(response.text || "[]");
    return rawQuestions.map((q: any, index: number) => ({
      ...q,
      id: `hsa-vnu-2026-${Date.now()}-${index}`,
      section: section
    }));
  } catch (error) {
    console.error("Lỗi AI Generator:", error);
    return [];
  }
};

export const analyzePerformance = async (
  questions: Question[],
  answers: Record<string, string>
): Promise<AnalysisResult> => {
  const analysisPrompt = `
    Dựa trên Đề cương HSA 2026 của ĐHQGHN, hãy phân tích kết quả bài làm:
    ${questions.map((q, i) => `
      - Câu ${i + 1} (${q.subject}, ${q.difficulty}, ${q.type}): ${answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ? "ĐÚNG" : "SAI"}
    `).join('\n')}

    Đưa ra nhận xét về năng lực: Giải quyết vấn đề, Mô hình hóa, Tư duy logic và Đọc hiểu suy luận.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.STRING }
          },
          required: ["strengths", "weaknesses", "recommendations"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return {
      strengths: ["Nắm vững kiến thức nền tảng"],
      weaknesses: ["Kỹ năng xử lý câu hỏi chùm còn chậm"],
      recommendations: "Tập trung luyện tập khả năng đọc lướt xác định từ khóa và mô hình hóa bài toán thực tế."
    };
  }
};
