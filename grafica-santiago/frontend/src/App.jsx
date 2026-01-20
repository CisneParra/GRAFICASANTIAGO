import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  ShoppingCart, Search, BarChart3, 
  LogOut, Grid, DollarSign, 
  Plus, X, User as UserIcon, Users, 
  Menu, ArrowRight, Star, Package,
  Book, StickyNote, PenTool, Briefcase, Monitor, Backpack,
  FileText, Sheet, Truck, CheckCircle, AlertCircle,
  MapPin, Phone, CreditCard, ShieldCheck, Calendar, Lock, Trash2, Edit
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
// MODAL USUARIO (CREAR NUEVO DESDE ADMIN)
// ==========================================
const UserFormModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '' });
  const { register } = useAuth(); // Usamos la misma función de registro pero sin loguear automáticamente al admin como el nuevo usuario
  
  // Nota: Para admin creando usuarios, deberíamos usar un endpoint específico o manejar el token con cuidado.
  // Por simplicidad, usaremos fetch directo aquí para no cerrar la sesión del admin.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); } else { alert(data.message); }
    } catch { alert('Error conexión'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">Crear Nuevo Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Nombre" onChange={e=>setForm({...form, nombre: e.target.value})} required/>
            <Input placeholder="Apellido" onChange={e=>setForm({...form, apellido: e.target.value})} required/>
          </div>
          <Input placeholder="Email" type="email" onChange={e=>setForm({...form, email: e.target.value})} required/>
          <Input placeholder="Contraseña" type="password" onChange={e=>setForm({...form, password: e.target.value})} required/>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
            <Button variant="dark" type="submit">Crear Usuario</Button>
          </div>
        </form>
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

const ProductList = ({ addToCart, selectedCategory, searchTerm }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); let url = `${API_URL}/products?`; if(searchTerm) url += `keyword=${searchTerm}&`; if(selectedCategory) url += `category=${selectedCategory}`; fetch(url).then(res => res.json()).then(data => { if(data.success) setProducts(data.products); setLoading(false); }); }, [searchTerm, selectedCategory]);
  if(loading) return <div className="text-center py-20">Cargando...</div>;
  return (
    <div className="animate-fade-in"><div className="mb-8"><h2 className="text-3xl font-bold text-gray-900">{selectedCategory ? `Categoría: ${selectedCategory}` : 'Catálogo'}</h2><p className="text-gray-500">{products.length} productos</p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">{products.length > 0 ? products.map(p => (<div key={p._id} className="bg-white rounded-3xl overflow-hidden border hover:shadow-xl transition group flex flex-col h-full"><div className="h-56 bg-gray-50 relative overflow-hidden"><img src={p.imagenes?.[0]?.url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/><div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-900 shadow-sm">{p.categoria}</div></div><div className="p-5 flex-1 flex flex-col"><h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{p.nombre}</h3><div className="mt-auto flex items-center justify-between pt-4"><div><span className="block text-xs text-gray-400 font-bold uppercase">Precio</span><span className="text-2xl font-black text-blue-900">${p.precio?.minorista?.toFixed(2)}</span></div><button onClick={() => addToCart(p)} className="bg-blue-900 text-white p-3 rounded-xl hover:bg-yellow-400 hover:text-blue-900 transition shadow-lg"><ShoppingCart size={20}/></button></div></div></div>)) : <div className="col-span-full text-center py-20 text-gray-500">No hay productos.</div>}</div></div>
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
// MODAL DE CONFIRMACIÓN DE ROL (NUEVO)
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

