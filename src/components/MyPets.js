import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import axios from 'axios';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Inicializa useNavigate

  // Cargar las mascotas del usuario autenticado
  useEffect(() => {
    const loadUserPets = async () => {
      setIsLoading(true);

      const token = authService.getToken();
      if (!token) {
        toast.error("No se encontró el token de autenticación.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/pets/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.data.success) {
          setPets(response.data.data);
        } else {
          setError('No se encontraron mascotas para este usuario.');
        }
      } catch (error) {
        console.error('Error al cargar mascotas:', error);
        if (error.response) {
          if (error.response.status === 403) {
            setError('No tienes permiso para ver las mascotas.');
          } else if (error.response.status === 404) {
            setError('No se encontró el recurso.');
          } else {
            setError('Error al cargar las mascotas del usuario');
          }
        } else {
          setError('Error de conexión con el servidor');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPets();
  }, []);

  // Función para redirigir a la página de historial médico
  const handleViewHistory = (petId) => {
    navigate(`/pets/${petId}/history`); // Redirige a la página de historial médico de la mascota
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Pets</h2>
      {isLoading ? (
        <p className="text-gray-500">Cargando mascotas...</p>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pets.map(pet => (
            <div 
              key={pet.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4">
                <h4 className="text-lg font-semibold text-gray-900">{pet.name}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {pet.species} ({pet.breed})
                </p>
                <p className="text-sm text-gray-500">
                  {pet.age} años
                </p>
                
                <button
                  onClick={() => handleViewHistory(pet.id)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 mt-4"
                >
                  Ver Historial
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPets;
