import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  ShoppingCart, Search, BarChart3, 
  LogOut, Grid, TrendingUp, DollarSign, 
  AlertCircle, CheckCircle, Clock, Trash2, Plus, X, User as UserIcon, Save,
  Menu, ArrowRight, Star, Truck, Shield, Package,
  Book, StickyNote, PenTool, Briefcase, Monitor, Backpack // Iconos para categorías
} from 'lucide-react';

// IMPORTAMOS TU LOGO (Asegúrate que exista el archivo)
import { Logo } from './components/Logo';

// ==========================================
// CONFIGURACIÓN API
// ==========================================
const API_URL = 'http://172.18.93.23:3000/api/v1';

// ==========================================
// 1. CONTEXTO (LOGIC LAYER)
// ==========================================
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('grafica_user');
    if (stored) {
      const { user, token } = JSON.parse(stored);
      setUser(user);
      setToken(token);
    }
    setLoading(false);
  }, []);

  const saveSession = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('grafica_user', JSON.stringify({ user: userData, token: tokenData }));
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        saveSession(data.user, data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        saveSession(data.user, data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('grafica_user');
    window.location.href = "/";
  };

  const updateProfile = async (updatedData) => {
    try {
        const response = await fetch(`${API_URL}/me/update`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });
        const data = await response.json();
        if(data.success) {
            saveSession(data.user, token);
            return { success: true };
        }
        return { success: false, message: data.message };
    } catch (error) {
        return { success: false, message: "Error de conexión" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, updateProfile, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// 2. COMPONENTES UI
// ==========================================
const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-2.5 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";
  const variants = {
    primary: "bg-[var(--color-gs-yellow)] text-[var(--color-gs-blue)] hover:bg-[var(--color-gs-yellow-hover)] shadow-md hover:shadow-lg",
    secondary: "bg-white text-[var(--color-gs-blue)] border border-gray-200 hover:bg-gray-50",
    dark: "bg-[var(--color-gs-blue)] text-white hover:bg-[var(--color-gs-blue-light)] shadow-lg",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  return <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Input = ({ label, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>}
    <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-gs-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition bg-white" {...props} />
  </div>
);

// Helper para iconos de categoría
const getCategoryIcon = (catName) => {
  const name = catName.toLowerCase();
  if (name.includes('cuaderno')) return Book;
  if (name.includes('papel')) return StickyNote;
  if (name.includes('escritura') || name.includes('bolígrafo')) return PenTool;
  if (name.includes('oficina')) return Briefcase;
  if (name.includes('tecno') || name.includes('comput')) return Monitor;
  if (name.includes('escolar')) return Backpack;
  return Package; // Default
};

// ==========================================
// 3. VISTAS
// ==========================================

// --- AUTH SCREEN ---
const AuthScreen = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', nombre: '', apellido: '' });
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = isLogin ? await login(formData.email, formData.password) : await register(formData);
    if (res.success) onClose();
    else alert(res.message);
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-gs-blue)]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"><X/></button>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6"><Logo className="h-24 w-auto object-contain" /></div>
          <h2 className="text-2xl font-black text-gray-800">{isLogin ? 'Bienvenido' : 'Crear Cuenta'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Nombre" onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              <Input placeholder="Apellido" onChange={e => setFormData({...formData, apellido: e.target.value})} required />
            </div>
          )}
          <Input type="email" placeholder="Correo electrónico" onChange={e => setFormData({...formData, email: e.target.value})} required />
          <Input type="password" placeholder="Contraseña" onChange={e => setFormData({...formData, password: e.target.value})} required />
          <Button type="submit" className="w-full mt-2" variant="dark">{isLogin ? 'Ingresar' : 'Registrarse'}</Button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-600">
          <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-[var(--color-gs-blue)] hover:underline">
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
          </button>
        </p>
      </div>
    </div>
  );
};

