/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Vibrant "Gen Z" Palette
        primary: {
          DEFAULT: "#7C3AED", // Electric Violet
          light: "#A78BFA",
          dark: "#5B21B6",
        },
        secondary: {
          DEFAULT: "#F472B6", // Hot Pink
          light: "#FBCFE8",
          dark: "#DB2777",
        },
        accent: {
          DEFAULT: "#FACC15", // Sunshine Yellow
          cyan: "#22D3EE",
          lime: "#A3E635",
        },
        dark: {
          DEFAULT: "#0F172A", // Slate 900
          card: "#1E293B",    // Slate 800
        },
        light: {
          DEFAULT: "#F8FAFC", // Slate 50
          card: "#FFFFFf",
        },
        // Legacy support (mapped to new palette to prevent crashes during migration)
        ink: "#F8FAFC",
        night: "#0F172A",
        clay: "#1E293B",
        moss: "#7C3AED", // Mapped to primary
        ember: "#F472B6", // Mapped to secondary
        lagoon: "#22D3EE",
        fog: "#F1F5F9",
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"], // Switch body to Inter for readability
      },
      boxShadow: {
        glow: "0 0 20px rgba(124, 58, 237, 0.5)",
        "glow-secondary": "0 0 20px rgba(244, 114, 182, 0.5)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)",
        "mesh": "radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)",
        "glass-gradient": "linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out infinite reverse",
        "rise": "rise 1s ease-out forwards",
        "bounce-slow": "bounce 3s infinite",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 1, boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)" },
          "50%": { opacity: .5, boxShadow: "0 0 10px rgba(124, 58, 237, 0.2)" },
        }
      }
    }
  },
  plugins: []
};
