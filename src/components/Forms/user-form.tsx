"use client";
import React, { useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "../FormElements/select";
import { FiSave } from "react-icons/fi";
import { userService } from "@/services/user.services";
import { CreateUserRequest } from "@/types/user";
import { Alert } from "@/components/ui-elements/alert";

export const UserForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    phone: "",
    email: "",
    password: "",
    role: "" as "DOCENTE" | "PASANTE" | "",
  });

  // errores por campo
  const [errors, setErrors] = useState<Record<string, string>>({});

  // alert general
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    description: "",
  });

  const participantTypeOptions = [
    { value: "", label: "Seleccione un tipo" },
    { value: "DOCENTE", label: "Docente" },
    { value: "PASANTE", label: "Pasante" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // limpia error del campo al escribir
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setShowAlert(false);

    // validaciones por campo
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = "Nombres requeridos";
    if (!formData.lastName) newErrors.lastName = "Apellidos requeridos";
    if (!formData.dni || formData.dni.length < 10)
      newErrors.dni = "La cédula debe tener al menos 10 dígitos";
    if (!formData.email) newErrors.email = "Email requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Mínimo 6 caracteres";
    if (!formData.role) newErrors.role = "Debe seleccionar un rol";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload: CreateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dni: formData.dni,
        phone: formData.phone || undefined,
        email: formData.email,
        password: formData.password,
        role: formData.role as "DOCENTE" | "PASANTE",
      };

      await userService.createUser(payload);

      // si todo salió bien
      setAlertVariant("success");
      setAlertMessage({
        title: "Usuario creado",
        description: "El usuario se registró correctamente",
      });
      setShowAlert(true);

      // limpiar formulario
      setFormData({
        firstName: "",
        lastName: "",
        dni: "",
        phone: "",
        email: "",
        password: "",
        role: "",
      });

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error: any) {
      console.error("Error creando usuario:", error);

      setAlertVariant("error");
      setAlertMessage({
        title: "Error",
        description:
          error?.response?.data?.msg ||  // mensaje del backend si existe
          "No se pudo registrar el usuario", // fallback
      });
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }


  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="flex items-center justify-between border-b px-7 py-6">
        <h3 className="text-2xl font-bold">Registro de Cuenta</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6.5 space-y-4">
        {/* alert */}
        {showAlert && (
          <Alert
            variant={alertVariant}
            title={alertMessage.title}
            description={alertMessage.description}
          />
        )}

        <InputGroup
          label="Nombres"
          name="firstName"
          type="text"
          placeholder="Ej. Juan"
          value={formData.firstName}
          handleChange={handleChange}
        />
        {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}

        <InputGroup
          label="Apellidos"
          name="lastName"
          type="text"
          placeholder="Ej. Pérez"
          value={formData.lastName}
          handleChange={handleChange}
        />
        {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}

        <InputGroup
          label="Cédula"
          name="dni"
          type="text"
          placeholder="110XXXXXXX"
          value={formData.dni}
          handleChange={handleChange}
        />
        {errors.dni && <p className="text-xs text-red-500">{errors.dni}</p>}

        <InputGroup
          label="Email"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          handleChange={handleChange}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}

        <InputGroup
          label="Password"
          name="password"
          type="password"
          placeholder="******"
          value={formData.password}
          handleChange={handleChange}
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}

        <Select
          name="role"
          label="Rol"
          placeholder="Seleccione un rol"
          items={participantTypeOptions}
          value={formData.role}
          onChange={handleChange}
          className="w-full"
        />
        {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3 font-bold text-white"
        >
          <FiSave />
          Registrar Cuenta
        </button>
      </form>
    </div>
  );
};