// --- ADMIN & BODEGA PANEL (ACTUALIZADO) ---
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

            {/* TABLA DE USUARIOS */}
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
                                            {/* AL CAMBIAR, ABRIMOS EL MODAL */}
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
            
            {/* RENDERIZAMOS EL MODAL DE CONFIRMACIÓN */}
            <RoleConfirmModal 
                isOpen={roleModalOpen} 
                onClose={() => { setRoleModalOpen(false); refreshData(); }} // Si cancela, refrescamos para que el select vuelva a su estado original
                onConfirm={confirmRoleChange} 
                targetUser={targetUser}
                newRole={pendingRole}
            />
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (<div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4"><div className={`${color} p-4 rounded-2xl text-white shadow-lg`}><Icon size={24} /></div><div><p className="text-gray-500 text-sm font-medium uppercase">{title}</p><h4 className="text-2xl font-black text-gray-900">{value}</h4></div></div>);

const OrderHistory = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    useEffect(() => { fetch(`${API_URL}/orders/me`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => { if (data.success) setOrders(data.orders); }); }, [token]);
    return <div className="max-w-4xl mx-auto animate-fade-in"><h2 className="text-3xl font-bold mb-8 flex items-center gap-3"><Package className="text-blue-900"/> Mis Pedidos</h2>{orders.length===0?<div className="text-center py-20 bg-white rounded-3xl border border-dashed"><p className="text-gray-500">Sin compras.</p></div>:<div className="space-y-6">{orders.map(o=>(<div key={o._id} className="bg-white p-6 rounded-3xl shadow-sm border"><div className="flex justify-between items-center mb-4 pb-4 border-b"><div><span className="px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700">{o.orderStatus}</span><p className="text-xs text-gray-400 mt-2">ID: {o._id}</p></div><div className="text-right"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-black text-blue-900">${o.totalPrice.toFixed(2)}</p></div></div><div className="space-y-3">{o.orderItems.map((i,k)=>(<div key={k} className="flex items-center gap-4"><div className="flex-1"><p className="font-bold text-sm">{i.nombre}</p><p className="text-xs text-gray-500">{i.cantidad} x ${i.precio}</p></div></div>))}</div></div>))}</div>}</div>;
};

// --- MAIN LAYOUT ---
export default function App() {
  const [view, setView] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  const notify = (message, type = 'info') => { setNotification({ message, type, visible: true }); };
  const addToCart = (product) => { setCart(prev => { const exists = prev.find(p => p._id === product._id); if (exists) return prev.map(p => p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p); return [...prev, { ...product, quantity: 1 }]; }); notify("Agregado al carrito", "success"); };
  const removeFromCart = (id) => setCart(prev => prev.filter(p => p._id !== id));
  const handleCategorySelect = (cat) => { setSelectedCategory(cat); setView('products'); };

  return (
    <AuthProvider>
      {notification.visible && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, visible: false })} />}
      <AppContent view={view} setView={setView} showAuth={showAuth} setShowAuth={setShowAuth} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedCategory={selectedCategory} handleCategorySelect={handleCategorySelect} notify={notify} />
    </AuthProvider>
  );
}

const AppContent = ({ view, setView, showAuth, setShowAuth, cart, addToCart, removeFromCart, searchTerm, setSearchTerm, handleCategorySelect, selectedCategory, notify }) => {
  const { user, isAuthenticated, logout } = useAuth();
  
  // --- PÁGINA DE PERFIL (EDITABLE) ---
  const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Estado del formulario
    const [formData, setFormData] = useState({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
      cedulaRuc: user?.cedulaRuc || '',
      password: '' // Solo si quiere cambiarla
    });

    // Resetear formulario si el usuario cambia (o al cancelar)
    useEffect(() => {
      setFormData({
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        email: user?.email || '', // El email usualmente no se deja editar fácil por seguridad
        telefono: user?.telefono || '',
        cedulaRuc: user?.cedulaRuc || '',
        password: ''
      });
    }, [user, isEditing]);

    const handleSave = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      // Llamamos a la función del contexto que conecta con el backend
      const result = await updateProfile({
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        cedulaRuc: formData.cedulaRuc,
        password: formData.password || undefined // Enviar undefined si está vacío
      });

      setLoading(false);

      if (result.success) {
        notify('Perfil actualizado con éxito', 'success');
        setIsEditing(false);
      } else {
        notify(result.message || 'Error al actualizar', 'error');
      }
    };

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-blue-50 text-[var(--color-gs-blue)] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
              <UserIcon size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{user.nombre} {user.apellido}</h2>
            <p className="text-gray-500 font-medium">{user.email}</p>
            <div className="mt-3">
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role==='admin'?'bg-purple-100 text-purple-700': user.role==='bodega'?'bg-orange-100 text-orange-700':'bg-blue-100 text-blue-700'}`}>
                {user.role}
              </span>
            </div>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition ${isEditing ? 'border-blue-300 bg-white focus:ring-2 ring-blue-100' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Apellido</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition ${isEditing ? 'border-blue-300 bg-white focus:ring-2 ring-blue-100' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                  value={formData.apellido}
                  onChange={e => setFormData({...formData, apellido: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Teléfono</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition ${isEditing ? 'border-blue-300 bg-white focus:ring-2 ring-blue-100' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                  value={formData.telefono}
                  onChange={e => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cédula / RUC</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition ${isEditing ? 'border-blue-300 bg-white focus:ring-2 ring-blue-100' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                  value={formData.cedulaRuc}
                  onChange={e => setFormData({...formData, cedulaRuc: e.target.value})}
                />
              </div>
            </div>

            {/* CAMPO DE CONTRASEÑA (SOLO VISIBLE EN EDICIÓN) */}
            {isEditing && (
              <div className="animate-fade-in-down pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nueva Contraseña (Opcional)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                  <input 
                    type="password" 
                    placeholder="Dejar en blanco para no cambiar"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-300 bg-white focus:ring-2 ring-blue-100 outline-none"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-3 pt-6">
              {!isEditing ? (
                <Button 
                  type="button" 
                  onClick={() => setIsEditing(true)} 
                  className="w-full"
                  variant="primary"
                >
                  <Edit size={18}/> Editar Perfil
                </Button>
              ) : (
                <>
                  <Button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="flex-1"
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                    variant="dark"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </>
              )}
            </div>

          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm/50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div onClick={() => { setView('home'); setSearchTerm(''); }} className="flex items-center gap-3 cursor-pointer"><Logo className="h-12 w-auto object-contain" /></div>
            <div className="hidden md:flex gap-1"><button onClick={() => setView('home')} className="px-5 py-2 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-100">Inicio</button><button onClick={() => setView('products')} className="px-5 py-2 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-100">Catálogo</button></div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 border focus-within:border-[var(--color-gs-blue)]"><Search className="w-4 h-4 text-gray-400 mr-2" /><input className="bg-transparent border-none outline-none text-sm w-full" placeholder="Buscar..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setView('products'); }} /></div>
             <button onClick={() => setView('cart')} className="relative p-2.5 hover:bg-gray-100 rounded-full group"><ShoppingCart size={22} className="text-gray-600 group-hover:text-blue-900" />{cart.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}</button>
             {isAuthenticated ? (
               <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                 <button onClick={() => setView('profile')} className="text-sm font-bold text-gray-900 hover:underline">{user.nombre}</button>
                 <button onClick={() => setView('my-orders')} className="p-2.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100" title="Mis Pedidos"><Package size={20}/></button>
                 {(user.role === 'admin' || user.role === 'bodega') && <button onClick={() => setView('admin')} className="p-2.5 bg-gray-100 rounded-full hover:bg-yellow-400"><BarChart3 size={20}/></button>}
                 <button onClick={logout} className="p-2.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full"><LogOut size={20}/></button>
               </div>
             ) : <Button onClick={() => setShowAuth(true)} variant="dark" className="text-sm px-6">Ingresar</Button>}
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {view === 'home' && <Home setView={setView} onCategorySelect={handleCategorySelect} addToCart={addToCart} />}
        {view === 'products' && <ProductList addToCart={addToCart} searchTerm={searchTerm} selectedCategory={selectedCategory} />}
        {view === 'cart' && <Cart cart={cart} removeFromCart={removeFromCart} setView={setView} setShowAuth={setShowAuth} notify={notify} />}
        {view === 'my-orders' && <OrderHistory />}
        {view === 'profile' && <ProfilePage />}
        {view === 'admin' && <AdminPanel token={localStorage.getItem('grafica_user') ? JSON.parse(localStorage.getItem('grafica_user')).token : ''} userRole={user?.role} notify={notify} />}
      </main>
      {showAuth && <AuthScreen onClose={() => setShowAuth(false)} onSuccess={() => notify('Sesión iniciada', 'success')} />}
    </div>
  );
};