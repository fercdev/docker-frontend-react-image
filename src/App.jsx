import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [users, setUsers] = useState([]);
  // const [form, setForm] = useState({nombres: "", apellidos: "", edad: ""});

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:4001/users");
      const data = await res.json();
      setUsers(data);
    } catch(error) {
      console.log("Error en el fetch:", error)
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombres</th>
          <th>Apellidos</th>
          <th>Edad</th>
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
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No hay usuarios encontrados</td>
          </tr>
        )}
      </tbody>

    </table>
    </>
  )
}

export default App
