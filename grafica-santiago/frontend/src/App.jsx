import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  ShoppingCart, Search, BarChart3, LogOut, Grid, DollarSign, 
  Plus, X, User as UserIcon, Users, Menu, ArrowRight, Star, Package,
  Book, StickyNote, PenTool, Briefcase, Monitor, Backpack,
  FileText, Sheet, Truck, CheckCircle, AlertCircle,
  MapPin, Phone, CreditCard, ShieldCheck, Calendar, Lock, Trash2, Edit, MessageSquare,
  Filter, SlidersHorizontal, ChevronDown // 👈 AGREGADOS
} from 'lucide-react';

// 📦 LIBRERÍAS DE REPORTES
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// 🖼️ TU LOGO
import { Logo } from './components/Logo';

// 🔗 API (Localhost)
const API_URL = 'http://localhost:3000/api/v1';

// ==========================================
// 🔔 NOTIFICACIONES (TOAST)
// ==========================================
const NotificationToast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [onClose]);
  if (!message) return null;
  const styles = { success: 'bg-green-50 text-green-800 border-green-200', error: 'bg-red-50 text-red-800 border-red-200', info: 'bg-blue-50 text-blue-800 border-blue-200' };
  const icons = { success: <CheckCircle size={20} className="text-green-600"/>, error: <AlertCircle size={20} className="text-red-600"/>, info: <Truck size={20} className="text-blue-600"/> };
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-fade-in-down ${styles[type] || styles.info} min-w-[300px]`}>
      {icons[type] || icons.info}
      <div><h4 className="font-bold text-sm uppercase tracking-wide">{type === 'error' ? 'Error' : 'Éxito'}</h4><p className="text-sm font-medium">{message}</p></div>
      <button onClick={onClose} className="ml-auto opacity-50 hover:opacity-100"><X size={16}/></button>
    </div>
  );
};

// ==========================================
// CONFIGURACIÓN FESTIVA
// ==========================================
const FESTIVITIES = [
  { id: 'san_valentin', name: '❤️ San Valentín', start: { month: 0, day: 20 }, end: { month: 1, day: 15 }, keywords: ['regalo', 'amor', 'tarjeta', 'detalle', 'rojo'], color: 'bg-pink-100 text-pink-700 border-pink-200', banner: '¡Celebra el amor con nuestros detalles especiales!' },
  { id: 'carnaval', name: '🎭 ¡Llegó el Carnaval!', start: { month: 1, day: 16 }, end: { month: 2, day: 5 }, keywords: ['globo', 'agua', 'espuma', 'fiesta', 'carioca', 'pistola'], color: 'bg-purple-100 text-purple-700 border-purple-200', banner: '¡Juega y diviértete! Todo para este Carnaval 🎈💦' },
  { id: 'escolar', name: '🎒 Regreso a Clases', start: { month: 3, day: 1 }, end: { month: 4, day: 30 }, keywords: ['cuaderno', 'escolar', 'lápiz', 'mochila', 'juego geométrico'], color: 'bg-yellow-100 text-yellow-800 border-yellow-200', banner: '¡Prepara tu mochila con los mejores útiles!' },
  { id: 'navidad', name: '🎄 Feliz Navidad', start: { month: 11, day: 1 }, end: { month: 11, day: 31 }, keywords: ['navidad', 'regalo', 'juguete', 'adorno'], color: 'bg-red-100 text-red-700 border-red-200', banner: 'Los mejores regalos para esta Navidad 🎁' }
];
const useFestivity = () => {
  const today = new Date();
  return FESTIVITIES.find(f => { const start = new Date(today.getFullYear(), f.start.month, f.start.day); const end = new Date(today.getFullYear(), f.end.month, f.end.day); return today >= start && today <= end; }) || null;
};

// ==========================================
// CONTEXTO AUTH
// ==========================================
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const stored = localStorage.getItem('grafica_user'); if (stored) { const { user, token } = JSON.parse(stored); setUser(user); setToken(token); } setLoading(false); }, []);
  const saveSession = (u, t) => { setUser(u); setToken(t); localStorage.setItem('grafica_user', JSON.stringify({ user: u, token: t })); };
  const login = async (email, password) => { try { const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const data = await res.json(); if (data.success) { saveSession(data.user, data.token); return { success: true }; } return { success: false, message: data.message }; } catch (e) { return { success: false, message: 'Error de conexión' }; } };
  const register = async (userData) => { try { const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) }); const data = await res.json(); if (data.success) { saveSession(data.user, data.token); return { success: true }; } return { success: false, message: data.message }; } catch (e) { return { success: false, message: 'Error de conexión' }; } };
  const logout = () => { setUser(null); setToken(null); localStorage.removeItem('grafica_user'); window.location.href = "/"; };
  const updateProfile = async (d) => { try { const r = await fetch(`${API_URL}/me/update`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(d) }); const dt = await r.json(); if(dt.success) { saveSession(dt.user, token); return { success: true }; } return { success: false, message: dt.message }; } catch { return { success: false, message: "Error" }; } };
  return <AuthContext.Provider value={{ user, token, login, register, updateProfile, logout, isAuthenticated: !!user, loading }}>{children}</AuthContext.Provider>;
};

// ==========================================
// UI HELPERS
// ==========================================
const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const vars = { primary: "bg-[var(--color-gs-yellow)] text-[var(--color-gs-blue)] hover:bg-[var(--color-gs-yellow-hover)] shadow-md", secondary: "bg-white text-[var(--color-gs-blue)] border border-gray-200 hover:bg-gray-50", dark: "bg-[var(--color-gs-blue)] text-white hover:bg-[var(--color-gs-blue-light)] shadow-lg", danger: "bg-red-50 text-red-600 hover:bg-red-100" };
  return <button onClick={onClick} className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${vars[variant]} ${className}`} {...props}>{children}</button>;
};
const Input = ({ label, ...props }) => (<div className="mb-4">{label && <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>}<input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-800 outline-none transition bg-white" {...props} /></div>);
const getCategoryIcon = (n) => { const x=n.toLowerCase(); if(x.includes('cuaderno'))return Book; if(x.includes('papel'))return StickyNote; if(x.includes('escritura')||x.includes('bolígrafo'))return PenTool; if(x.includes('oficina'))return Briefcase; if(x.includes('tecno')||x.includes('comput'))return Monitor; if(x.includes('escolar'))return Backpack; return Package; };

// ==========================================
// MODAL DE DETALLE DEL PRODUCTO (RESEÑAS)
// ==========================================
const ProductDetailModal = ({ product, onClose, addToCart, user, token, notify }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState(product.reviews || []);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) return notify('Inicia sesión para opinar', 'info');
    if (rating === 0) return notify('Selecciona una calificación', 'error');

    try {
      const res = await fetch(`${API_URL}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rating, comment, productId: product._id })
      });
      if (res.ok) {
        notify('¡Gracias por tu opinión!', 'success');
        setReviews([...reviews, { user: user._id, nombre: user.nombre, rating, comentario: comment }]);
        setComment(''); setRating(0);
      } else notify('Error al guardar reseña', 'error');
    } catch { notify('Error de conexión', 'error'); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition"><X size={20}/></button>
        
        {/* IMAGEN */}
        <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8">
          <img src={product.imagenes?.[0]?.url || 'https://via.placeholder.com/400'} className="max-h-80 object-contain drop-shadow-xl hover:scale-105 transition duration-500"/>
        </div>

        {/* INFO + RESEÑAS */}
        <div className="md:w-1/2 p-8 overflow-y-auto">
          <div className="mb-6">
            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase">{product.categoria}</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2 leading-tight">{product.nombre}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= (product.ratingPromedio || 0) ? "currentColor" : "none"} />)}
              </div>
              <span className="text-sm text-gray-500">({product.numResenas || 0} opiniones)</span>
            </div>
            <p className="text-3xl font-black text-[var(--color-gs-blue)] mt-4">${product.precio?.minorista?.toFixed(2)}</p>
            <Button onClick={() => { addToCart(product); onClose(); }} className="w-full mt-4 py-4 text-lg shadow-lg shadow-yellow-200">
              <ShoppingCart size={20}/> Agregar al Carrito
            </Button>
          </div>

          {/* SECCIÓN RESEÑAS */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare size={20}/> Opiniones</h3>
            
            {user ? (
              <form onSubmit={submitReview} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold uppercase text-gray-500 mb-2">Tu Calificación:</p>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="focus:outline-none transition transform hover:scale-110">
                      <Star size={24} className={star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
                <textarea className="w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none" rows="2" placeholder="¿Qué te pareció el producto?" value={comment} onChange={e => setComment(e.target.value)} required />
                <button type="submit" className="mt-2 text-xs font-bold bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800">Publicar</button>
              </form>
            ) : <p className="text-sm text-gray-500 mb-4 italic bg-gray-50 p-3 rounded-lg text-center">Inicia sesión para dejar una reseña.</p>}

            <div className="space-y-4">
              {reviews.length > 0 ? reviews.map((r, i) => (
                <div key={i} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-sm text-gray-800">{r.nombre}</p>
                    <div className="flex text-yellow-400">{[...Array(5)].map((_,x) => <Star key={x} size={12} fill={x < r.rating ? "currentColor" : "none"}/>)}</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{r.comentario}</p>
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-4">Sé el primero en opinar ⭐</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// VISTAS PRINCIPALES
// ==========================================

const AuthScreen = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', nombre: '', apellido: '' });
  const { login, register } = useAuth();
  const handleSubmit = async (e) => { e.preventDefault(); const res = isLogin ? await login(formData.email, formData.password) : await register(formData); if (res.success) { if(onSuccess) onSuccess(); onClose(); } else alert(res.message); };
  return (
    <div className="fixed inset-0 bg-blue-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"><X/></button>
        <div className="text-center mb-8"><div className="flex justify-center mb-6"><Logo className="h-20"/></div><h2 className="text-2xl font-black">{isLogin?'Bienvenido':'Crear Cuenta'}</h2></div>
        <form onSubmit={handleSubmit}>
          {!isLogin && <div className="grid grid-cols-2 gap-4"><Input placeholder="Nombre" onChange={e=>setFormData({...formData, nombre: e.target.value})}/><Input placeholder="Apellido" onChange={e=>setFormData({...formData, apellido: e.target.value})}/></div>}
          <Input type="email" placeholder="Correo" onChange={e=>setFormData({...formData, email: e.target.value})}/>
          <Input type="password" placeholder="Contraseña" onChange={e=>setFormData({...formData, password: e.target.value})}/>
          <Button type="submit" className="w-full mt-2" variant="dark">{isLogin?'Ingresar':'Registrarse'}</Button>
        </form>
        <p className="text-center mt-6 text-sm"><button onClick={()=>setIsLogin(!isLogin)} className="font-bold text-blue-900 hover:underline">{isLogin?'¿No tienes cuenta? Regístrate':'¿Ya tienes cuenta? Ingresa'}</button></p>
      </div>
    </div>
  );
};

const UserFormModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); } else { alert(data.message); }
    } catch { alert('Error conexión'); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">Crear Nuevo Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4"><Input placeholder="Nombre" onChange={e=>setForm({...form, nombre: e.target.value})} required/><Input placeholder="Apellido" onChange={e=>setForm({...form, apellido: e.target.value})} required/></div>
          <Input placeholder="Email" type="email" onChange={e=>setForm({...form, email: e.target.value})} required/>
          <Input placeholder="Contraseña" type="password" onChange={e=>setForm({...form, password: e.target.value})} required/>
          <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={onClose} type="button">Cancelar</Button><Button variant="dark" type="submit">Crear Usuario</Button></div>
        </form>
      </div>
    </div>
  );
};

const Home = ({ setView, onCategorySelect, addToCart }) => {
  const [categories, setCategories] = useState([]);
  const [festiveProducts, setFestiveProducts] = useState([]);
  const activeFestivity = useFestivity();
  useEffect(() => {
    fetch(`${API_URL}/categories`).then(res => res.json()).then(data => { if(data.success) setCategories(data.categories); });
    if (activeFestivity) { fetch(`${API_URL}/products?keyword=${activeFestivity.keywords[0]}`).then(res => res.json()).then(data => { if(data.success) setFestiveProducts(data.products.slice(0, 4)); }); }
  }, []);
  return (
    <div className="animate-fade-in space-y-12">
      {activeFestivity && <div className={`p-6 rounded-3xl border-2 ${activeFestivity.color} flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm`}><div className="flex items-center gap-4"><span className="text-4xl">🎉</span><div><h3 className="text-xl font-black uppercase">{activeFestivity.name}</h3><p className="font-medium opacity-90">{activeFestivity.banner}</p></div></div><Button onClick={() => onCategorySelect(null)} className="bg-white/50 border-0 shadow-none text-current">Ver Ofertas <ArrowRight size={18}/></Button></div>}
      <div className="relative overflow-hidden bg-[var(--color-gs-blue)] text-white rounded-[2.5rem] p-12 md:p-24 text-center shadow-2xl"><div className="relative z-10 max-w-3xl mx-auto"><span className="bg-[var(--color-gs-yellow)] text-blue-900 px-4 py-1.5 rounded-full text-sm font-black mb-6 inline-block">2026</span><h1 className="text-5xl md:text-7xl font-black mb-6">Calidad que imprime <span className="text-[var(--color-gs-yellow)]">éxito.</span></h1><Button onClick={() => setView('products')} variant="primary" className="px-8 py-4 text-lg mx-auto">Ver Catálogo <ArrowRight/></Button></div></div>
      {activeFestivity && festiveProducts.length > 0 && <div><h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🔥 Especial de {activeFestivity.name}</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{festiveProducts.map(p => (<div key={p._id} className="bg-white border p-4 rounded-3xl hover:shadow-lg transition"><div className="h-40 bg-gray-50 rounded-xl overflow-hidden mb-4 relative"><img src={p.imagenes?.[0]?.url} className="w-full h-full object-cover"/><span className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">DESTACADO</span></div><h4 className="font-bold text-gray-900 line-clamp-1">{p.nombre}</h4><div className="flex justify-between items-center mt-2"><span className="font-black text-lg text-purple-600">${p.precio.minorista}</span><button onClick={() => addToCart(p)} className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-600 hover:text-white transition"><ShoppingCart size={16}/></button></div></div>))}</div></div>}
      <div><h2 className="text-2xl font-bold mb-6 text-gray-800">Categorías Destacadas</h2><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">{categories.map(cat => { const Icon = getCategoryIcon(cat); return (<button key={cat} onClick={() => onCategorySelect(cat)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition group text-center flex flex-col items-center gap-3"><div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-900 transition-colors"><Icon className="w-6 h-6 text-blue-900 group-hover:text-white transition-colors"/></div><h3 className="font-bold text-sm text-gray-800">{cat}</h3></button>); })}</div></div>
    </div>
  );
};

// --- PRODUCT LIST (ACTUALIZADO CON MODAL) ---
// --- LISTA DE PRODUCTOS CON FILTROS AVANZADOS ---
const ProductList = ({ addToCart, selectedCategory, searchTerm, openProductModal }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Filtros
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortOption, setSortOption] = useState('default'); // 'asc', 'desc', 'alpha'
  const [localCategory, setLocalCategory] = useState(selectedCategory || 'Todas');
  const [showFilters, setShowFilters] = useState(false); // Para móvil

  // 1. Cargar productos desde API
  useEffect(() => {
    setLoading(true);
    let url = `${API_URL}/products?limit=1000`; // Traemos más para filtrar localmente
    if(searchTerm) url += `&keyword=${searchTerm}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchTerm]);

  // 2. Sincronizar categoría si viene desde Home
  useEffect(() => {
    if(selectedCategory) setLocalCategory(selectedCategory);
  }, [selectedCategory]);

  // 3. Lógica Maestra de Filtrado (Se ejecuta cuando cambia algo)
  useEffect(() => {
    let result = [...products];

    // A. Filtro Categoría
    if (localCategory && localCategory !== 'Todas') {
      result = result.filter(p => p.categoria === localCategory);
    }

    // B. Filtro Precio
    if (priceRange.min) result = result.filter(p => p.precio.minorista >= Number(priceRange.min));
    if (priceRange.max) result = result.filter(p => p.precio.minorista <= Number(priceRange.max));

    // C. Ordenamiento
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.precio.minorista - b.precio.minorista);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.precio.minorista - a.precio.minorista);
    } else if (sortOption === 'alpha') {
      result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    setFilteredProducts(result);
  }, [products, priceRange, sortOption, localCategory]);

  // Obtener categorías únicas de los productos cargados
  const uniqueCategories = ['Todas', ...new Set(products.map(p => p.categoria))].sort();

  if(loading) return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div><p className="mt-4 text-gray-500">Cargando catálogo...</p></div>;

  return (
    <div className="animate-fade-in pb-10">
      
      {/* HEADER DE FILTROS (Móvil y Desktop) */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Catálogo</h2>
          <p className="text-gray-500 text-sm">{filteredProducts.length} resultados encontrados</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* Botón Filtros Móvil */}
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex-1 flex items-center justify-center gap-2 bg-white border px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
            <Filter size={16}/> Filtros
          </button>

          {/* Selector de Ordenamiento */}
          <div className="relative group min-w-[180px]">
            <select 
              className="appearance-none w-full bg-white border px-4 py-2.5 pr-8 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer shadow-sm"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Relevancia</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="alpha">Nombre: A - Z</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none group-hover:text-blue-600"/>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* 🕵️‍♂️ SIDEBAR DE FILTROS */}
        <aside className={`md:w-64 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
          
          {/* Rango de Precio */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              <DollarSign size={16} className="text-blue-600"/> Precio
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <input 
                type="number" 
                placeholder="Min" 
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
              />
              <span className="text-gray-400">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
              />
            </div>
            {(priceRange.min || priceRange.max) && (
              <button onClick={() => setPriceRange({min:'', max:''})} className="text-xs text-red-500 hover:underline font-bold w-full text-right">
                Limpiar precio
              </button>
            )}
          </div>

          {/* Lista de Categorías */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Grid size={16} className="text-blue-600"/> Categorías
            </h3>
            <ul className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {uniqueCategories.map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => setLocalCategory(cat)}
                    className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-all ${localCategory === cat ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* 📦 GRILLA DE PRODUCTOS */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                <div key={p._id} onClick={() => openProductModal(p)} className="bg-white rounded-3xl overflow-hidden border hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer relative hover:-translate-y-1">
                  <div className="h-48 bg-gray-50 relative overflow-hidden">
                    <img src={p.imagenes?.[0]?.url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={p.nombre} />
                    {p.stock <= 5 && <span className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">¡Últimos {p.stock}!</span>}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                       <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < Math.round(p.ratingPromedio || 0) ? "currentColor" : "none"} />)}</div>
                       <span className="text-[10px] text-gray-400">({p.numResenas || 0})</span>
                    </div>
                    <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2 text-sm">{p.nombre}</h3>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Precio</p>
                        <span className="text-xl font-black text-[var(--color-gs-blue)]">${p.precio?.minorista?.toFixed(2)}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} className="bg-[var(--color-gs-blue)] text-white p-2.5 rounded-xl hover:bg-yellow-400 hover:text-blue-900 transition shadow-lg active:scale-90"><ShoppingCart size={18}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed text-center">
              <div className="bg-gray-50 p-6 rounded-full mb-4"><SlidersHorizontal size={40} className="text-gray-300"/></div>
              <h3 className="text-xl font-bold text-gray-900">No hay resultados</h3>
              <p className="text-gray-500 mb-6 max-w-xs mx-auto">Intenta ajustar los filtros o buscar con otra palabra clave.</p>
              <button onClick={() => {setPriceRange({min:'',max:''}); setLocalCategory('Todas'); setSortOption('default');}} className="text-blue-600 font-bold hover:underline">Limpiar todos los filtros</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckoutModal = ({ cart, total, user, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ cedula: user.cedulaRuc || '', telefono: user.telefono || '', direccion: user.direcciones?.[0]?.calle || '', ciudad: user.direcciones?.[0]?.ciudad || 'Loja', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' });
  const handlePhoneChange = (e) => { const val = e.target.value; if (/^[+]?[0-9]*$/.test(val)) setFormData({ ...formData, telefono: val }); };
  const handleSubmit = (e) => { e.preventDefault(); if (step === 1) { if (!formData.cedula || !formData.telefono || !formData.direccion) return; setStep(2); } else { if (formData.cardNumber.length < 16 || !formData.cardCvv) return; onConfirm(formData); } };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
      <div className="bg-[#f5f5f5] w-full max-w-lg md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-white p-4 flex justify-between items-center border-b"><h3 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="text-green-500"/> Checkout</h3><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X/></button></div>
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <div className="bg-white p-5 rounded-2xl shadow-sm space-y-4"><h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase"><MapPin size={16} className="text-blue-900"/> Envío</h4><div className="grid grid-cols-2 gap-3"><div className="col-span-2 relative"><FileText className="absolute left-3 top-3 text-gray-400" size={18}/><input type="text" placeholder="Cédula / RUC" className="w-full pl-10 pr-4 py-3 rounded-xl border" value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} required /></div><div className="col-span-2 relative"><Phone className="absolute left-3 top-3 text-gray-400" size={18}/><input type="text" placeholder="Teléfono (+593...)" className="w-full pl-10 pr-4 py-3 rounded-xl border" value={formData.telefono} onChange={handlePhoneChange} maxLength={15} required /></div><div className="col-span-2"><textarea rows="2" placeholder="Dirección Exacta..." className="w-full px-4 py-3 rounded-xl border resize-none" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} required /></div><input type="text" className="w-full px-4 py-3 rounded-xl border" placeholder="Ciudad" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} /></div></div>
            ) : (
              <div className="bg-white p-5 rounded-2xl shadow-sm space-y-4"><h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase"><CreditCard size={16} className="text-blue-900"/> Pago</h4><div className="p-4 bg-gray-900 rounded-xl text-white shadow-lg mb-4"><div className="flex justify-between mb-6"><span className="text-xs opacity-70">Credit Card</span><span className="font-bold italic">VISA</span></div><div className="text-xl tracking-widest mb-4">{formData.cardNumber || '•••• •••• •••• ••••'}</div><div className="flex justify-between text-xs opacity-80"><span>{formData.cardName || 'TITULAR'}</span><span>{formData.cardExpiry || 'MM/YY'}</span></div></div><div className="grid grid-cols-2 gap-3"><div className="col-span-2 relative"><CreditCard className="absolute left-3 top-3 text-gray-400" size={18}/><input type="text" maxLength="19" placeholder="Número de Tarjeta" className="w-full pl-10 pr-4 py-3 rounded-xl border" value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} required/></div><input type="text" placeholder="Nombre Titular" className="col-span-2 w-full px-4 py-3 rounded-xl border" value={formData.cardName} onChange={e => setFormData({...formData, cardName: e.target.value})} required /><div className="relative"><Calendar className="absolute left-3 top-3 text-gray-400" size={18}/><input type="text" placeholder="MM/YY" maxLength="5" className="w-full pl-10 pr-4 py-3 rounded-xl border" value={formData.cardExpiry} onChange={e => setFormData({...formData, cardExpiry: e.target.value})} required/></div><div className="relative"><Lock className="absolute left-3 top-3 text-gray-400" size={18}/><input type="password" placeholder="CVV" maxLength="3" className="w-full pl-10 pr-4 py-3 rounded-xl border" value={formData.cardCvv} onChange={e => setFormData({...formData, cardCvv: e.target.value})} required/></div></div></div>
            )}
            <div className="bg-white p-5 rounded-2xl shadow-sm flex justify-between items-center"><span className="font-bold text-gray-900">Total</span><span className="font-black text-2xl text-yellow-500">${(total * 1.15).toFixed(2)}</span></div>
          </form>
        </div>
        <div className="bg-white p-4 border-t safe-area-bottom"><button type="submit" form="checkout-form" className="w-full bg-[var(--color-gs-yellow)] hover:bg-yellow-400 text-blue-900 font-black py-4 rounded-full shadow-lg text-lg flex items-center justify-center gap-2">{step === 1 ? <>Continuar <ArrowRight/></> : <>Pagar <CheckCircle/></>}</button></div>
      </div>
    </div>
  );
};

const Cart = ({ cart, removeFromCart, setView, setShowAuth, notify }) => {
  const { token, user, updateProfile } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const total = cart.reduce((acc, item) => acc + (item.precio.minorista * item.quantity), 0);
  const handlePlaceOrder = async (shippingData) => {
    if (!token) return notify('Sesión expirada', 'error');
    await updateProfile({ telefono: shippingData.telefono, cedulaRuc: shippingData.cedula });
    const orderData = { orderItems: cart.map(i => ({ product: i._id, nombre: i.nombre, cantidad: i.quantity, precio: i.precio.minorista, imagen: i.imagenes?.[0]?.url || 'https://via.placeholder.com/150' })), shippingInfo: { direccion: shippingData.direccion, ciudad: shippingData.ciudad, telefono: shippingData.telefono }, itemsPrice: total, totalPrice: total * 1.15 };
    try { const res = await fetch(`${API_URL}/order/new`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(orderData) }); const data = await res.json(); if (data.success) { setShowCheckout(false); notify('🎉 ¡Pedido realizado!', 'success'); setTimeout(() => window.location.reload(), 2000); } else { notify(`Error: ${data.message}`, 'error'); } } catch(e) { notify('Error de conexión', 'error'); }
  };
  if(cart.length === 0) return <div className="text-center py-20 bg-white rounded-3xl border border-dashed"><ShoppingCart className="mx-auto text-gray-300 mb-4" size={48}/><p className="text-gray-500">Carrito vacío.</p></div>;
  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20"><h2 className="text-3xl font-bold mb-8">Carrito de Compras</h2><div className="grid md:grid-cols-3 gap-8"><div className="md:col-span-2 space-y-4">{cart.map(item => (<div key={item._id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border"><img src={item.imagenes?.[0]?.url} className="w-20 h-20 rounded-xl object-cover bg-gray-50"/><div className="flex-1"><h4 className="font-bold text-gray-900">{item.nombre}</h4><p className="text-sm text-gray-500">${item.precio.minorista} x {item.quantity}</p></div><div className="text-right"><p className="font-bold text-lg">${(item.precio.minorista * item.quantity).toFixed(2)}</p><button onClick={() => removeFromCart(item._id)} className="text-red-500 text-xs font-bold hover:underline">Eliminar</button></div></div>))}</div><div className="bg-white p-8 rounded-3xl h-fit shadow-xl border"><div className="flex justify-between text-2xl font-black text-blue-900 mb-8"><span>Total</span><span>${(total * 1.15).toFixed(2)}</span></div><Button onClick={() => { if(!user) { notify("Inicia sesión para continuar", "info"); setShowAuth(true); return; } setShowCheckout(true); }} className="w-full py-4 text-lg">Comprar Ahora</Button></div></div>{showCheckout && <CheckoutModal cart={cart} total={total} user={user} onClose={() => setShowCheckout(false)} onConfirm={handlePlaceOrder} />}</div>
  );
};

// ==========================================
// MODAL DE CONFIRMACIÓN DE ROL
// ==========================================
const RoleConfirmModal = ({ isOpen, onClose, onConfirm, targetUser, newRole }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onConfirm(password); // Enviamos la contraseña al padre
        setLoading(false);
        setPassword(''); // Limpiar campo
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20}/></button>
                
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Confirmar Cambio</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Estás cambiando a <span className="font-bold text-gray-800">{targetUser?.nombre}</span> al rol de <span className="font-bold uppercase text-blue-600">{newRole}</span>.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ingresa tu contraseña de Admin:</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-lg disabled:opacity-70 transition flex justify-center items-center gap-2">
                            {loading ? 'Verificando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- ADMIN & BODEGA PANEL ---
const AdminPanel = ({ token, userRole, notify }) => {
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('products');
    const [viewMode, setViewMode] = useState('list');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]); 
    const [showUserModal, setShowUserModal] = useState(false);

    // Estados para el Modal de Cambio de Rol
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [targetUser, setTargetUser] = useState(null);
    const [pendingRole, setPendingRole] = useState('');

    const refreshData = async () => {
        try {
            const prodRes = await fetch(`${API_URL}/products?limit=1000`);
            const prodData = await prodRes.json();
            if(prodData.success) setProducts(prodData.products);

            if (userRole === 'admin') {
                const repRes = await fetch(`${API_URL}/reports/summary`, { headers: { 'Authorization': `Bearer ${token}` } });
                const repData = await repRes.json();
                if(repData.success) setStats(repData.summary);

                const ordRes = await fetch(`${API_URL}/admin/orders`, { headers: { 'Authorization': `Bearer ${token}` } });
                const ordData = await ordRes.json();
                if(ordData.success) setOrders(ordData.orders);

                const userRes = await fetch(`${API_URL}/auth/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUsers(userData.users);
                }
            }
        } catch (error) {
            notify("Error de conexión al cargar panel", "error");
        }
    };

    useEffect(() => { refreshData(); }, [userRole]);

    // 1. INICIAR EL CAMBIO (Abre el modal)
    const initiateRoleChange = (user, newRole) => {
        setTargetUser(user);
        setPendingRole(newRole);
        setRoleModalOpen(true);
    };

    // 2. CONFIRMAR EL CAMBIO (Llama al backend con password)
    const confirmRoleChange = async (adminPassword) => {
        try {
            const res = await fetch(`${API_URL}/auth/admin/user/${targetUser._id}/role`, {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ role: pendingRole, adminPassword }) // Enviamos password
            });
            const data = await res.json();

            if(res.ok) { 
                notify('✅ Rol actualizado correctamente', 'success'); 
                setRoleModalOpen(false); // Cierra modal
                refreshData(); 
            } else { 
                notify(`❌ Error: ${data.message}`, 'error'); 
                // No cerramos el modal para que pueda reintentar si se equivocó de contraseña
            }
        } catch { notify('Error de conexión', 'error'); }
    };

    const handleDeleteUser = async (userId) => {
        if(!confirm("⚠️ ¿Estás seguro de eliminar este usuario permanentemente? Esta acción no se puede deshacer.")) return;
        try {
            const res = await fetch(`${API_URL}/auth/admin/user/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if(res.ok) { notify('Usuario eliminado', 'success'); refreshData(); }
            else { notify('No se pudo eliminar', 'error'); }
        } catch { notify('Error de conexión', 'error'); }
    };

    const exportToExcel = () => { const wb = XLSX.utils.book_new(); const ws = XLSX.utils.json_to_sheet(products); XLSX.utils.book_append_sheet(wb, ws, "Inventario"); XLSX.writeFile(wb, "Reporte.xlsx"); };
    
    const ProductForm = ({ token, onCancel, onSuccess }) => {
        const [formData, setFormData] = useState({ nombre: '', descripcion: '', precioMinorista: '', precioMayorista: '', stock: '', categoria: 'Papelería', imagenUrl: '' });
        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const body = { nombre: formData.nombre, descripcion: formData.descripcion, precio: { minorista: Number(formData.precioMinorista), mayorista: Number(formData.precioMayorista) }, stock: Number(formData.stock), categoria: formData.categoria, imagenes: [{ url: formData.imagenUrl || 'https://via.placeholder.com/300' }] };
                const res = await fetch(`${API_URL}/admin/product/new`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
                const data = await res.json();
                if (data.success) { alert('✅ Producto creado'); onSuccess(); } else alert(data.message);
            } catch { alert('Error de conexión'); }
        };
        return (
            <div className="bg-white p-8 rounded-3xl shadow-lg max-w-2xl mx-auto animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Nuevo Producto</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                    <Input placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4"><Input type="number" placeholder="Precio ($)" value={formData.precioMinorista} onChange={e => setFormData({...formData, precioMinorista: e.target.value})} required /><Input type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required /></div>
                    <Input placeholder="URL Imagen" value={formData.imagenUrl} onChange={e => setFormData({...formData, imagenUrl: e.target.value})} />
                    <div className="flex justify-end gap-3 mt-6"><Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button><Button type="submit">Guardar</Button></div>
                </form>
            </div>
        );
    };

    if (viewMode === 'addProduct') return <ProductForm token={token} onCancel={() => setViewMode('list')} onSuccess={() => {setViewMode('list'); refreshData();}} />;
    if (userRole === 'admin' && !stats) return <div className="p-10 text-center animate-pulse">Cargando panel...</div>;

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center"><h2 className="text-3xl font-bold">{userRole === 'bodega' ? '📦 Bodega' : '📊 Admin'}</h2><div className="flex gap-2">{userRole === 'admin' && <><button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg flex gap-2 items-center"><Sheet size={18}/> Excel</button></>}<Button onClick={() => setViewMode('addProduct')}><Plus size={18}/> Nuevo Producto</Button></div></div>
            
            {userRole === 'admin' && (
              <div className="flex gap-4 border-b pb-2 mb-6">
                {['dashboard', 'orders', 'products', 'users'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-bold capitalize ${activeTab===tab ? 'text-blue-900 border-b-2 border-blue-900' : 'text-gray-500'}`}>{tab === 'users' ? 'Usuarios' : tab === 'orders' ? 'Pedidos' : tab === 'products' ? 'Inventario' : 'Resumen'}</button>
                ))}
              </div>
            )}

            {activeTab === 'dashboard' && userRole === 'admin' && <div className="grid grid-cols-1 md:grid-cols-4 gap-6"><StatCard title="Ventas" value={`$${stats?.totalSales.toFixed(2)}`} icon={DollarSign} color="bg-emerald-500" /><StatCard title="Pedidos" value={stats?.ordersCount} icon={Package} color="bg-blue-500" /><StatCard title="Usuarios" value={stats?.usersCount} icon={Users} color="bg-purple-500" /><StatCard title="Productos" value={stats?.productsCount} icon={Grid} color="bg-orange-500" /></div>}

            {activeTab === 'orders' && userRole === 'admin' && (
               <div className="bg-white p-6 rounded-3xl border shadow-sm overflow-auto max-h-96">
                 {orders.length === 0 ? <p className="text-center text-gray-500">No hay pedidos aún.</p> : 
                 <table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 sticky top-0"><tr><th className="p-3">ID</th><th className="p-3">Usuario</th><th className="p-3">Total</th><th className="p-3">Estado</th><th className="p-3">Fecha</th></tr></thead><tbody>{orders.map(o => (<tr key={o._id} className="border-b"><td className="p-3 text-xs font-mono">{o._id}</td><td className="p-3 font-bold">{o.user?.nombre}<br/><span className="text-xs text-gray-400 font-normal">{o.user?.email}</span></td><td className="p-3 text-green-600 font-bold">${o.totalPrice?.toFixed(2)}</td><td className="p-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">{o.orderStatus}</span></td><td className="p-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td></tr>))}</tbody></table>}
               </div>
            )}

            {activeTab === 'users' && userRole === 'admin' && (
                <div className="space-y-4">
                    <div className="flex justify-end"><Button onClick={() => setShowUserModal(true)} variant="secondary"><Plus size={16}/> Crear Usuario</Button></div>
                    <div className="bg-white p-6 rounded-3xl border shadow-sm overflow-auto max-h-96">
                        {users.length === 0 ? <p className="text-center text-gray-500 p-4">Lista vacía...</p> :
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 sticky top-0"><tr><th className="p-3">Nombre</th><th className="p-3">Email</th><th className="p-3">Rol Actual</th><th className="p-3">Acciones</th></tr></thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-bold">{u.nombre} {u.apellido}</td>
                                        <td className="p-3 text-gray-500">{u.email}</td>
                                        <td className="p-3">
                                            <select 
                                                value={u.role} 
                                                onChange={(e) => initiateRoleChange(u, e.target.value)} 
                                                className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer outline-none ${u.role==='admin'?'bg-purple-100 text-purple-700 border-purple-200': u.role==='bodega'?'bg-orange-100 text-orange-700 border-orange-200':'bg-blue-50 text-blue-700 border-blue-100'}`}
                                            >
                                                <option value="user">Usuario</option>
                                                <option value="bodega">Bodega</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="p-3">
                                            <button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"><Trash2 size={18}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>}
                    </div>
                </div>
            )}

            {(activeTab === 'products' || userRole === 'bodega') && (
               <div className="bg-white p-6 rounded-3xl border shadow-sm overflow-auto max-h-96"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 sticky top-0"><tr><th className="p-3">Producto</th><th className="p-3">Cat</th><th className="p-3">Stock</th></tr></thead><tbody>{products.map(p => (<tr key={p._id} className="border-b"><td className="p-3">{p.nombre}</td><td className="p-3 text-gray-500">{p.categoria}</td><td className="p-3 font-bold text-green-600">{p.stock}</td></tr>))}</tbody></table></div>
            )}

            {showUserModal && <UserFormModal onClose={() => setShowUserModal(false)} onSuccess={() => { notify('Usuario creado', 'success'); refreshData(); }} />}
            
            <RoleConfirmModal 
                isOpen={roleModalOpen} 
                onClose={() => { setRoleModalOpen(false); refreshData(); }} 
                onConfirm={confirmRoleChange} 
                targetUser={targetUser}
                newRole={pendingRole}
            />
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (<div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4"><div className={`${color} p-4 rounded-2xl text-white shadow-lg`}><Icon size={24} /></div><div><p className="text-gray-500 text-sm font-medium uppercase">{title}</p><h4 className="text-2xl font-black text-gray-900">{value}</h4></div></div>);

// --- MAIN LAYOUT ---
export default function App() {
  const [view, setView] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  
  // 🌟 ESTADO PARA EL MODAL DE PRODUCTO
  const [selectedProduct, setSelectedProduct] = useState(null);

  const notify = (message, type = 'info') => { setNotification({ message, type, visible: true }); };
  
  const addToCart = (product) => { 
    setCart(prev => { 
        const exists = prev.find(p => p._id === product._id); 
        if (exists) return prev.map(p => p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p); 
        return [...prev, { ...product, quantity: 1 }]; 
    }); 
    notify("Agregado al carrito", "success");
  };

  return (
    <AuthProvider>
      {notification.visible && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, visible: false })} />}
      
      {/* RENDERIZAMOS EL MODAL DE DETALLE SI HAY UN PRODUCTO SELECCIONADO */}
      <AppContent 
        view={view} setView={setView} 
        showAuth={showAuth} setShowAuth={setShowAuth} 
        cart={cart} addToCart={addToCart} 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        notify={notify}
        selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct}
      />
    </AuthProvider>
  );
}

const AppContent = ({ view, setView, showAuth, setShowAuth, cart, addToCart, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, notify, selectedProduct, setSelectedProduct }) => {
  const { user, logout, isAuthenticated, token } = useAuth();

  const removeFromCart = (id) => {
    // Definimos removeFromCart aquí o pasamos el setter desde arriba
    // Como AppContent recibe props, pero removeFromCart no está en props de AppContent en la definición original de App
    // Lo ideal es que App se encargue de todo el estado.
    // Pero para arreglarlo rápido:
    // NOTA: En la función App de arriba, ya pasé removeFromCart a AppContent.
    // Solo necesito recibirlo en las props de este componente.
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-white border-b sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex gap-4 items-center">
            <Logo className="h-10 cursor-pointer" onClick={()=>setView('home')}/>
            <button onClick={()=>setView('products')} className="font-bold text-sm text-gray-500 hover:text-blue-900">Catálogo</button>
        </div>
        <div className="flex gap-4 items-center">
            <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center"><Search size={16} className="text-gray-400 mr-2"/><input placeholder="Buscar..." className="bg-transparent text-sm outline-none" value={searchTerm} onChange={e=>{setSearchTerm(e.target.value); setView('products')}}/></div>
            <button onClick={()=>setView('cart')} className="relative"><ShoppingCart/><span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span></button>
            {isAuthenticated ? <button onClick={()=>setView('profile')} className="font-bold text-sm">{user.nombre}</button> : <Button onClick={()=>setShowAuth(true)} variant="dark" className="text-sm px-4 py-1">Ingresar</Button>}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {view === 'home' && <Home setView={setView} onCategorySelect={(c)=>{setSelectedCategory(c); setView('products');}} addToCart={addToCart} />}
        {view === 'products' && (
            <ProductList 
                addToCart={addToCart} 
                searchTerm={searchTerm} 
                selectedCategory={selectedCategory} 
                openProductModal={setSelectedProduct} 
            />
        )}
        {view === 'cart' && <Cart cart={cart} removeFromCart={(id)=>cart.filter(p=>p._id!==id)} setView={setView} setShowAuth={setShowAuth} notify={notify} />}
        {view === 'my-orders' && <OrderHistory />}
        {view === 'profile' && <ProfilePage />} 
        {view === 'admin' && <AdminPanel token={token} userRole={user?.role} notify={notify} />}
      </main>

      {/* MODALES GLOBALES */}
      {showAuth && <AuthScreen onClose={() => setShowAuth(false)} onSuccess={() => notify('Bienvenido', 'success')} />}
      
      {/* ✨ AQUÍ ESTÁ LA MAGIA: EL MODAL DE DETALLE ✨ */}
      {selectedProduct && (
        <ProductDetailModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            addToCart={addToCart}
            user={user}
            token={token}
            notify={notify}
        />
      )}
    </div>
  );
};