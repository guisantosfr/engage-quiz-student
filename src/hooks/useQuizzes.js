import { useState, useEffect } from 'react';
import api from '../services/api';

const useQuizzes = () => {
    const [quizzes, setQuizzes] = useState(null);

    const fetchData = async () => {
      try {
        const result = await api.get('/Questionarios');
        setQuizzes(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    // const fetchQuizById = async (id) => {
    //   try {
    //       const result = await api.get(`/quizzes/${id}`);
    //       return result.data;
    //   } catch (error) {
    //       console.error('Error fetching quiz:', error);
    //       return null;
    //   }
    // };

    const fetchQuizById = async (id) => {
      try {
          const result = await quizzes.find(quiz => quiz.idQuestao === id);
          return result.data;
      } catch (error) {
          console.error('Error fetching quiz:', error);
          return null;
      }
    };

    const createNewQuiz = async (newQuiz) => {
      try {
          const result = await api.post('/quizzes', newQuiz);
          setQuizzes((prevQuizzes) => [...prevQuizzes, result.data]);
          return result.data;
      } catch (error) {
          console.error('Error adding quiz:', error);
          return null;
      }
  };

    useEffect(() => {
        fetchData();
    }, []);

    return { quizzes, refetch: fetchData, fetchQuizById, createNewQuiz };
}

export default useQuizzes;