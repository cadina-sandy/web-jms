export const historyActions = {
  editar: 'Ficha editada', abrir_edicion: 'Edición de ficha abierta',
  crear: 'Ficha creada', listar: 'Consulta del listado', ver: 'Ficha consultada', preparar_impresion: 'Preparación de impresión',
  exportar_csv: 'Descarga CSV', exportar_word: 'Descarga Word', enviar_papelera: 'Ficha enviada a papelera',
  restaurar: 'Ficha restaurada', borrar_definitivo: 'Borrado definitivo confirmado', direccion_verificada: 'Dirección verificada',
  comprobante_enviado: 'Comprobante enviado', exportar_historial: 'Descarga del historial', ver_papelera: 'Ficha de papelera consultada',
} as const;
export type HistoryAction = keyof typeof historyActions;
export const historyActors: Record<string, string> = { public: 'Formulario público', admin: 'Administración', viewer: 'Solo lectura', super: 'Admin super sayayin', system: 'Sistema' };
