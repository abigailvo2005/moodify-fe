// constants/routes.ts
export const ROUTES = {
  HOME: "Home",
  MOODS: "Moods",
  CONNECT_FRIENDS: "Friends",
  PROFILE: "Profile",
  LOGIN: "Login",
  REGISTER: "Register",
  CREATE_MOOD: "CreateMood",
};

export const MOOD_ICONS = [
  {
    name: "HAPPY",
    label: "Happy",
    animation: require("../../assets/happy-animation.json"),
  },
  {
    name: "SAD",
    label: "Sad",
    animation: require("../../assets/sad-animation.json"),
  },
  {
    name: "NEUTRAL",
    label: "Neutral",
    animation: require("../../assets/neutral-animation.json"),
  },
  {
    name: "EXCITED",
    label: "Excited",
    animation: require("../../assets/excited-animation.json"),
  },
  {
    name: "ANGRY",
    label: "Angry",
    animation: require("../../assets/angry-animation.json"),
  },
  {
    name: "TIRED",
    label: "Tired",
    animation: require("../../assets/tired-animation.json"),
  },
  {
    name: "SCARED",
    label: "Scared",
    animation: require("../../assets/scared-animation.json"),
  },
];
