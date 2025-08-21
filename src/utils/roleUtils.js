export const ROLES = {
  KEPALA_DESA: "kepala_desa",
  STAF: "staf",
};

export const isKepalaDesa = (role) => role === ROLES.KEPALA_DESA;
export const isStaf = (role) => role === ROLES.STAF;
