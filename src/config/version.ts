// Version configuration - อัปเดตทุกครั้งที่ deploy
export const APP_VERSION = {
  major: 2,
  build: '001',
  deployTime: '09.15',
  deployDate: '4.12.2025',
};

export const getVersionString = () => {
  return `KidfastAI v.${APP_VERSION.major}-${APP_VERSION.build} ${APP_VERSION.deployTime} ${APP_VERSION.deployDate}`;
};