// --- HOME ---
const Home = ({ setView, onCategorySelect }) => {
  const [categories, setCategories] = useState([]);

  // Cargar categorías reales desde la base de datos
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in space-y-16">
      <div className="relative overflow-hidden bg-[var(--color-gs-blue)] text-white rounded-[2.5rem] p-12 md:p-24 text-center shadow-2xl shadow-blue-900/20">
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="bg-[var(--color-gs-yellow)] text-[var(--color-gs-blue)] px-4 py-1.5 rounded-full text-sm font-black tracking-wide uppercase mb-6 inline-block">2026</span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Calidad que imprime <span className="text-[var(--color-gs-yellow)]">éxito.</span>
          </h1>
          <Button onClick={() => setView('products')} variant="primary" className="px-8 py-4 text-lg mx-auto">
            Ver Catálogo <ArrowRight size={20} />
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--color-gs-yellow)] opacity-10 rounded-full blur-3xl -ml-20 -mb-20"></div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Categorías Destacadas</h2>
        {categories.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Cargando categorías...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => {
              const Icon = getCategoryIcon(cat);
              return (
                <button 
                  key={cat} 
                  onClick={() => onCategorySelect(cat)} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition group text-center flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-[var(--color-gs-blue)] transition-colors">
                    <Icon className="w-6 h-6 text-[var(--color-gs-blue)] group-hover:text-white transition-colors"/>
                  </div>
                  <h3 className="font-bold text-sm text-gray-800">{cat}</h3>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// --- PRODUCT LIST ---
const ProductList = ({ addToCart, selectedCategory, searchTerm }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = `${API_URL}/products?`;
    if(searchTerm) url += `keyword=${searchTerm}&`;
    if(selectedCategory) url += `category=${selectedCategory}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if(data.success) setProducts(data.products);
        setLoading(false);
      })
      .catch(e => { console.error(e); setLoading(false); });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedCategory ? `Categoría: ${selectedCategory}` : (searchTerm ? `Resultados: "${searchTerm}"` : 'Catálogo Completo')}
          </h2>
          <p className="text-gray-500">{products.length} productos disponibles</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">Cargando inventario...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(p => (
            <div key={p._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
              <div className="h-56 bg-gray-50 relative overflow-hidden">
                <img src={p.imagenes?.[0]?.url || 'https://via.placeholder.com/300'} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={p.nombre} />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[var(--color-gs-blue)] shadow-sm">
                  {p.categoria}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{p.nombre}</h3>
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    <Star size={14} fill="currentColor" />
                    <span className="text-gray-400 ml-1">{p.ratingPromedio || 0} ({p.numResenas || 0})</span>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase">Precio</span>
                    <span className="text-2xl font-black text-[var(--color-gs-blue)]">${p.precio?.minorista?.toFixed(2)}</span>
                  </div>
                  <button onClick={() => addToCart(p)} className="bg-[var(--color-gs-blue)] text-white p-3 rounded-xl hover:bg-[var(--color-gs-yellow)] hover:text-[var(--color-gs-blue)] transition-colors shadow-lg">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && products.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
          <Package className="mx-auto text-gray-300 mb-4" size={48}/>
          <p className="text-gray-500">No se encontraron productos.</p>
        </div>
      )}
    </div>
  );
};

// --- CART ---
const Cart = ({ cart, removeFromCart, setView }) => {
  const { token, user } = useAuth();
  const total = cart.reduce((acc, item) => acc + (item.precio.minorista * item.quantity), 0);

  const processOrder = async () => {
    if (!token) return alert("Inicia sesión para completar la compra.");
    const orderData = {
      orderItems: cart.map(i => ({
        product: i._id, name: i.nombre, quantity: i.quantity, price: i.precio.minorista, image: i.imagenes?.[0]?.url
      })),
      shippingInfo: { direccion: "Oficina Central", ciudad: "Loja", telefono: user.telefono || "0000000000" },
      itemsPrice: total, totalPrice: total * 1.15
    };
    try {
      const res = await fetch(`${API_URL}/order/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Orden procesada correctamente");
        window.location.reload();
      } else alert("Error: " + data.message);
    } catch(e) { alert("Error de conexión"); }
  };

  if(cart.length === 0) return (
    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
      <ShoppingCart className="mx-auto text-gray-300 mb-4" size={48} />
      <p className="text-gray-500">Tu carrito está vacío.</p>
      <Button variant="secondary" onClick={() => setView('products')} className="mt-4 mx-auto">Ir al catálogo</Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold mb-8">Carrito de Compras</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item._id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
              <img src={item.imagenes?.[0]?.url} className="w-20 h-20 rounded-xl object-cover bg-gray-50" />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{item.nombre}</h4>
                <p className="text-sm text-gray-500">${item.precio.minorista} x {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${(item.precio.minorista * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item._id)} className="text-red-500 text-xs font-bold hover:underline">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white p-8 rounded-3xl h-fit shadow-xl border border-gray-100">
          <h3 className="font-bold text-xl mb-6">Resumen</h3>
          <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>IVA (15%)</span><span>${(total * 0.15).toFixed(2)}</span></div>
          </div>
          <div className="flex justify-between text-2xl font-black text-[var(--color-gs-blue)] mb-8">
            <span>Total</span><span>${(total * 1.15).toFixed(2)}</span>
          </div>
          <Button onClick={processOrder} className="w-full py-4 text-lg shadow-blue-200">Confirmar Pedido</Button>
        </div>
      </div>
    </div>
  );
};

// --- PROFILE & ADMIN ---
const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({ nombre: user?.nombre || '', email: user?.email || '', telefono: user?.telefono || '' });
    const [isEditing, setIsEditing] = useState(false);
    const handleSave = async () => {
        const result = await updateProfile(formData);
        if(result.success) { setIsEditing(false); alert("Perfil actualizado"); } 
        else alert("Error al actualizar");
    };
    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-fade-in">
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><UserIcon className="w-10 h-10" /></div>
                <div><h2 className="text-3xl font-bold text-gray-900">Mi Perfil</h2><p className="text-gray-500">{user?.role}</p></div>
            </div>
            <div className="space-y-4">
                <Input label="Nombre" disabled={!isEditing} value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} />
                <Input label="Email" disabled value={formData.email} />
                <Input label="Teléfono" disabled={!isEditing} value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} />
                <div className="flex justify-end gap-3 pt-4">
                    {isEditing ? (
                        <><Button variant="secondary" onClick={()=>setIsEditing(false)}>Cancelar</Button><Button onClick={handleSave}>Guardar</Button></>
                    ) : <Button variant="dark" onClick={()=>setIsEditing(true)}>Editar</Button>}
                </div>
            </div>
        </div>
    );
};

