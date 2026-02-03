"use client";

import { useState, useEffect, useMemo } from "react";
import { userService, UserProfileData } from "@/services/user.services";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import InputGroup from "@/components/FormElements/InputGroup";
import ErrorMessage from "@/components/FormElements/errormessage";
import { Alert } from "@/components/ui-elements/alert";
import { FiEdit, FiAlertTriangle, FiUser, FiPhone, FiMapPin, FiLock } from "react-icons/fi";

const HARDCODED_ACCOUNTS = ["dev@kallpa.com", "admin@kallpa.com"];

export function PersonalInfoForm() {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<"success" | "error" | "warning">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [formData, setFormData] = useState<UserProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    password: "",
  });

  const isHardcodedAccount = useMemo(() => {
    return HARDCODED_ACCOUNTS.includes(userEmail.toLowerCase());
  }, [userEmail]);

  const triggerAlert = (
    variant: "success" | "error" | "warning",
    title: string,
    description: string,
  ) => {
    setAlertVariant(variant);
    setAlertTitle(title);
    setAlertDescription(description);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response: any = await userService.getProfile();
        
        if (response && (response.status === "success" || response.data)) {
          const profileData = response.data || response;
          const firstName = profileData.first_name || profileData.firstName || "";
          const lastName = profileData.last_name || profileData.lastName || "";
          const phone = profileData.phone || "";
          const address = profileData.address || "";
          const email = profileData.email || "";

          setUserEmail(email);
          setFormData({
            firstName,
            lastName,
            phone,
            address,
            password: "",
          });
        } else {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserEmail(parsedUser.email || "");
            setFormData({
              firstName: parsedUser.first_name || parsedUser.firstName || "",
              lastName: parsedUser.last_name || parsedUser.lastName || "",
              phone: parsedUser.phone || "",
              address: parsedUser.address || "",
              password: "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserEmail(parsedUser.email || "");
          setFormData({
            firstName: parsedUser.first_name || parsedUser.firstName || "",
            lastName: parsedUser.last_name || parsedUser.lastName || "",
            phone: parsedUser.phone || "",
            address: parsedUser.address || "",
            password: "",
          });
        }
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.password) {
      setErrors({ password: "Debes ingresar tu contraseña para guardar los cambios" });
      return;
    }

    setLoading(true);

    try {
      const response: any = await userService.updateProfile(formData);

      if (response.status === "success" || response.status === "ok") {
        const responseData = response.data || {};
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...storedUser,
          first_name: responseData.firstName || formData.firstName,
          last_name: responseData.lastName || formData.lastName,
          firstName: responseData.firstName || formData.firstName,
          lastName: responseData.lastName || formData.lastName,
          phone: responseData.phone || formData.phone,
          address: responseData.address || formData.address,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        triggerAlert("success", "Éxito", "Perfil actualizado correctamente");

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        triggerAlert("error", "Error", response.msg || "Error al actualizar perfil");
      }
    } catch (error: any) {
      console.error("Error completo:", error);
      triggerAlert(
        "error",
        "Error",
        error.response?.data?.msg || error.message || "Error al actualizar",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const firstName = parsedUser.first_name || parsedUser.firstName || "";
        const lastName = parsedUser.last_name || parsedUser.lastName || "";

        setFormData({
          firstName,
          lastName,
          phone: parsedUser.phone || "",
          address: parsedUser.address || "",
          password: "",
        });
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <ShowcaseSection
      icon={<FiEdit size={24} />}
      title="Información Personal"
      description="Actualiza tus datos personales"
    >
      {showAlert && (
        <div className="mb-4">
          <Alert
            variant={alertVariant}
            title={alertTitle}
            description={alertDescription}
          />
        </div>
      )}

      {isHardcodedAccount && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <FiAlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="font-medium text-amber-600 dark:text-amber-400">
              Cuenta de sistema
            </p>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
              Esta es una cuenta de desarrollo/administración y no puede ser editada desde aquí.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <div className="w-full sm:w-1/2">
            <InputGroup
              label="Nombre"
              name="firstName"
              type="text"
              placeholder="Tu nombre"
              value={formData.firstName}
              handleChange={handleChange}
              disabled={isHardcodedAccount}
              iconPosition="left"
              icon={<FiUser className="text-gray-400" size={18} />}
            />
          </div>

          <div className="w-full sm:w-1/2">
            <InputGroup
              label="Apellido"
              name="lastName"
              type="text"
              placeholder="Tu apellido"
              value={formData.lastName}
              handleChange={handleChange}
              disabled={isHardcodedAccount}
              iconPosition="left"
              icon={<FiUser className="text-gray-400" size={18} />}
            />
          </div>
        </div>

        <div className="mb-5.5">
          <InputGroup
            label="Teléfono"
            name="phone"
            type="text"
            placeholder="099..."
            value={formData.phone}
            handleChange={handleChange}
            disabled={isHardcodedAccount}
            iconPosition="left"
            icon={<FiPhone className="text-gray-400" size={18} />}
          />
        </div>

        <div className="mb-5.5">
          <InputGroup
            label="Dirección"
            name="address"
            type="text"
            placeholder="Tu dirección"
            value={formData.address}
            handleChange={handleChange}
            disabled={isHardcodedAccount}
            iconPosition="left"
            icon={<FiMapPin className="text-gray-400" size={18} />}
          />
        </div>

        <div className="mb-5.5">
          <InputGroup
            label="Contraseña *"
            name="password"
            type="password"
            placeholder="Ingresa tu contraseña para guardar"
            value={formData.password}
            handleChange={handleChange}
            disabled={isHardcodedAccount}
            required={!isHardcodedAccount}
            iconPosition="left"
            icon={<FiLock className="text-gray-400" size={18} />}
          />
          {errors.password && <ErrorMessage message={errors.password} />}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Requerida para sincronizar con el sistema
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-[13px] font-bold text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading || isHardcodedAccount}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}

