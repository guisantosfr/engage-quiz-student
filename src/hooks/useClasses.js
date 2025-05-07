import { useState, useEffect } from 'react';
import api from '../services/api';

const useClasses = () => {
    const [classes, setClasses] = useState(null);

    const fetchData = async () => {
      try {
        const result = await api.get('/turma');
        setClasses(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    const fetchClassById = async (id) => {
      try {
          const result = await api.get(`/classes/${id}`);
          return result.data;
      } catch (error) {
          console.error('Error fetching class:', error);
          return null;
      }
    };

    const createNewClass = async (newClass) => {
      try {
          const result = await api.post('/classes', newClass);
          setClasses((prevClasses) => [...prevClasses, result.data]);
          return result.data;
      } catch (error) {
          console.error('Error adding class:', error);
          return null;
      }
  };

    useEffect(() => {
        fetchData();
    }, []);

    return { classes, refetch: fetchData, fetchClassById, createNewClass };
}

export default useClasses;