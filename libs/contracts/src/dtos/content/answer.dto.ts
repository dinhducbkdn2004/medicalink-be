export interface AnswerDto {
  id: string;
  body: string;
  questionId: string;
  authorId: string;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
