// Version configuration - อัปเดตทุกครั้งที่ deploy
export const APP_VERSION = {
  major: 2,
  build: '002',
  deployTime: '09.00',
  deployDate: '9.3.2026',
};

export const getVersionString = () => {
  return `KidfastAI v.${APP_VERSION.major}-${APP_VERSION.build} ${APP_VERSION.deployTime} ${APP_VERSION.deployDate}`;
};
