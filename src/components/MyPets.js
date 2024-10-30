import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({ name: '', species: '', breed: '', age: '' });
  const navigate = useNavigate();

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
        setError('Error al cargar las mascotas del usuario');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserPets();
  }, []);

  const handleViewHistory = (petId) => {
    navigate(`/pets/${petId}/history`);
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      const response = await axios.post(`http://localhost:8080/api/pets`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setPets([...pets, response.data.data]);
        toast.success('Mascota agregada exitosamente');
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error al agregar mascota:', error);
      toast.error('Error al agregar la mascota');
    }
  };

  const handleEditPet = async (e) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      const response = await axios.put(`http://localhost:8080/api/pets/${selectedPet.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setPets(pets.map((pet) => (pet.id === selectedPet.id ? response.data.data : pet)));
        toast.success('Mascota editada exitosamente');
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error al editar mascota:', error);
      toast.error('Error al editar la mascota');
    }
  };

  const openEditModal = (pet) => {
    setSelectedPet(pet);
    setFormData({ name: pet.name, species: pet.species, breed: pet.breed, age: pet.age });
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Pets</h2>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        onClick={() => {
          setFormData({ name: '', species: '', breed: '', age: '' });
          setIsAddModalOpen(true);
        }}
      >
        Agregar Mascota
      </button>
      
      {isLoading ? (
        <p className="text-gray-500">Cargando mascotas...</p>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-lg border shadow-sm p-4">
              <h4 className="text-lg font-semibold text-gray-900">{pet.name}</h4>
              <p className="text-sm text-gray-500">{pet.species} ({pet.breed}) - {pet.age} años</p>
              <button
                onClick={() => handleViewHistory(pet.id)}
                className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-md mt-2"
              >
                Ver Historial
              </button>
              <button
                onClick={() => openEditModal(pet)}
                className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md mt-2"
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar mascota */}
      <Modal isOpen={isAddModalOpen} title="Agregar Mascota" onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleAddPet}>
          <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nombre" required />
          <input value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} placeholder="Especie" required />
          <input value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} placeholder="Raza" required />
          <input value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="Edad" type="number" required />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">Guardar</button>
        </form>
      </Modal>

      {/* Modal para editar mascota */}
      <Modal isOpen={isEditModalOpen} title="Editar Mascota" onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleEditPet}>
          <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nombre" required />
          <input value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} placeholder="Especie" required />
          <input value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} placeholder="Raza" required />
          <input value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="Edad" type="number" required />
          <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded-md">Actualizar</button>
        </form>
      </Modal>
    </div>
  );
};

export default MyPets;
