import { Participant, UpdateParticipantData } from "@/types/participant";
import { get, post, put } from "@/hooks/apiUtils";

export const participantService = {
  /**
   * Crea un nuevo participante. Si es menor de edad, incluye datos del responsable.
   */
  async createParticipant(data: any) {
    const isMinor = data.age < 18 || data.type === "INICIACION";

    const payload: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      dni: data.dni,
      phone: data.phone || "",
      email: data.email || `${data.dni}@participante.local`,
      address: data.address || "",
      type: data.type,
      program: data.program,
    };

    if (isMinor) {
      payload.responsible = {
        name: data.responsibleName,
        dni: data.responsibleDni,
        phone: data.responsiblePhone,
      };
    }

    const result = await post<any, any>("/save-participants", payload);
    if (!result) return undefined;
    return result;
  },

  /**
   * Obtiene un participante por su external_id.
   */
  async getById(externalId: string): Promise<Participant | null> {
    const result = await get<any>(`/participants/${externalId}`);
    if (!result) return null;

    const found = result.data || result;
    if (found) {
      return {
        id: found.external_id || found.java_external || found.id?.toString(),
        firstName: found.firstName || found.first_name || "",
        lastName: found.lastName || found.last_name || "",
        dni: found.dni || "",
        email: found.email || "",
        phone: found.phone || found.phono || "",
        address: found.address || found.direction || "",
        age: found.age || 0,
        type: found.type || found.type_stament || "PARTICIPANTE",
        role: found.role || "USER",
        status: found.status || "ACTIVO",
        program: found.program || "",
        responsible: found.responsible
          ? {
              name: found.responsible.name || "",
              dni: found.responsible.dni || "",
              phone: found.responsible.phone || "",
            }
          : undefined,
      };
    }
    return null;
  },

  /**
   * Actualiza los datos de un participante existente.
   */
  async updateParticipant(externalId: string, data: UpdateParticipantData) {
    const result = await put<any, UpdateParticipantData>(`/participants/${externalId}`, data);
    if (!result) return undefined;
    return result;
  },

  /**
   * Obtiene todos los participantes (excluyendo administrativos, docentes admin y pasantes).
   */
  async getAll(): Promise<Participant[]> {
    const result = await get<any>("/users");
    if (!result) return [];

    const list = Array.isArray(result) ? result : result.data || [];

    return list
      .map((p: any) => ({
        id: p.external_id || p.java_external || p.id?.toString() || p.dni,
        firstName: p.firstName || p.first_name || "",
        lastName: p.lastName || p.last_name || "",
        dni: p.dni || p.identification || "",
        email: p.email || "",
        phone: p.phone || p.phono || "",
        address: p.address || p.direction || "",
        age: p.age || 0,
        type: p.type || p.type_stament || "PARTICIPANTE",
        role: p.role || "USER",
        status: p.status || "ACTIVO",
      }))
      .filter(
        (p: any) =>
          p.type !== "ADMINISTRATIVO" &&
          p.type !== "DOCENTEADMIN" &&
          p.type !== "PASANTE"
      );
  },

  /**
   * Busca un participante por su número de cédula.
   */
  async searchByDni(dni: string): Promise<Participant | null> {
    const result = await post<any, { dni: string }>("/users/search", { dni });
    if (!result) return null;

    if (result.status === "ok" && result.data) {
      return {
        id:
          result.data.external_id ||
          result.data.java_external ||
          result.data.id?.toString(),
        firstName: result.data.firstName || result.data.first_name || "",
        lastName: result.data.lastName || result.data.last_name || "",
        dni: result.data.dni || "",
        email: result.data.email || "",
        phone: result.data.phone || "",
        address: result.data.address || "",
        type: result.data.type || "PARTICIPANTE",
        status: result.data.status || "ACTIVO",
      };
    }
    return null;
  },

  /**
   * Cambia el estado de un participante (ACTIVO/INACTIVO).
   */
  async changeStatus(externalId: string, newStatus: string) {
    const result = await put<any, { status: string }>(`/users/${externalId}/status`, { status: newStatus });
    if (!result) return undefined;
    return result;
  },

  /**
   * Crea un participante de iniciación con responsable.
   */
  async createInitiation(data: any) {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      dni: data.dni,
      address: data.address || "",
      type: "INICIACION",
      responsible: {
        name: data.responsibleName,
        dni: data.responsibleDni,
        phone: data.responsiblePhone,
        relationship: data.relationship,
      },
    };

    const result = await post<any, any>("/users/initiation", payload);
    if (!result) return undefined;
    return result;
  },

  /**
   * Obtiene todos los pasantes.
   */
  async getPasantes(): Promise<Participant[]> {
    const result = await get<any>("/users");
    if (!result) return [];

    const list = Array.isArray(result) ? result : result.data || [];

    return list
      .map((p: any) => ({
        id: p.external_id || p.java_external || p.id?.toString() || p.dni,
        firstName: p.firstName || p.first_name || "",
        lastName: p.lastName || p.last_name || "",
        dni: p.dni || p.identification || "",
        email: p.email || "",
        phone: p.phone || p.phono || "",
        address: p.address || p.direction || "",
        age: p.age || 0,
        type: p.type || "PASANTE",
        role: p.role || "USER",
        status: p.status || "ACTIVO",
      }))
      .filter((p: any) => p.type === "PASANTE");
  },

  /**
   * Obtiene el conteo de participantes activos (adultos y menores).
   */
  async getActiveParticipantsCounts(): Promise<{ adult: number; minor: number }> {
    const result = await get<any>("/participants/active/count");
    if (!result) throw new Error("Error al obtener totales de participantes");
    return result.data;
  },

  /**
   * Crea un usuario/participante básico.
   */
  async create(data: any) {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      email: data.email || `${data.dni}@participante.local`,
      phone: data.phone || "",
      address: data.address || "",
      age: data.age || 0,
      type: data.type,
      password: data.password || undefined,
    };

    const result = await post<any, any>("/users", payload);
    if (!result) return undefined;
    return result;
  },
};
