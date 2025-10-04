import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', last_name: '', age: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [searchId, setSearchId] = useState('');

  const API_BASE = 'http://localhost:4001/users';

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.log('Error en el fetch:', error)
      setMessage('Error al obtener usuarios')
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // CREATE
  const createUser = async (userData) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessage('Usuario creado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error POST /users', error);
      setMessage('Error al crear usuario');
    }
  };

  // UPDATE
  const updateUser = async (id, userData) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessage('Usuario actualizado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error PUT /users/:id', error);
      setMessage('Error al actualizar usuario');
    }
  };

  // GET by id
  const getUserById = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (res.status === 404) {
        setMessage('Usuario no encontrado');
        return null;
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error GET /users/:id', error);
      setMessage('Error al obtener usuario');
      return null;
    }
  };

  // DELETE
  const deleteUser = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessage('Usuario eliminado');
      fetchUsers();
    } catch (error) {
      console.error('Error DELETE /users/:id', error);
      setMessage('Error al eliminar usuario');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.last_name.trim() || !form.age.toString().trim()) {
      setMessage('Todos los campos son obligatorios');
      return;
    }
    const payload = { name: form.name.trim(), last_name: form.last_name.trim(), age: Number(form.age) };

    if (isEditing && editingId != null) {
      await updateUser(editingId, payload);
      setIsEditing(false);
      setEditingId(null);
    } else {
      await createUser(payload);
    }

    setForm({ name: '', last_name: '', age: '' });
  };

  const handleEdit = (user) => {
    setForm({ name: user.name ?? '', last_name: user.last_name ?? '', age: user.age ?? '' });
    setIsEditing(true);
    setEditingId(user.id);
    setMessage('Editando usuario ID ' + user.id);
  };

  const handleView = async (id) => {
    const user = await getUserById(id);
    if (user) {
      setForm({ name: user.name ?? '', last_name: user.last_name ?? '', age: user.age ?? '' });
      setIsEditing(true);
      setEditingId(user.id);
      setMessage('Usuario cargado en formulario para ver/editar');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      fetchUsers();
      return;
    }
    const user = await getUserById(searchId.trim());
    if (user) setUsers([user]);
    else setUsers([]);
  };

  return (
    <div className="container">
      <h1>CRUD Usuarios</h1>

      <section className="form-section">
        <h2>{isEditing ? `Editar usuario ${editingId}` : 'Crear nuevo usuario'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre:</label>
            <input name="name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label>Apellido:</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} />
          </div>
          <div>
            <label>Edad:</label>
            <input name="age" type="number" value={form.age} onChange={handleChange} />
          </div>
          <div className="actions">
            <button type="submit">{isEditing ? 'Actualizar' : 'Crear'}</button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setEditingId(null); setForm({ name: '', last_name: '', age: '' }); setMessage('Edición cancelada'); }}>Cancelar</button>
            )}
          </div>
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="search-section">
        <form onSubmit={handleSearch}>
          <label>Buscar por ID:</label>
          <input value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="ID" />
          <button type="submit">Buscar</button>
          <button type="button" onClick={() => { setSearchId(''); fetchUsers(); }}>Mostrar todos</button>
        </form>
      </section>

      <section className="table-section">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Edad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.age}</td>
                  <td>
                    <button onClick={() => handleEdit(user)}>Editar</button>
                    <button onClick={() => handleView(user.id)}>Ver</button>
                    <button onClick={() => deleteUser(user.id)}>Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay usuarios encontrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default App
