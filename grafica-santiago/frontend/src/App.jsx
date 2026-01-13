import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  ShoppingCart, Search, Menu, Bell, Package, BarChart3, 
  Users, LogOut, Grid, TrendingUp, DollarSign, 
  AlertCircle, CheckCircle, Clock, Trash2, Plus, X 
} from 'lucide-react';

// ==========================================
// CONFIGURACIÓN DE RED (IP DEL SERVIDOR)
// ==========================================
// Apuntamos a tu IP local para que funcione en red LAN.
const API_URL = 'http://172.18.130.134:3000'; 

// ==========================================
// 1. CONTEXTO DE AUTENTICACIÓN
// ==========================================
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Cargar sesión al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message || 'Error al iniciar sesión' };
    } catch (error) {
      return { success: false, message: 'No se pudo conectar con el servidor' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message || 'Error en el registro' };
    } catch (error) {
      return { success: false, message: 'No se pudo conectar con el servidor' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// 2. COMPONENTES DE LOGIN / REGISTRO
// ==========================================
const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) onSuccess();
    else setError(result.message);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">¡Hola de nuevo! 👋</h2>
        <p className="text-gray-500 mt-2">Ingresa a tu cuenta para continuar</p>
      </div>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
      
      <div className="space-y-4">
        <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
        <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-70 shadow-lg shadow-blue-200">
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </div>
      <p className="mt-6 text-center text-gray-600 text-sm">¿No tienes cuenta? <button onClick={onSwitchToRegister} className="text-blue-600 font-semibold hover:underline">Regístrate gratis</button></p>
    </div>
  );
};

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', password: '', telefono: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || formData.password.length < 6) {
      setError('Completa todos los campos. La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    if (result.success) onSuccess();
    else setError(result.message);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Crear Cuenta</h2>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Apellido" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="password" placeholder="Contraseña (mín 6 chars)" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="tel" placeholder="Teléfono" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-70 shadow-lg shadow-blue-200">
          {loading ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </div>
      <p className="mt-6 text-center text-gray-600 text-sm">¿Ya tienes cuenta? <button onClick={onSwitchToLogin} className="text-blue-600 font-semibold hover:underline">Inicia sesión</button></p>
    </div>
  );
};

// ==========================================
// 3. ESTRUCTURA PRINCIPAL DE LA APP
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        <AppContent 
          currentView={currentView} setCurrentView={setCurrentView}
          showAuth={showAuth} setShowAuth={setShowAuth}
          authMode={authMode} setAuthMode={setAuthMode}
        />
      </div>
    </AuthProvider>
  );
}

const AppContent = ({ currentView, setCurrentView, showAuth, setShowAuth, authMode, setAuthMode }) => {
  const { user, isAuthenticated, logout } = useAuth();

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4">
        {authMode === 'login' ? 
          <LoginForm onSuccess={() => setShowAuth(false)} onSwitchToRegister={() => setAuthMode('register')} /> : 
          <RegisterForm onSuccess={() => setShowAuth(false)} onSwitchToLogin={() => setAuthMode('login')} />
        }
      </div>
    );
  }

  return (
    <>
      {/* NAVBAR */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-black text-blue-700 tracking-tight cursor-pointer flex items-center gap-2" onClick={() => setCurrentView('home')}>
              <div className="bg-blue-600 text-white p-1 rounded-lg"><Package className="w-5 h-5"/></div>
              Gráfica Santiago
            </h1>
            <nav className="hidden md:flex space-x-1">
              <NavButton active={currentView === 'home'} onClick={() => setCurrentView('home')}>Inicio</NavButton>
              <NavButton active={currentView === 'products'} onClick={() => setCurrentView('products')}>Productos</NavButton>
              <NavButton active={currentView === 'categories'} onClick={() => setCurrentView('categories')}>Categorías</NavButton>
              
              {/* BOTÓN ADMIN */}
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setCurrentView('admin')} 
                  className="ml-4 flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-full font-medium hover:bg-slate-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <BarChart3 className="w-4 h-4" /> Panel Admin
                </button>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"><Search className="w-5 h-5" /></button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-4 border-l ml-2">
                <div className="text-right hidden sm:block leading-tight">
                  <p className="text-sm font-bold text-gray-800">{user?.nombre}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{user?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                </div>
                <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition" title="Cerrar Sesión">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-200">
                Ingresar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'home' && <HomePage setCurrentView={setCurrentView} />}
        {currentView === 'products' && <ProductsPage />}
        {currentView === 'categories' && <CategoriesPage />}
        {currentView === 'admin' && <AdminDashboard />} 
      </main>
    </>
  );
};

