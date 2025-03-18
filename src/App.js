import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 

const App = () => {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState('tabla');
  const [productoEditado, setProductoEditado] = useState(null);
  const [orden, setOrden] = useState({ campo: '', asc: true });

  useEffect(() => {
      fetch('http://localhost:8080/productos')
          .then(response => response.json())
          .then(data => setProductos(data))
          .catch(error => console.error('Error al obtener productos:', error));
  }, []);

    const AgregarProducto = () => {
        if (!nombre || !descripcion || !cantidad || !codigo) {
            setError('Todos los campos son obligatorios');
            return;
        }
        setError('');
        
        const objProducto = { 
            nombre, 
            descripcion, 
            cantidad: parseInt(cantidad), 
            codigo, 
            fecha_creacion: new Date().toISOString()
        };

        fetch('http://localhost:8080/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objProducto)
        })
        .then(response => response.json())
        .then(data => {
            setProductos([...productos, data]);
            setNombre('');
            setDescripcion('');
            setCantidad('');
            setCodigo('');
        })
        .catch(error => console.error('Error al añadir producto:', error));
    };

    const ordenarPor = (campo) => {
      setOrden((prevOrden) => ({
          campo,
          asc: prevOrden.campo === campo ? !prevOrden.asc : true
      }));
  };

  const sortedProductos = [...productos].sort((a, b) => {
    if (!orden.campo) return 0;
    const valorA = a[orden.campo];
    const valorB = b[orden.campo];

    if (typeof valorA === 'string') {
        return orden.asc ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    } else {
        return orden.asc ? valorA - valorB : valorB - valorA;
    }
});

const filteredProductos = sortedProductos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
);

    const EliminarProducto = (id) => {
        fetch(`http://localhost:8080/productos/${id}`, { method: 'DELETE' })
            .then(() => setProductos(productos.filter(producto => producto.id !== id)))
            .catch(error => console.error('Error al eliminar producto:', error));
    };

    const EditarProducto = (producto) => {
      setProductoEditado(producto);
  };

  const GuardarEdicion = () => {
      fetch(`http://localhost:8080/productos/${productoEditado.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productoEditado)
      })
      .then(() => {
          setProductos(productos.map(p => p.id === productoEditado.id ? productoEditado : p));
          setProductoEditado(null);
      })
      .catch(error => console.error('Error al actualizar producto:', error));
  };

    return (
        <div className="container mt-4">
            <div className="container mt-4 d-flex justify-content-center">
                <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%', backgroundColor: '#f8f9fa' }}>
                    <h2 className="text-center">Añadir Producto</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                        <input type="text" className="form-control" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <input type="text" className="form-control" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <input type="number" className="form-control" placeholder="Cantidad" value={cantidad} onChange={e => setCantidad(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <input type="text" className="form-control" placeholder="Código" value={codigo} onChange={e => setCodigo(e.target.value)} />
                    </div>
                    <button className="btn btn-primary w-100" onClick={AgregarProducto}>Añadir Producto</button>
                </div>
            </div>    
            <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className='title'>Lista de Productos</h2>
                    <div className="d-flex gap-2">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Buscar por nombre..." 
                            value={busqueda} 
                            onChange={e => setBusqueda(e.target.value)}
                        />
                        <button className="btn btn-secondary" onClick={() => setVista(vista === 'tabla' ? 'cards' : 'tabla')}>
                            {vista === 'tabla' ? 'Ver en Cards' : 'Ver en Tabla'}
                        </button>
                    </div>
                </div>
                {vista === 'tabla' ? (
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                        <tr>
                                <th onClick={() => ordenarPor('id')}>ID</th>
                                <th onClick={() => ordenarPor('nombre')}>Nombre</th>
                                <th onClick={() => ordenarPor('descripcion')}>Descripción</th>
                                <th onClick={() => ordenarPor('cantidad')}>Cantidad</th>
                                <th onClick={() => ordenarPor('codigo')}>Código</th>
                                <th onClick={() => ordenarPor('fecha_creacion')}>Fecha Creación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProductos.map(producto => (
                                <tr key={producto.id}>
                                    <td>{producto.id}</td>
                                    <td>{producto.nombre}</td>
                                    <td>{producto.descripcion}</td>
                                    <td className={producto.cantidad === 0 ? "text-danger fw-bold" : ""}>
                                        {producto.cantidad === 0 ? "Agotado" : producto.cantidad}
                                    </td>
                                    <td>{producto.codigo}</td>
                                    <td>{producto.fecha_creacion ? new Date(producto.fecha_creacion).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <button className="btn btn-success btn-sm me-2" onClick={() => EditarProducto(producto)}>Actualizar</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => EliminarProducto(producto.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="row">
                        {filteredProductos.map(producto => (
                            <div className="col-md-4 mb-3" key={producto.id}>
                                <div className="card shadow-sm h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">{producto.nombre}</h5>
                                        <p className="card-text"><strong>Descripción:</strong> {producto.descripcion}</p>
                                        <p>
                                            <strong>Cantidad: </strong> 
                                            <span className={producto.cantidad === 0 ? "text-danger fw-bold" : ""}>
                                                {producto.cantidad === 0 ? "Agotado" : producto.cantidad}
                                            </span>
                                        </p>
                                        <p className="card-text"><strong>Código:</strong> {producto.codigo}</p>
                                        <p className="card-text"><strong>Fecha:</strong> {producto.fecha_creacion ? new Date(producto.fecha_creacion).toLocaleDateString() : 'N/A'}</p>
                                        <button className="btn btn-success btn-sm w-100" onClick={() => EditarProducto(producto)}>Actualizar</button>
                                        <button className="btn btn-danger btn-sm w-100 mt-2" onClick={() => EliminarProducto(producto.id)}>Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {productoEditado && (
                <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Editar Producto</h5>
                                <button type="button" className="btn-close" onClick={() => setProductoEditado(null)}></button>
                            </div>
                            <div className="modal-body">
                                <input type="text" className="form-control mb-2" value={productoEditado.nombre} onChange={e => setProductoEditado({...productoEditado, nombre: e.target.value})} />
                                <input type="text" className="form-control mb-2" value={productoEditado.descripcion} onChange={e => setProductoEditado({...productoEditado, descripcion: e.target.value})} />
                                <input type="number" className="form-control mb-2" value={productoEditado.cantidad} onChange={e => setProductoEditado({...productoEditado, cantidad: parseInt(e.target.value)})} />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={GuardarEdicion}>Guardar</button>
                                <button className="btn btn-secondary" onClick={() => setProductoEditado(null)}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
              )}
        </div>
    );
};

export default App;
