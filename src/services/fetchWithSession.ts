function dispatchEvent(name: string, message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(name, { detail: { message } })
    );
  }
}

export async function fetchWithSession(
  input: RequestInfo,
  init?: RequestInit
) {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch (error) {
    // Solo mostrar modal de servidor caído para errores de red reales
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('NETWORK_ERROR')) {
      dispatchEvent(
        "SERVER_DOWN",
        "Error de conexión con el servidor. Verifica tu conexión a internet."
      );
    }
    throw new Error("NETWORK_ERROR");
  }

  // Log para debugging
  console.log(`[fetchWithSession] ${init?.method || 'GET'} ${input} - Status: ${response.status}`);

  if (response.status === 401 || response.status === 403) {
    let message = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
    try {
      const data = await response.clone().json();
      message = data?.msg ?? message;
    } catch { }

    dispatchEvent("SESSION_EXPIRED", message);

    throw new Error("SESSION_EXPIRED");
  }

  // Para otros errores del servidor (500, 502, etc.), no mostrar modal de mantenimiento
  // a menos que sea un error de infraestructura real
  if (!response.ok && response.status >= 500) {
    console.warn(`Server error ${response.status} for ${input}`);
  }

  return response;
}
