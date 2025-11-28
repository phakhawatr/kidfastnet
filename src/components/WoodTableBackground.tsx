export const WoodTableBackground = () => {
  return (
    <div 
      className="fixed inset-0 -z-10"
      style={{
        background: `
          linear-gradient(90deg, 
            hsl(30, 25%, 45%) 0%, 
            hsl(30, 20%, 50%) 50%, 
            hsl(30, 25%, 45%) 100%
          )
        `
      }}
    >
      {/* Wood grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.1) 2px,
            rgba(0,0,0,0.1) 4px
          )`
        }}
      />
    </div>
  );
};
