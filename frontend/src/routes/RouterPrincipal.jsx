import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import Administracion from "../components/pages/Administracion";
import { SobreNosotros } from "../components/pages/SobreNosotros";
import { Inicio } from "../components/pages/Inicio";
import Registro from "../components/pages/Registro";
import MasInfo from "../components/pages/MasInfo";
import { Footer } from "../components/layout/Footer";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import HistorialUsuario from "../components/pages/HistorialUsuario";
import CarouselAdminManager from "../components/Administracion/CarouselAdminManager";
import Configuracion from "../components/pages/Configuracion";

export const RouterPrincipal = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/mas-info" element={<MasInfo />} />

        <Route
          path="/historial"
          element={
            <ProtectedRoute rolesPermitidos={["Usuario", "usuario_normal"]}>
              <HistorialUsuario />
            </ProtectedRoute>
          }
        />

        {/* ✅ Configuración protegida */}
        <Route
          path="/configuracion/*"
          element={
            <ProtectedRoute rolesPermitidos={["Administrador"]}>
              <Configuracion />
            </ProtectedRoute>
          }
        />

        {/* ✅ Administracion protegida */}
        <Route
          path="/administracion"
          element={
            <ProtectedRoute rolesPermitidos={["Administrador"]}>
              <Administracion />
            </ProtectedRoute>
          }
        />

        {/* ✅ Admin módulo completo */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute rolesPermitidos={["Administrador"]}>
              <Administracion />
            </ProtectedRoute>
          }
        />

        {/* ✅ Carousel opcional */}
        <Route
          path="/carrousel"
          element={
            <ProtectedRoute rolesPermitidos={["Administrador"]}>
              <CarouselAdminManager />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};
