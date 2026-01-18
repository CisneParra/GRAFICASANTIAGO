import React from 'react';

export const Logo = ({ className = "w-10 h-10", showText = false }) => {
  return (
    <div className="flex items-center gap-2">
      {/* IMAGEN DEL LOGO REAL */}
      {/* Nota: La ruta empieza con / porque está en la carpeta 'public' */}
      <img 
        src="/logo.png" 
        alt="Logotipo Gráfica Santiago" 
        className={`${className} object-contain`} 
      />

      {/* TEXTO (Opcional) */}
      {/* Si tu logo ya tiene letras, puedes poner showText={false} donde uses el componente */}
      {showText && (
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-black text-[#0B3A5A] leading-none tracking-tight">
            Gráfica Santiago
          </h1>
          <span className="text-[10px] font-bold text-[#FFC300] tracking-[0.2em] uppercase bg-[#0B3A5A] px-1 rounded-sm w-fit mt-0.5">
            Imprenta & Suministros
          </span>
        </div>
      )}
    </div>
  );
};