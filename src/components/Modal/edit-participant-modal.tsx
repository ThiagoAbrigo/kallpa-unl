"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal/modal";
import InputGroup from "@/components/FormElements/InputGroup";
import { participantService } from "@/services/participant.service";
import { Participant } from "@/types/participant";
import { FiSave, FiX, FiEdit3 } from "react-icons/fi";
import { Alert } from "@/components/ui-elements/alert";
import ErrorMessage from "@/components/FormElements/errormessage";

interface EditParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    participant: Participant | null;
    onSuccess: () => void;
}

export function EditParticipantModal({
    isOpen,
    onClose,
    participant,
    onSuccess,
}: EditParticipantModalProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showAlert, setShowAlert] = useState(false);
    const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");
    const [alertTitle, setAlertTitle] = useState("");
    const [alertDescription, setAlertDescription] = useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dni: "",
        phone: "",
        address: "",
        age: "",
        email: "",
    });

    useEffect(() => {
        if (participant) {
            setFormData({
                firstName: participant.firstName || "",
                lastName: participant.lastName || "",
                dni: participant.dni || "",
                phone: participant.phone || "",
                address: participant.address || "",
                age: participant.age?.toString() || "",
                email: participant.email || "",
            });
            setErrors({});
        }
    }, [participant]);

    const triggerAlert = (
        variant: "success" | "error",
        title: string,
        description: string
    ) => {
        setAlertVariant(variant);
        setAlertTitle(title);
        setAlertDescription(description);
        setShowAlert(true);

        setTimeout(() => {
            setShowAlert(false);
        }, 3000);
    };

    const clearFieldError = (field: string) => {
        setErrors((prev) => {
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        clearFieldError(name);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!participant?.id) return;

        setLoading(true);
        setErrors({});

        try {
            await participantService.updateParticipant(participant.id, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                dni: formData.dni,
                phone: formData.phone,
                address: formData.address,
                age: formData.age ? parseInt(formData.age) : undefined,
                email: formData.email,
            });

            triggerAlert(
                "success",
                "Actualizado",
                "El participante se actualizó correctamente."
            );

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (err: any) {
            if (err?.data && typeof err.data === "object") {
                setErrors(err.data);
            } else {
                triggerAlert(
                    "error",
                    "Error al actualizar",
                    err?.msg || "No se pudo actualizar el participante."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        setShowAlert(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1a222c]">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FiEdit3 size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-dark dark:text-white">
                                Editar Participante
                            </h2>
                            <p className="text-xs text-gray-500">
                                Modifica los datos del participante
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {showAlert && (
                    <div className="mb-4">
                        <Alert
                            variant={alertVariant}
                            title={alertTitle}
                            description={alertDescription}
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <InputGroup
                                label="Nombres"
                                name="firstName"
                                type="text"
                                placeholder="Ej. Juan"
                                value={formData.firstName}
                                handleChange={handleChange}
                            />
                            <ErrorMessage message={errors.firstName} />
                        </div>
                        <div className="flex-1">
                            <InputGroup
                                label="Apellidos"
                                name="lastName"
                                type="text"
                                placeholder="Ej. Pérez"
                                value={formData.lastName}
                                handleChange={handleChange}
                            />
                            <ErrorMessage message={errors.lastName} />
                        </div>
                    </div>

                    <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <InputGroup
                                label="Cédula"
                                name="dni"
                                type="text"
                                placeholder="110XXXXXXX"
                                value={formData.dni}
                                handleChange={handleChange}
                            />
                            <ErrorMessage message={errors.dni} />
                        </div>
                        <div className="w-full sm:w-24">
                            <InputGroup
                                label="Edad"
                                name="age"
                                type="number"
                                placeholder="25"
                                value={formData.age}
                                handleChange={handleChange}
                            />
                            <ErrorMessage message={errors.age} />
                        </div>
                    </div>

                    <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <InputGroup
                                label="Correo electrónico"
                                name="email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={formData.email}
                                handleChange={handleChange}
                            />
                            <ErrorMessage message={errors.email} />
                        </div>
                        <div className="flex-1">
                            <InputGroup
                                label="Teléfono"
                                name="phone"
                                type="text"
                                placeholder="0991234567"
                                value={formData.phone}
                                handleChange={handleChange}
                            />
                            <ErrorMessage message={errors.phone} />
                        </div>
                    </div>

                    <div className="mb-6">
                        <InputGroup
                            label="Dirección"
                            name="address"
                            type="text"
                            placeholder="Calle Principal 123"
                            value={formData.address}
                            handleChange={handleChange}
                        />
                        <ErrorMessage message={errors.address} />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-bold text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <FiSave size={18} />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