const NavButton = ({ children, onClick, active }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
      active 
        ? 'bg-blue-50 text-blue-700' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

// ==========================================
// 4. VISTAS PÚBLICAS
// ==========================================
const HomePage = ({ setCurrentView }) => (
  <div className="space-y-16 animate-fade-in">
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-12 text-center shadow-2xl shadow-blue-900/20">
      <div className="relative z-10">
        <h2 className="text-5xl font-black mb-6 tracking-tight leading-tight">Todo para tu oficina<br/>en un solo lugar.</h2>
        <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto font-light">Calidad premium, precios mayoristas y entregas express a todo Ecuador.</p>
        <button onClick={() => setCurrentView('products')} className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition shadow-lg transform hover:-translate-y-1">
          Ver Catálogo Completo
        </button>
      </div>
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
    </section>

    <section className="grid md:grid-cols-3 gap-8">
      <FeatureCard icon={Package} title="Envío Rápido" text="Recibe tu pedido en 24/48 horas garantizado en todo el país." />
      <FeatureCard icon={DollarSign} title="Precios Mayoristas" text="Accede a descuentos especiales por volumen para tu negocio." />
      <FeatureCard icon={Users} title="Atención Experta" text="Nuestro equipo te asesora para encontrar la mejor solución." />
    </section>
  </div>
);

const FeatureCard = ({ icon: Icon, title, text }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group">
    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
      <Icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed text-sm">{text}</p>
  </div>
);

const ProductsPage = () => {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/products`);
        const data = await response.json();
        if (data.success) setProducts(data.products || []);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const handleBuy = async (product) => {
    if (!token) return alert("Por favor inicia sesión para realizar una compra.");
    
    if(!confirm(`¿Deseas comprar "${product.nombre}" por $${product.precio.minorista}?`)) return;

    try {
      const orderData = {
        orderItems: [{
          name: product.nombre,
          quantity: 1,
          image: product.imagenes && product.imagenes[0] ? product.imagenes[0].url : "placeholder",
          price: product.precio.minorista,
          product: product._id
        }],
        shippingInfo: { direccion: "Dirección de Prueba", ciudad: "Loja", telefono: user.telefono || "0999999999" },
        itemsPrice: product.precio.minorista,
        totalPrice: product.precio.minorista,
        paymentInfo: { id: "test_payment_id", status: "succeeded" }
      };

      const res = await fetch(`${API_URL}/api/v1/order/new`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(orderData)
      });

      if(res.ok) {
        alert("✅ ¡Compra realizada con éxito! Revisa tu correo electrónico para ver la confirmación.");
      } else {
        const errData = await res.json();
        alert("Error al comprar: " + (errData.message || "Intente nuevamente"));
      }
    } catch(e) { console.error(e); alert("Error de conexión"); }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h2>
          <p className="text-gray-500 mt-2">Mostrando {products.length} productos disponibles</p>
        </div>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">No hay productos aún</h3>
          <p className="text-gray-500">El inventario está vacío por el momento.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-56 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                {product.imagenes && product.imagenes[0] ? (
                   <img src={product.imagenes[0].url} alt={product.nombre} className="w-full h-full object-cover" />
                ) : (
                   <Package className="w-16 h-16 text-gray-300 group-hover:text-blue-500 transition duration-300" />
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm">
                  {product.categoria}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1 truncate text-gray-800 group-hover:text-blue-600 transition">{product.nombre}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5em]">{product.descripcion || "Sin descripción"}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Precio</p>
                    <span className="text-xl font-black text-gray-900">${product.precio?.minorista?.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => handleBuy(product)}
                    className="bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-gray-200 hover:shadow-blue-200 flex items-center gap-2 font-medium"
                  >
                    <ShoppingCart className="w-4 h-4" /> Comprar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CategoriesPage = () => (
  <div>
    <h2 className="text-3xl font-bold mb-8 text-gray-900">Categorías Populares</h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {['Cuadernos', 'Papel', 'Oficina', 'Impresión', 'Arte', 'Escolares'].map((cat) => (
        <div key={cat} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer text-center group">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
            <Grid className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition">{cat}</h3>
          <p className="text-sm text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition">Ver productos &rarr;</p>
        </div>
      ))}
    </div>
  </div>
);

// ==========================================
// 5. SISTEMA DE ADMINISTRACIÓN (DASHBOARD)
// ==========================================

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory'); 

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[700px] border border-gray-100">
      {/* Barra Lateral */}
      <aside className="w-full md:w-72 bg-slate-900 text-white p-6 flex flex-col">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/50">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-none">Admin Panel</h2>
            <p className="text-xs text-slate-400 mt-1">v2.0 PRO</p>
          </div>
        </div>
        
        <div className="mb-6 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 uppercase font-bold mb-1">Usuario</p>
          <p className="font-semibold truncate">{user?.nombre}</p>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={Package} label="Inventario" />
          <SidebarButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={TrendingUp} label="Analítica" />
          <SidebarButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={Bell} label="Notificaciones" />
        </nav>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 text-center">
          &copy; 2024 Gráfica Santiago
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50/50 max-h-[800px]">
        {activeTab === 'inventory' && <InventoryManager token={token} />}
        {activeTab === 'reports' && <ReportsView token={token} />}
        {activeTab === 'notifications' && <NotificationsManagement token={token} showNotification={(msg) => alert(msg)} />}
      </main>
    </div>
  );
};

const SidebarButton = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick} 
    className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-200 group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400'}`} />
    <span className="font-medium">{label}</span>
  </button>
);

