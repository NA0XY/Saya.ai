import happyNormalImage from "../../../assets/happy-normal.png";
import playfulImage from "../../../assets/playful.png";
import sadImage from "../../../assets/sad.png";
import seriousImage from "../../../assets/serious.png";
import worriedImage from "../../../assets/worried.png";

export type MoodType = "neutral" | "happy" | "sad" | "anxious" | "listening" | "thinking";

export const EXPRESSION_MAP: Record<MoodType, string> = {
  neutral: happyNormalImage,
  happy: playfulImage,
  sad: sadImage,
  anxious: worriedImage,
  listening: happyNormalImage,
  thinking: happyNormalImage,
};
