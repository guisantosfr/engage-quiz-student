import { Quiz } from "./Quiz";

export interface Session {
    id: string;
    status: string;
    quiz: Quiz;
}