const AdminPanel = ({ token }) => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/reports/summary`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if(data.success) setStats(data.summary); });
  }, []);
  if (!stats) return <div className="p-8 text-center">Cargando...</div>;
  return (
    <div className="animate-fade-in space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Ventas" value={`$${stats.totalSales.toFixed(2)}`} icon={DollarSign} color="bg-emerald-500" />
        <StatCard title="Pedidos" value={stats.ordersCount} icon={Package} color="bg-blue-500" />
        <StatCard title="Usuarios" value={stats.usersCount} icon={Users} color="bg-purple-500" />
        <StatCard title="Productos" value={stats.productsCount} icon={Grid} color="bg-orange-500" />
      </div>
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg mb-6">Inventario Crítico</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left"><tr><th className="p-3">Producto</th><th className="p-3">Stock</th></tr></thead>
          <tbody>{stats.topStockProducts.map(p => (<tr key={p._id} className="border-b"><td className="p-3">{p.nombre}</td><td className="p-3 font-bold text-green-600">{p.stock}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
    <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}><Icon size={24} /></div>
    <div><p className="text-gray-500 text-sm font-medium uppercase">{title}</p><h4 className="text-2xl font-black text-gray-900">{value}</h4></div>
  </div>
);

// ==========================================
// 4. LAYOUT PRINCIPAL
// ==========================================
export default function App() {
  const [view, setView] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [cart, setCart] = useState([]);
  
  // Estado para filtros compartidos
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) return prev.map(p => p._id === product._id ? {...p, quantity: p.quantity + 1} : p);
      return [...prev, {...product, quantity: 1}];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(p => p._id !== id));

  // Handler para navegar filtrando
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setView('products');
  };

  return (
    <AuthProvider>
      <AppContent 
        view={view} setView={setView} 
        showAuth={showAuth} setShowAuth={setShowAuth}
        cart={cart} addToCart={addToCart} removeFromCart={removeFromCart}
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        handleCategorySelect={handleCategorySelect}
      />
    </AuthProvider>
  );
}

const AppContent = ({ 
    view, setView, showAuth, setShowAuth, cart, addToCart, removeFromCart,
    searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, handleCategorySelect 
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm/50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div onClick={() => { setView('home'); setSelectedCategory(null); setSearchTerm(''); }} className="flex items-center gap-3 cursor-pointer group">
              <div className="hover:opacity-90 transition-opacity"><Logo className="h-12 w-auto object-contain" /></div>
            </div>
            <div className="hidden md:flex gap-1">
              <button onClick={() => { setView('home'); setSelectedCategory(null); }} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${view === 'home' ? 'bg-gray-100 text-[var(--color-gs-blue)]' : 'text-gray-500 hover:text-gray-900'}`}>Inicio</button>
              <button onClick={() => setView('products')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${view === 'products' ? 'bg-gray-100 text-[var(--color-gs-blue)]' : 'text-gray-500 hover:text-gray-900'}`}>Catálogo</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Buscador Rápido */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 border focus-within:border-[var(--color-gs-blue)] transition">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setView('products'); }}
                />
            </div>

            <button onClick={() => setView('cart')} className="relative p-2.5 hover:bg-gray-100 rounded-full transition-colors group">
              <ShoppingCart size={22} className="text-gray-600 group-hover:text-[var(--color-gs-blue)]" />
              {cart.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <div className="text-right hidden sm:block" onClick={() => setView('profile')}>
                  <p className="text-sm font-bold text-gray-900 cursor-pointer hover:underline">{user.nombre}</p>
                </div>
                {user.role === 'admin' && <button onClick={() => setView('admin')} className="p-2.5 bg-gray-100 rounded-full hover:bg-[var(--color-gs-yellow)] hover:text-[var(--color-gs-blue)] transition-colors"><BarChart3 size={20} /></button>}
                <button onClick={logout} className="p-2.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"><LogOut size={20} /></button>
              </div>
            ) : <Button onClick={() => setShowAuth(true)} variant="dark" className="text-sm px-6">Ingresar</Button>}
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {view === 'home' && <Home setView={setView} onCategorySelect={handleCategorySelect} />}
        {view === 'products' && <ProductList addToCart={addToCart} searchTerm={searchTerm} selectedCategory={selectedCategory} />}
        {view === 'cart' && <Cart cart={cart} removeFromCart={removeFromCart} setView={setView} />}
        {view === 'profile' && <ProfilePage />}
        {view === 'admin' && <AdminPanel token={localStorage.getItem('grafica_user') ? JSON.parse(localStorage.getItem('grafica_user')).token : ''} />}
      </main>

      {/* MODAL AUTH */}
      {showAuth && <AuthScreen onClose={() => setShowAuth(false)} />}
    </div>
  );
};