// --- GESTIÓN DE INVENTARIO ---
const InventoryManager = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ 
    nombre: '', descripcion: '', 
    precioMinorista: '', precioMayorista: '', 
    stock: '', categoria: '' 
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
        const res = await fetch(`${API_URL}/api/v1/products`);
        const data = await res.json();
        if (data.success) setProducts(data.products || []);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if(!confirm("¿Estás seguro de eliminar este producto de forma permanente?")) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/products/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) fetchProducts();
      else alert("No tienes permisos para eliminar.");
    } catch(e) { alert("Error de conexión"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productToSend = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: { 
        minorista: parseFloat(formData.precioMinorista), 
        mayorista: parseFloat(formData.precioMayorista) 
      },
      stock: parseInt(formData.stock),
      categoria: formData.categoria,
      imagenes: [{ url: "https://via.placeholder.com/150", public_id: "new" }]
    };

    try {
      const res = await fetch(`${API_URL}/api/v1/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productToSend)
      });
      
      const data = await res.json();
      if(data.success) {
          alert("¡Producto Guardado!");
          setFormData({ nombre: '', descripcion: '', precioMinorista: '', precioMayorista: '', stock: '', categoria: '' });
          fetchProducts();
      } else {
        alert(data.message || "Error al crear producto");
      }
    } catch(e) { console.error(e); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
          <p className="text-gray-500 text-sm">Gestiona tus productos y precios</p>
        </div>
        <span className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
          Total: {products.length} productos
        </span>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 pb-4 border-b">
          <div className="bg-green-100 p-1.5 rounded-lg"><Plus className="w-4 h-4 text-green-600"/></div>
          Agregar Nuevo Producto
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
            <input className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
            <input className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.categoria} onChange={e=>setFormData({...formData, categoria: e.target.value})} required />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Precio Minorista</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-gray-400 font-bold">$</span>
              <input type="number" step="0.01" className="w-full border p-3 pl-8 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.precioMinorista} onChange={e=>setFormData({...formData, precioMinorista: e.target.value})} required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Precio Mayorista</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-gray-400 font-bold">$</span>
              <input type="number" step="0.01" className="w-full border p-3 pl-8 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.precioMayorista} onChange={e=>setFormData({...formData, precioMayorista: e.target.value})} required />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Stock</label>
            <input type="number" className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.stock} onChange={e=>setFormData({...formData, stock: e.target.value})} required />
          </div>
          
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
            <input className="w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={formData.descripcion} onChange={e=>setFormData({...formData, descripcion: e.target.value})} />
          </div>
          
          <button type="submit" className="bg-gray-900 text-white py-3.5 rounded-xl col-span-2 hover:bg-blue-600 font-bold shadow-lg shadow-gray-300 transition transform active:scale-95 mt-2">
            Guardar Producto
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Minorista</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mayorista</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-900">{p.nombre}</p>
                  <p className="text-xs text-gray-500">{p.categoria}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {p.stock} unid.
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">${p.precio?.minorista}</td>
                <td className="px-6 py-4 text-sm text-blue-600 font-medium">${p.precio?.mayorista}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- REPORTES ---
export function ReportsView({ token }) {
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState('mes');
  const [reportData, setReportData] = useState(null);

  useEffect(() => { fetchReportData(); }, [activeReport, dateRange]);

  const fetchReportData = async () => {
    let endpoint = '';
    switch(activeReport) {
      case 'sales': endpoint = `/api/reports/sales?periodo=${dateRange}`; break;
      case 'bestsellers': endpoint = '/api/reports/best-sellers'; break;
      case 'lowstock': endpoint = '/api/reports/low-stock'; break;
      case 'customers': endpoint = '/api/reports/top-customers'; break;
      case 'payments': endpoint = '/api/reports/payment-methods'; break;
      default: return;
    }

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setReportData(data.data);
    } catch (error) {
       // Fallback para demo visual
       if(activeReport === 'sales') setReportData({ ventas: { ventasTotales: 0, cantidadPedidos: 0, promedioTicket: 0 }});
       else setReportData([]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analítica de Negocio</h2>
          <p className="text-gray-500 text-sm">Visualiza el rendimiento de tu tienda</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          {['sales', 'bestsellers', 'lowstock'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveReport(tab)} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeReport === tab ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab === 'sales' ? 'Ventas' : tab === 'lowstock' ? 'Stock' : 'Top Productos'}
            </button>
          ))}
        </div>
      </div>

      {activeReport === 'sales' && <SalesReport data={reportData} dateRange={dateRange} setDateRange={setDateRange} />}
      {activeReport === 'bestsellers' && <BestSellersReport data={reportData} />}
      {activeReport === 'lowstock' && <LowStockReport data={reportData} />}
    </div>
  );
}

const SalesReport = ({ data, dateRange, setDateRange }) => (
  <div>
    <div className="flex justify-end mb-6">
      <select value={dateRange} onChange={e=>setDateRange(e.target.value)} className="border border-gray-300 p-2 rounded-lg bg-white shadow-sm text-sm outline-none focus:border-blue-500">
        <option value="hoy">Hoy</option>
        <option value="semana">Última Semana</option>
        <option value="mes">Último Mes</option>
        <option value="año">Este Año</option>
      </select>
    </div>
    <div className="grid md:grid-cols-3 gap-6">
      <MetricCard icon={DollarSign} title="Ingresos Totales" value={`$${data?.ventas?.ventasTotales?.toFixed(2) || '0.00'}`} color="blue" />
      <MetricCard icon={Package} title="Pedidos Completados" value={data?.ventas?.cantidadPedidos || 0} color="green" />
      <MetricCard icon={TrendingUp} title="Ticket Promedio" value={`$${data?.ventas?.promedioTicket?.toFixed(2) || '0.00'}`} color="purple" />
    </div>
  </div>
);

const MetricCard = ({ icon: Icon, title, value, color }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-violet-50 text-violet-600 border-violet-100"
  };
  return (
    <div className={`p-6 rounded-2xl border ${styles[color]} transition hover:shadow-md`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-bold text-sm opacity-80 mb-1 uppercase tracking-wide">{title}</p>
          <h3 className="text-4xl font-black">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-white bg-opacity-60 shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

const BestSellersReport = ({ data }) => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Producto</th><th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stock Restante</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {data?.map((p, i) => (<tr key={i}><td className="px-6 py-4 font-bold text-gray-800">{p.nombre}</td><td className="px-6 py-4 text-gray-500">{p.stock}</td></tr>))}
                {!data?.length && <tr><td colSpan="2" className="px-6 py-12 text-center text-gray-400">No hay datos de ventas aún</td></tr>}
            </tbody>
        </table>
    </div>
);

const LowStockReport = ({ data }) => (
    <div className="grid gap-4">
        {data?.map(p => (
            <div key={p._id} className="bg-red-50 p-4 rounded-xl flex justify-between items-center border border-red-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg text-red-500"><AlertCircle className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-red-900">{p.nombre}</h4><p className="text-sm text-red-600 font-medium">Stock crítico: {p.stock} unidades</p></div>
                </div>
                <button className="text-xs bg-white text-red-700 px-4 py-2 rounded-lg border border-red-200 font-bold hover:bg-red-50 transition">Reabastecer</button>
            </div>
        ))}
        {!data?.length && <div className="text-center p-16 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center gap-3"><CheckCircle className="w-12 h-12 text-green-500"/> <span className="font-medium text-gray-600">¡Todo el inventario está saludable!</span></div>}
    </div>
);

// --- NOTIFICACIONES ---
export function NotificationsManagement({ token, showNotification }) {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      // Intenta conectar al backend, si falla usa array vacío
      const res = await fetch(`${API_URL}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
      if(res.ok) {
        const data = await res.json();
        if (data.success) setNotifications(data.data);
      }
    } catch (e) { console.log("Módulo notificaciones offline"); }
  };

  const createReminder = async (formData) => {
    // Simulación Frontend para demo inmediata
    setNotifications(prev => [{ _id: Date.now(), titulo: formData.tema, mensaje: formData.descripcion }, ...prev]);
    setShowModal(false);
    showNotification("Recordatorio creado correctamente");
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Centro de Notificaciones</h2>
          <p className="text-gray-500 text-sm">Gestiona alertas y recordatorios</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition flex items-center gap-2">
          <Plus className="w-4 h-4"/> Nuevo Recordatorio
        </button>
      </div>
      <div className="space-y-4">
        {notifications.length === 0 && <p className="text-gray-400 text-center py-20 bg-white rounded-2xl border border-dashed">No tienes notificaciones nuevas</p>}
        {notifications.map((n) => (
          <div key={n._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition group">
             <div className="flex gap-4">
                <div className="bg-blue-50 p-3 h-fit rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition"><Clock className="w-5 h-5" /></div>
                <div><h4 className="font-bold text-gray-800">{n.titulo}</h4><p className="text-sm text-gray-600 mt-1">{n.mensaje}</p></div>
             </div>
             <button className="text-gray-300 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-gray-800">Nuevo Recordatorio</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                </div>
                <input id="tema" placeholder="Título del recordatorio" className="w-full border border-gray-200 p-3 mb-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" />
                <textarea id="desc" placeholder="Descripción detallada..." className="w-full border border-gray-200 p-3 mb-6 rounded-xl h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" />
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition">Cancelar</button>
                    <button onClick={() => createReminder({ tema: document.getElementById('tema').value, descripcion: document.getElementById('desc').value })} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Guardar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}